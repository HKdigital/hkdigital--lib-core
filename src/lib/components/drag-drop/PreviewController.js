/**
 * Controller for customizing drag preview images
 */
export class PreviewController {
  /**
   * @param {DragEvent} event - The drag event
   */
  constructor(event) {
    this.event = event;
    this.dataTransfer = event.dataTransfer;
    this.targetElement = /** @type {HTMLElement} */ (event.currentTarget);

    // Calculate natural offsets by default (to prevent "jumping")
    const rect = this.targetElement.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;

    this._previewSet = false;
  }

  /**
   * Create a preview image from the current draggable element or a specific child element
   * @param {string} [selector] - Optional CSS selector to target a specific child element
   * @returns {HTMLElement} - The created preview element
   */
  grabPreviewImage(selector = null) {
    // Find the source element (either the whole draggable or a specific child)
    const sourceElement = selector
      ? this.targetElement.querySelector(selector)
      : this.targetElement;

    if (!sourceElement) {
      console.error(`Element with selector "${selector}" not found`);
      return this.grabPreviewImage(); // Fallback to the main element
    }

    // Clone the element to create the preview
    const previewElement = /** @type {HTMLElement} */ (
      sourceElement.cloneNode(true)
    );

    // Position off-screen (needed for setDragImage to work properly)
    previewElement.style.position = 'absolute';
    previewElement.style.top = '-9999px';
    previewElement.style.left = '-9999px';

    // Add to the document temporarily
    document.body.appendChild(previewElement);

    return previewElement;
  }

  /**
   * Set a custom element as the drag preview image
   * @param {HTMLElement} element - Element to use as drag preview
   * @param {number} [offsetX] - Horizontal offset (uses natural offset if omitted)
   * @param {number} [offsetY] - Vertical offset (uses natural offset if omitted)
   * @returns {boolean} - Whether setting the preview was successful
   */
  setPreviewImage(element, offsetX, offsetY) {
    if (!this.dataTransfer || !this.dataTransfer.setDragImage) {
      return false;
    }

    // Use provided offsets or fall back to natural offsets
    const finalOffsetX = offsetX !== undefined ? offsetX : this.offsetX;
    const finalOffsetY = offsetY !== undefined ? offsetY : this.offsetY;

    try {
      this.dataTransfer.setDragImage(element, finalOffsetX, finalOffsetY);
      this._previewSet = true;
      return true;
    } catch (err) {
      console.error('Failed to set drag preview image:', err);
      return false;
    }
  }

  /**
   * Check if a custom preview has been set
   * @returns {boolean}
   */
  hasCustomPreview() {
    return this._previewSet;
  }

  /**
   * Apply the default preview (uses the draggable element itself)
   * @returns {boolean}
   */
  applyDefaultPreview() {
    if (
      !this.dataTransfer ||
      !this.dataTransfer.setDragImage ||
      this._previewSet
    ) {
      return false;
    }

    try {
      this.dataTransfer.setDragImage(
        this.targetElement,
        this.offsetX,
        this.offsetY
      );
      return true;
    } catch (err) {
      console.error('Failed to set default drag preview:', err);
      return false;
    }
  }
}
