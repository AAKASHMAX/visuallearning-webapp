import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

/**
 * Downloadable note PDFs. The stored file (made by the gen-download-pdfs script: image pages,
 * the logo watermark and an empty footer band) is fetched from R2 and stamped for the student
 * who downloads it: their name and phone across every page and in the footer.
 */

// The R2 bucket's public address. The PDFs live under random, unlisted keys that are never sent to
// browsers or the app, so the only way to a file is the signed-in download endpoint.
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "https://pub-a5e376a89c094f4d84dc7005b0878206.r2.dev").replace(/\/+$/, "");

// The PDFs fetched most recently, so a popular chapter isn't fetched again for every student.
const recent = new Map<string, Uint8Array>();
const RECENT_LIMIT = 60 * 1024 * 1024;
let recentBytes = 0;

export async function storedPdf(key: string): Promise<Uint8Array> {
  const hit = recent.get(key);
  if (hit) {
    recent.delete(key);
    recent.set(key, hit);
    return hit;
  }
  const res = await fetch(`${R2_PUBLIC_URL}/${key}`);
  if (!res.ok) throw new Error(`Stored PDF ${key}: ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  recent.set(key, bytes);
  recentBytes += bytes.length;
  for (const [k, v] of recent) {
    if (recentBytes <= RECENT_LIMIT) break;
    recent.delete(k);
    recentBytes -= v.length;
  }
  return bytes;
}

/** Text the built-in PDF font can draw (Latin letters, digits, common symbols); anything else is dropped. */
function pdfSafe(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function studentLabel(user: { name: string; phone: string | null; email: string }) {
  const name = pdfSafe(user.name).slice(0, 40) || pdfSafe(user.email.split("@")[0]) || "Student";
  const contact = (user.phone || "").replace(/\D/g, "") || pdfSafe(user.email);
  return { name, contact };
}

const ANGLE = 28; // degrees

export async function stampForStudent(original: Uint8Array, student: { name: string; contact: string }, title: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(original);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const mark = `${student.name} \u00b7 ${student.contact}`;
  const footer = `Licensed to ${student.name} (${student.contact}) \u00b7 For personal study only, please don't share \u00b7 visuallearning.in`;
  const rad = (ANGLE * Math.PI) / 180;

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    // Across the page twice (above and below the logo in the middle), faint enough to read through.
    const size = Math.max(13, Math.min(24, (width * 0.6) / bold.widthOfTextAtSize(mark, 1)));
    const textWidth = bold.widthOfTextAtSize(mark, size);
    for (const fraction of [0.24, 0.76]) {
      const cx = width / 2;
      const cy = height * fraction;
      page.drawText(mark, {
        x: cx - (textWidth / 2) * Math.cos(rad) + (size / 3) * Math.sin(rad),
        y: cy - (textWidth / 2) * Math.sin(rad) - (size / 3) * Math.cos(rad),
        size,
        font: bold,
        color: rgb(0.3, 0.3, 0.42),
        opacity: 0.12,
        rotate: degrees(ANGLE),
      });
    }
    // The footer band the generator leaves empty at the bottom of every page.
    const maxWidth = width - 36;
    const footerSize = Math.min(6.5, (6.5 * maxWidth) / regular.widthOfTextAtSize(footer, 6.5));
    page.drawText(footer, { x: 18, y: 6, size: footerSize, font: regular, color: rgb(0.4, 0.4, 0.48) });
  }

  pdf.setTitle(pdfSafe(title) || "VisualLearning notes");
  pdf.setAuthor("VisualLearning");
  pdf.setSubject(`Licensed to ${student.name} (${student.contact})`);
  pdf.setCreator("visuallearning.in");
  pdf.setProducer("VisualLearning");
  return pdf.save();
}

/** attachment; filename="..." with a plain-ASCII fallback for older browsers. */
export function attachmentHeader(fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "'");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
