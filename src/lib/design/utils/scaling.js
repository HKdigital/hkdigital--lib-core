import { clamp } from './clamp.js';

/**
 * Manages responsive design scaling by calculating and applying scale factors
 * based on container dimensions and design system requirements.
 *
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.container - The container element to apply scaling to
 * @param {Object} options.design - The base design dimensions
 * @param {number} options.design.width - The reference design width
 * @param {number} options.design.height - The reference design height
 * @param {Object} options.clamping - The min/max values for various scale factors
 * @param {Object} options.clamping.ui - UI element scaling constraints
 * @param {number} options.clamping.ui.min - Minimum UI scale factor
 * @param {number} options.clamping.ui.max - Maximum UI scale factor
 * @param {Object} options.clamping.textBase - Base text scaling constraints
 * @param {number} options.clamping.textBase.min - Minimum base text scale factor
 * @param {number} options.clamping.textBase.max - Maximum base text scale factor
 * @param {Object} options.clamping.textHeading - Heading text scaling constraints
 * @param {number} options.clamping.textHeading.min - Minimum heading text scale factor
 * @param {number} options.clamping.textHeading.max - Maximum heading text scale factor
 * @param {Object} options.clamping.textUi - UI text scaling constraints
 * @param {number} options.clamping.textUi.min - Minimum UI text scale factor
 * @param {number} options.clamping.textUi.max - Maximum UI text scale factor
 * @param {Function} [options.getDimensions] - Optional function to get width and height
 * @param {boolean} [options.useResizeObserver=true] - Whether to use ResizeObserver
 *
 * @returns {()=>void} A cleanup function that removes event listeners and observers
 */
export function enableContainerScaling({
  container,
  design,
  clamping,
  getDimensions,
  useResizeObserver = true
}) {
  if (!container) {
    throw new Error('Container element is required for enableContainerScaling');
  }

  /** @type {ResizeObserver} */
  let resizeObserver;

  /**
   * Updates CSS scale variables based on container dimensions
   * and design system constraints
   */
  function updateScaleValues() {
    try {
      let containerWidth, containerHeight;

      // Use custom dimension getter if provided
      if (typeof getDimensions === 'function') {
        const dimensions = getDimensions();
        containerWidth = dimensions.width;
        containerHeight = dimensions.height;
      } else {
        // Otherwise use container's client dimensions
        const rect = container.getBoundingClientRect();
        containerWidth = rect.width;
        containerHeight = rect.height;
      }

      // Skip update if dimensions are zero (container not visible)
      if (containerWidth <= 0 || containerHeight <= 0) {
        return;
      }

      // Calculate scale factors based on container size relative to design dimensions
      const scaleW = containerWidth / design.width;
      const scaleH = containerHeight / design.height;

      // Use the smaller scale factor to ensure content fits within container
      const scaleViewport = Math.min(scaleW, scaleH);

      // Apply clamping to different element types
      const scaleUI = clamp(clamping.ui.min, scaleViewport, clamping.ui.max);

      const scaleTextBase = clamp(
        clamping.textBase.min,
        scaleViewport,
        clamping.textBase.max
      );

      const scaleTextHeading = clamp(
        clamping.textHeading.min,
        scaleViewport,
        clamping.textHeading.max
      );

      const scaleTextUi = clamp(
        clamping.textUi.min,
        scaleViewport,
        clamping.textUi.max
      );

      // Set CSS custom properties on the container
      container.style.setProperty('--scale-w', String(scaleW));
      container.style.setProperty('--scale-h', String(scaleH));
      container.style.setProperty('--scale-viewport', String(scaleViewport));
      container.style.setProperty('--scale-ui', String(scaleUI));
      container.style.setProperty('--scale-text-base', String(scaleTextBase));
      container.style.setProperty(
        '--scale-text-heading',
        String(scaleTextHeading)
      );
      container.style.setProperty('--scale-text-ui', String(scaleTextUi));
    } catch (error) {
      console.error('Error updating container scale values:', error);
    }
  }

  // Initialize scales
  updateScaleValues();

  // Set up ResizeObserver for container resize detection
  if (useResizeObserver && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateScaleValues);
    resizeObserver.observe(container);
  } else {
    // Fallback to window resize event
    window.addEventListener('resize', updateScaleValues);
  }

  // Return cleanup function
  return function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', updateScaleValues);
    }
  };
}

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
 * @param {Object} clamping.textBase - Base text scaling constraints
 * @param {number} clamping.textBase.min - Minimum base text scale factor
 * @param {number} clamping.textBase.max - Maximum base text scale factor
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
      const scaleUI = clamp(clamping.ui.min, scaleViewport, clamping.ui.max);

      const scaleTextBase = clamp(
        clamping.textBase.min,
        scaleViewport,
        clamping.textBase.max
      );

      const scaleTextHeading = clamp(
        clamping.textHeading.min,
        scaleViewport,
        clamping.textHeading.max
      );

      const scaleTextUi = clamp(
        clamping.textUi.min,
        scaleViewport,
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
        '--scale-text-base',
        String(scaleTextBase)
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
