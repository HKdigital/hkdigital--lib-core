let currentDrag = $state(null);

export function useDragState() {
  return {
    get current() { return currentDrag; },
    
    start(item, source, group) {
      currentDrag = { item, source, group };
    },
    
    end() {
      currentDrag = null;
    },
    
    isDragging() {
      return currentDrag !== null;
    }
  };
}
