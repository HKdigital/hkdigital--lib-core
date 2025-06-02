// drag-state.svelte.js
import { defineStateContext } from '$lib/util/svelte/state-context/index.js';

class DragState {
  // Existing draggables map
  draggables = $state(new Map());

  // New: Registry for dropzones
  dropZones = $state(new Map());

  // Track which dropzone is currently active
  activeDropZone = $state(null);

  // Track the last active drop zone
  // - activeDropZone gets cleared by dragLeavr
  // - but we need it in 'end'
  lastActiveDropZone = null;

  /**
   * Register a dropzone
   * @param {string} zoneId
   * @param {Object} config
   * @param {string} config.zone
   * @param {string} config.group
   * @param {Function} config.accepts
   * @param {Function} config.onDragEnter
   * @param {Function} config.onDragOver
   * @param {Function} config.onDragLeave
   * @param {Function} config.onDrop
   * @param {HTMLElement} config.element
   */
  registerDropZone(zoneId, config) {
    if (this.dropZones.has(zoneId)) {
      throw new Error(`Zone [${zoneId}] is already registered`);
    }

    this.dropZones.set(zoneId, {
      ...config,
      isOver: false,
      canDrop: false
    });
  }

  /**
   * Unregister a dropzone
   * @param {string} zoneId
   */
  unregisterDropZone(zoneId) {
    if (this.activeDropZone === zoneId) {
      this.activeDropZone = null;
    }
    this.dropZones.delete(zoneId);
  }

  /**
   * Get dropzone at coordinates
   * @param {number} x
   * @param {number} y
   * @returns {Object|null}
   */
  getDropZoneAtPoint(x, y) {
    // Check all registered dropzones
    for (const [zoneId, config] of this.dropZones) {
      const rect = config.element.getBoundingClientRect();

      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        // Found a dropzone at this point
        // Check if it's the deepest one (for nested zones)
        let deepestZone = { zoneId, config, depth: 0 };

        // Check for nested dropzones
        for (const [otherId, otherConfig] of this.dropZones) {
          if (otherId === zoneId) continue;

          const otherRect = otherConfig.element.getBoundingClientRect();
          if (
            x >= otherRect.left &&
            x <= otherRect.right &&
            y >= otherRect.top &&
            y <= otherRect.bottom
          ) {
            // Check if this zone is nested inside our current zone
            if (config.element.contains(otherConfig.element)) {
              deepestZone = {
                zoneId: otherId,
                config: otherConfig,
                depth: deepestZone.depth + 1
              };
            }
          }
        }

        return { zoneId: deepestZone.zoneId, config: deepestZone.config };
      }
    }

