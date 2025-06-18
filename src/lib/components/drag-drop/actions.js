export function activeDragOver(node, handler) {
  node.addEventListener('dragover', handler, { passive: false });

  return {
    destroy() {
      node.removeEventListener('dragover', handler, { passive: false });
    }
  };
}

export function activeTouchMove(node, handler) {
  node.addEventListener('touchmove', handler, { passive: false });
  return {
    destroy() {
      node.removeEventListener('touchmove', handler, { passive: false });
    }
  };
}
