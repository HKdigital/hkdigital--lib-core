// lib/primitives/layout/gridLayers.utils.js

/**
 * Sets up a ResizeObserver on the target layer
 * 
 * @param {HTMLElement|null} targetLayer - The layer element to observe
 * @param {Function} onHeightChange - Callback when height changes
 * @returns {ResizeObserver|null} - The created observer or null
 */
export function setupLayerObserver(targetLayer, onHeightChange) {
  if (!targetLayer || !window.ResizeObserver) return null;

  // Create new observer
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      if (entry.target === targetLayer) {
        // Get the computed style to access margin values
        const computedStyle = window.getComputedStyle(targetLayer);
        const marginTop = parseInt(computedStyle.marginTop, 10);
        const marginBottom = parseInt(computedStyle.marginBottom, 10);

        // Calculate height including border box and margins
        let elementHeight = 0;

        if (entry.borderBoxSize) {
          const borderBoxSize = Array.isArray(entry.borderBoxSize)
            ? entry.borderBoxSize[0]
            : entry.borderBoxSize;
          elementHeight = borderBoxSize.blockSize;
        } else {
          // Fallback to getBoundingClientRect
          const rect = targetLayer.getBoundingClientRect();
          elementHeight = rect.height;
        }

        // Add margins to the height
        const totalHeight = elementHeight + marginTop + marginBottom;
        onHeightChange(totalHeight);
      }
    }
  });

  // Start observing
  observer.observe(targetLayer);
  return observer;
}

/**
 * Measures the height of the specified layer, including margins
 * 
 * @param {HTMLElement|null} container - The container to search in
 * @param {string} layerId - The data-layer attribute value to find
 * @returns {{ element: HTMLElement|null, height: number }} The element and its height
 */
export function measureTargetLayer(container, layerId) {
  if (!layerId || !container) return { element: null, height: 0 };

  const layerElement = container.querySelector(`[data-layer="${layerId}"]`);
  
  if (!layerElement) return { element: null, height: 0 };
  
  // Get the computed style to access margin values
  const computedStyle = window.getComputedStyle(layerElement);
  const marginTop = parseInt(computedStyle.marginTop, 10);
  const marginBottom = parseInt(computedStyle.marginBottom, 10);
  
  // Get the element's border box height
  const rect = layerElement.getBoundingClientRect();
  
  // Calculate total height including margins
  const height = rect.height > 0 ? rect.height + marginTop + marginBottom : 0;
  
  return { element: layerElement, height };
}
