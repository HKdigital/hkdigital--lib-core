export function activeTouchMove(node, handler) {
  node.addEventListener('touchmove', handler, { passive: false });
  return {
    destroy() {
      node.removeEventListener('touchmove', handler, { passive: false });
    }
  };
}

export function activeDragOver(node, handler) {
  node.addEventListener('dragover', handler, { passive: false });
  return {
    destroy() {
      node.removeEventListener('dragover', handler, { passive: false });
    }
  };
}

export function activeDrop(node, handler) {
  node.addEventListener('drop', handler, { passive: false });
  return {
    destroy() {
      node.removeEventListener('drop', handler, { passive: false });
    }
  };
}
