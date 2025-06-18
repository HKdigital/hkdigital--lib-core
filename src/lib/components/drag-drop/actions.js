
export function activeDragOver(node, handler) {
  node.addEventListener('dragover', handler, { passive: false });

  return {
    destroy() {
      node.removeEventListener('dragover', handler, { passive: false });
    }
  };
}
