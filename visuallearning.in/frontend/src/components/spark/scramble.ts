const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

/**
 * Decode `el`'s text from random glyphs, left to right. Each word is held at
 * its final width while it scrambles, so the lines never re-wrap. Returns a
 * function that stops early and restores the text. `el` must have no
 * React-managed children.
 */
export function scramble(el: HTMLElement, text: string, duration = 950): () => void {
  el.textContent = "";
  const words = text.split(" ");
  const spans = words.map((word, i) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    span.style.whiteSpace = "nowrap";
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    return span;
  });
  // Lock each word to the width of its real letters.
  for (const span of spans) span.style.width = `${span.getBoundingClientRect().width}px`;

  const total = text.replace(/ /g, "").length;
  let index = 0;
  const settle = words.map((word) =>
    [...word].map(() => {
      const at = (index++ / Math.max(1, total)) * 0.62 + Math.random() * 0.38;
      return at;
    }),
  );
  const start = performance.now();
  let raf = 0;
  const finish = () => {
    cancelAnimationFrame(raf);
    el.textContent = text;
  };
  const tick = (now: number) => {
    const p = (now - start) / duration;
    let done = true;
    words.forEach((word, w) => {
      let out = "";
      [...word].forEach((ch, c) => {
        if (p >= settle[w][c] || !/[A-Za-z0-9]/.test(ch)) out += ch;
        else {
          done = false;
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      });
      spans[w].textContent = out;
    });
    if (done) finish();
    else raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return finish;
}
