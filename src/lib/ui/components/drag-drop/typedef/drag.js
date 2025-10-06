/**
 * @typedef {Object} DragData
 * @property {string} draggableId
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {any} item - The item being dragged
 * @property {string} [source] - Source identifier
 * @property {string} [group] - Group identifier
 */

/**
 * @typedef {Object} SimulatedDragEvent
 * @property {'dragstart'|'dragover'|'dragleave'|'drop'|'dragend'} type
 * @property {number} clientX
 * @property {number} clientY
 * @property {Object} dataTransfer
 * @property {Array<string>} dataTransfer.types
 * @property {Function} dataTransfer.getData
 * @property {'none'|'copy'|'link'|'move'} dataTransfer.dropEffect
 * @property {'none'|'copy'|'copyLink'|'copyMove'|'link'|'linkMove'|'move'|'all'|'uninitialized'} dataTransfer.effectAllowed
 * @property {FileList|Array} dataTransfer.files
 * @property {Function} preventDefault
 * @property {Function} stopPropagation
 */

export default {}
