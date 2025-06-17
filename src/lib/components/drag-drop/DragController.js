/**
 * Controller for customizing drag
 * E.g. set a custom preview image
 */
export class DragController {
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
  }

  /**
   * Apply the default preview (uses the draggable element itself)
   * @returns {boolean}
   */
  applyDefaultPreview() {
    if (
      !this.dataTransfer ||
      !this.dataTransfer.setDragImage
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
