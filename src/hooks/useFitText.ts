import { useLayoutEffect, useRef } from "react";

const MIN_FONT_SIZE = 1;

/**
 * Binary-searches the largest font-size (in px) that keeps the element's
 * content box within the current viewport, then keeps it in sync on resize
 * and whenever `content` (or any extra dep, e.g. a font-family switch) changes.
 * The element must not stretch to fill its flex/grid container's cross axis
 * (e.g. `width: fit-content`) or the measured box will always equal the
 * container size.
 */
export function useFitText<T extends HTMLElement>(
  content: unknown,
  ...extraDeps: unknown[]
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    function fit() {
      if (!el) return;
      const maxFontSize = Math.max(window.innerWidth, window.innerHeight);
      let low = MIN_FONT_SIZE;
      let high = maxFontSize;
      while (low < high) {
        const mid = Math.ceil((low + high + 1) / 2);
        el.style.fontSize = `${mid}px`;
        const rect = el.getBoundingClientRect();
        const fits =
          rect.width <= window.innerWidth && rect.height <= window.innerHeight;
        if (fits) {
          low = mid;
        } else {
          high = mid - 1;
        }
      }
      el.style.fontSize = `${low}px`;
    }

    // Immediate best-effort fit so there's no flash of unsized/invisible
    // text, then re-fit once web fonts are confirmed loaded — on first
    // mount this can race ahead of custom @font-face loading, measuring
    // against fallback-font metrics and settling on the wrong size until
    // something else (e.g. a window resize) happens to re-run fit().
    fit();
    document.fonts.ready.then(() => {
      if (!cancelled) fit();
    });
    window.addEventListener("resize", fit);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, ...extraDeps]);

  return ref;
}