    return null;
  }

  /**
   * Update active dropzone based on coordinates
   *
   * @param {number} x
   * @param {number} y
   * @param {DragEvent} event
   */
  updateActiveDropZone(x, y, event) {
    const dropZone = this.getDropZoneAtPoint(x, y);
    const newActiveId = dropZone?.zoneId || null;

    // Handle leave/enter transitions
    if (this.activeDropZone !== newActiveId) {
      // Leave previous zone
      if (this.activeDropZone) {
        this.lastActiveDropZone = this.activeDropZone;

        const prevConfig = this.dropZones.get(this.activeDropZone);
        if (prevConfig) {
          prevConfig.isOver = false;
          prevConfig.canDrop = false;
          prevConfig.onDragLeave?.({ event, zone: prevConfig.zone });
        }
      }

      // Enter new zone
      if (newActiveId && dropZone) {
        const dragData = this.getDraggable(event);
        const canDrop = dragData && dropZone.config.accepts(dragData);

        dropZone.config.isOver = true;
        dropZone.config.canDrop = canDrop;
        dropZone.config.onDragEnter?.({
          event,
          zone: dropZone.config.zone,
          canDrop
        });
      }

      this.activeDropZone = newActiveId;
    } else if (newActiveId) {
      // Still in the same zone, just send dragOver
      dropZone.config.onDragOver?.({ event, zone: dropZone.config.zone });
    }
  }

  /**
   * Handle drop at coordinates
   * @param {number} x
   * @param {number} y
   * @param {DragEvent} event
   */
  handleDropAtPoint(x, y, event) {
    const dropZone = this.getDropZoneAtPoint(x, y);

    if (dropZone && dropZone.config.canDrop) {
      const dragData = this.getDraggable(event);
      if (dragData) {
        // Calculate drop position relative to dropzone
        const rect = dropZone.config.element.getBoundingClientRect();
        const style = window.getComputedStyle(dropZone.config.element);

        const borderLeftWidth = parseInt(style.borderLeftWidth, 10) || 0;
        const borderTopWidth = parseInt(style.borderTopWidth, 10) || 0;

        const dropOffsetX = x - rect.left - borderLeftWidth;
        const dropOffsetY = y - rect.top - borderTopWidth;

        const dropX = dropOffsetX - (dragData.offsetX ?? 0);
        const dropY = dropOffsetY - (dragData.offsetY ?? 0);

        // Call the dropzone's drop handler
        dropZone.config.onDrop?.({
          zone: dropZone.config.zone,
          source: dragData.source,
          item: dragData.item,
          x: dropX,
          y: dropY,
          drag: dragData,
          drop: {
            offsetX: dropOffsetX,
            offsetY: dropOffsetY,
            event
          }
        });
      }
    }

    // Reset active dropzone
    this.activeDropZone = null;
  }

  /**
   * @param {string} draggableId
   * @param {import('$lib/typedef/drag.js').DragData} dragData
   */
  start(draggableId, dragData) {
    this.draggables.set(draggableId, dragData);
  }

  /**
   * @param {string} draggableId
   */
  end(draggableId) {
    this.draggables.delete(draggableId);

    // Check both current AND last active dropzone
    const zoneToNotify = this.activeDropZone || this.lastActiveDropZone;

    if (zoneToNotify) {
      const config = this.dropZones.get(zoneToNotify);
      if (config && (config.isOver || config.canDrop)) {
        config.isOver = false;
        config.canDrop = false;
        config.onDragLeave?.({
          event: new DragEvent('dragend'),
          zone: config.zone
        });
      }
    }

    this.activeDropZone = null;
    this.lastActiveDropZone = null;
  }

  /**
   * Get a drag data by draggable id
   *
   * @param {string} draggableId
   * @returns {import('$lib/typedef/drag.js').DragData|undefined}
   */
  getDraggableById(draggableId) {
    return this.draggables.get(draggableId);
  }

  /**
   * Get a drag data. Extracts draggable id from the supplied DragEvent
   *
   * @param {DragEvent} event
   *
   * @returns {Object|null} The drag data, or null for file drops
   */
  getDraggable(event) {
    // Check if this is a file drop
    if (event.dataTransfer.types.includes('Files')) {
      return null;
    }

    // Handle internal drag operations
    try {
      const jsonData = event.dataTransfer.getData('application/json');
      if (jsonData) {
        const transferData = JSON.parse(jsonData);
        const draggableId = transferData.draggableId;

        if (draggableId) {
          const dragData = this.getDraggableById(draggableId);
          if (dragData) {
            return dragData;
          }
        }
      }
    } catch (error) {
      console.error('Error getting drag data:', error);
    }

    return null;
  }

  /**
   * Get the most recently started drag operation (convenience method)
   * @returns {import('$lib/typedef/drag.js').DragData|undefined}
   */
  get current() {
    const entries = Array.from(this.draggables.entries());
    return entries.length > 0 ? entries[entries.length - 1][1] : undefined;
  }

  /**
   * @returns {boolean}
   */
  isDragging() {
    return this.draggables.size > 0;
  }
}

export const [createOrGetDragState, createDragState, getDragState] =
  defineStateContext(DragState);
