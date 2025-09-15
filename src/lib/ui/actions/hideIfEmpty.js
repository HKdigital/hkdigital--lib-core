/**
 * Hide element when it has no visible content (empty text, no images/icons)
 *
 * @param {HTMLElement} element - Element to monitor and hide when empty
 *
 * @returns {Object} Action object with destroy method for cleanup
 *
 * @example
 * When dynamicContent is empty, the div is hidden (display: none) to
 * prevent it from taking up space due to its padding.
 *
 * <div use:hideIfEmpty style="padding: 10px">{dynamicContent}</div>
 */
export function hideIfEmpty(element) {
  function hasVisibleContent() {
    // Get all text content and trim whitespace
    const textContent = element.textContent?.trim() || '';
    
    // Check for images, icons, or other non-text content
    const hasImages = element.querySelector('img, svg, [class*="icon"]');
    
    return textContent.length > 0 || hasImages;
  }

  function updateVisibility() {
    const shouldHide = !hasVisibleContent();
    element.style.display = shouldHide ? 'none' : '';
  }

  // Initial check
  updateVisibility();

  // Watch for DOM changes
  const observer = new MutationObserver(updateVisibility);
  observer.observe(element, {
    childList: true,     // Watch for added/removed child elements
    subtree: true,       // Watch all descendants
    characterData: true  // Watch for text content changes
  });

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
