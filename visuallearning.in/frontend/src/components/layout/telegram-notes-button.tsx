// Floating "Get Free Notes" Telegram button — opens the Telegram channel.
const TELEGRAM_URL = "https://t.me/visuallearning3D";

export function TelegramNotesButton() {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get free notes — join our Telegram channel"
      className="group fixed bottom-24 right-5 z-[69] inline-flex items-center gap-2.5 rounded-full bg-white py-2 pl-4 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.24)]"
    >
      <span className="text-sm font-bold text-gray-800">Get Free Notes</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#229ED9]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
          <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
        </svg>
      </span>
    </a>
  );
}
