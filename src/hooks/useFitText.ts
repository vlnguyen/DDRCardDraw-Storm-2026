import { useLayoutEffect, useRef } from "react";

const MIN_FONT_SIZE = 1;

/**
 * Binary-searches the largest font-size (in px) that keeps the element's
 * content box within the current viewport, then keeps it in sync on resize
 * and whenever `content` changes. The element must not stretch to fill its
 * flex/grid container's cross axis (e.g. `width: fit-content`) or the
 * measured box will always equal the container size.
 */
export function useFitText<T extends HTMLElement>(content: unknown) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

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

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [content]);

  return ref;
}
