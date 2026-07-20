import { google } from "googleapis";
import { prisma } from "../config/prisma";

// Appends newly signed-up users to a Google Sheet so the calling team can work
// the list. Strictly append-only: rows already in the sheet are never touched,
// so any Status/Notes columns the callers add survive every sync.
//
// Env:
//   GOOGLE_SERVICE_ACCOUNT_JSON - service account key JSON (whole file, one line)
//   LEADS_SHEET_ID              - the sheet id from its URL
//   LEADS_SHEET_TAB             - optional tab name, defaults to "Leads"

const SYNC_STATE_KEY = "leads_last_sync";

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const creds = JSON.parse(raw);
  const auth = new google.auth.JWT({
    email: creds.client_email,
    // Render stores the key with literal \n sequences; turn them back into newlines.
    key: String(creds.private_key || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function getLastSync(): Promise<Date> {
  const s = await prisma.setting.findUnique({ where: { key: SYNC_STATE_KEY } });
  if (s?.value) {
    const d = new Date(s.value);
    if (!isNaN(d.getTime())) return d;
  }
  // First ever run: only take the last 7 days so we don't dump the whole user
  // table into the sheet.
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

async function setLastSync(when: Date) {
  await prisma.setting.upsert({
    where: { key: SYNC_STATE_KEY },
    update: { value: when.toISOString() },
    create: { key: SYNC_STATE_KEY, value: when.toISOString() },
  });
}

function formatIST(d: Date) {
  // Callers work in IST; keep the sheet readable rather than UTC ISO strings.
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
}

export async function syncLeadsToSheet(): Promise<{ added: number; skipped: number }> {
  const sheetId = process.env.LEADS_SHEET_ID;
  if (!sheetId) throw new Error("LEADS_SHEET_ID is not set");
  const tab = process.env.LEADS_SHEET_TAB || "Leads";

  const since = await getLastSync();
  // Cut off at "now" up front, so signups landing mid-run aren't skipped by the
  // next window.
  const until = new Date();

  const users = await prisma.user.findMany({
    where: { createdAt: { gt: since, lte: until }, role: "STUDENT" },
    orderBy: { createdAt: "asc" },
    select: { name: true, phone: true, email: true, createdAt: true },
  });

  if (users.length === 0) {
    await setLastSync(until);
    return { added: 0, skipped: 0 };
  }

  const rows = users.map((u) => [
    u.name || "",
    u.phone || "",           // blank for Google signups until we prompt for it
    u.email || "",
    formatIST(u.createdAt),
  ]);

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tab}!A:D`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  });

  // Only advance the marker once the append actually succeeded — a failed sync
  // retries the same window next hour instead of losing those signups.
  await setLastSync(until);

  const withoutPhone = rows.filter((r) => !r[1]).length;
  return { added: rows.length, skipped: withoutPhone };
}
