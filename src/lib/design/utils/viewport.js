/**
 * Sets `data-viewport` on `<html>` based on window width, enabling
 * CSS to respond to named viewport sizes via ancestor selectors.
 *
 * Breakpoints are `{ name: minWidth }` pairs — any number of entries,
 * any names. The highest breakpoint whose minWidth is <= window.innerWidth
 * wins. Tailwind's full lineup as reference:
 *
 * ```javascript
 * { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
 * ```
 *
 * If no breakpoint with minWidth 0 is provided, `responsive: 0` is
 * added automatically so `data-viewport` is always set — even on
 * screens narrower than the smallest named breakpoint.
 *
 * Components use the viewport size via CSS:
 *
 * ```css
 * [data-component='card'][data-size='md'],
 * :is([data-viewport='md']) [data-component='card']:not([data-size]) {
 *   ...
 * }
 * ```
 *
 * @param {Object.<string, number>} breakpoints
 *   Map of viewport name to minimum pixel width.
 *
 * @returns {()=>void} Cleanup function that removes the resize listener
 */
export function enableViewportBreakpoints(breakpoints) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const hasBaseline = Object.values(breakpoints).includes(0);

  const resolved = hasBaseline
    ? breakpoints
    : { ...breakpoints, responsive: 0 };

  const sorted = Object.entries(resolved).sort(([, a], [, b]) => b - a);

  function update() {
    const w = window.innerWidth;
    const match = sorted.find(([, minWidth]) => w >= minWidth);

    if (match) {
      document.documentElement.dataset.viewport = match[0];
    } else {
      delete document.documentElement.dataset.viewport;
    }
  }

  update();
  window.addEventListener('resize', update);

  return function cleanup() {
    window.removeEventListener('resize', update);
  };
}
