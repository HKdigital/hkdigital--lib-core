import { clamp } from '../css/clamp.js';

/**
 * Manages responsive design scaling by calculating and applying scale factors
 * based on viewport dimensions and design system requirements.
 *
 * @param {Object} design - The base design dimensions
 * @param {number} design.width - The reference design width
 * @param {number} design.height - The reference design height
 * @param {Object} clamping - The min/max values for various scale factors
 * @param {Object} clamping.ui - UI element scaling constraints
 * @param {number} clamping.ui.min - Minimum UI scale factor
 * @param {number} clamping.ui.max - Maximum UI scale factor
 * @param {Object} clamping.textContent - Content text scaling constraints
 * @param {number} clamping.textContent.min - Minimum content text scale factor
 * @param {number} clamping.textContent.max - Maximum content text scale factor
 * @param {Object} clamping.textHeading - Heading text scaling constraints
 * @param {number} clamping.textHeading.min - Minimum heading text scale factor
 * @param {number} clamping.textHeading.max - Maximum heading text scale factor
 * @param {Object} clamping.textUi - UI text scaling constraints
 * @param {number} clamping.textUi.min - Minimum UI text scale factor
 * @param {number} clamping.textUi.max - Maximum UI text scale factor
 *
 * @returns {()=>void} A cleanup function that removes the event listener
 */
export function enableScalingUI(design, clamping) {
  /**
   * Updates CSS scale variables based on current viewport dimensions
   * and design system constraints
   */
  function updateScaleValues() {
    try {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Calculate scale factors based on viewport size relative to design dimensions
      const scaleW = vw / design.width;
      const scaleH = vh / design.height;

      // Use the smaller scale factor to ensure content fits within viewport
      const scaleViewport = Math.min(scaleW, scaleH);

      // Apply clamping to different element types
      const scaleUI = clamp(scaleViewport, clamping.ui.min, clamping.ui.max);

      const scaleTextContent = clamp(
        scaleViewport,
        clamping.textContent.min,
        clamping.textContent.max
      );

      const scaleTextHeading = clamp(
        scaleViewport,
        clamping.textHeading.min,
        clamping.textHeading.max
      );

      const scaleTextUi = clamp(
        scaleViewport,
        clamping.textUi.min,
        clamping.textUi.max
      );

      // Set CSS custom properties for use in the design system
      document.documentElement.style.setProperty('--scale-w', String(scaleW));
      document.documentElement.style.setProperty('--scale-h', String(scaleH));
      document.documentElement.style.setProperty(
        '--scale-viewport',
        String(scaleViewport)
      );
      document.documentElement.style.setProperty('--scale-ui', String(scaleUI));
      document.documentElement.style.setProperty(
        '--scale-text-content',
        String(scaleTextContent)
      );
      document.documentElement.style.setProperty(
        '--scale-text-heading',
        String(scaleTextHeading)
      );
      document.documentElement.style.setProperty(
        '--scale-text-ui',
        String(scaleTextUi)
      );
    } catch (error) {
      console.error('Error updating design scale values:', error);
    }
  }

  // Initialize scales and attach resize listener
  updateScaleValues();
  window.addEventListener('resize', updateScaleValues);

  // Return cleanup function
  return function cleanup() {
    window.removeEventListener('resize', updateScaleValues);
  };
}
