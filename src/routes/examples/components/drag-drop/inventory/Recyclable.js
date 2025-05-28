/**
 * Recyclable item class for the recycling sorter game
 */
export default class Recyclable {
  /**
   * Create a recyclable item
   * @param {Object} options - The recyclable item options
   * @param {number} options.id - Unique identifier for the item
   * @param {'plastic'|'paper'|'glass'|'waste'|'organic'} options.type - The recyclable type
   * @param {string} options.icon - Emoji icon representing the item
   */
  constructor({ id, type, icon }) {
    this.id = id;
    this.type = type;
    this.icon = icon;
  }

  /**
   * Check if this item can be recycled
   * @returns {boolean} Always returns true for recyclable items
   */
  canRecycle() {
    return true;
  }
}
