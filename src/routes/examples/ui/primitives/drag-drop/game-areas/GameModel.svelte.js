import {
  ZONE_ONE
} from './constants/zones.js';

/**
 * @typedef
 *   {import('./typedef/placements.js').PlacementXY}
 *   PlacementXY
 */

/**
 * @typedef
 *   {import('./typedef/placements.js').PlacementRect}
 *   PlacementRect
 */

/**
 * @typedef
 *   {import('./typedef/game-model-data.js').GameZone}
 *   GameZone
 */

/**
 * @typedef
 *   {import('./typedef/game-model-data.js').GameModelData}
 *   GameModelData
 */

/**
 * Game item data and methods
 */
export default class GameModel {

  /* Data properties */

  name;
  src;
  bg;

  boardPlacement;

  zone;

  /* State properties */

  currentZone = $state(ZONE_ONE);

  currentPlacement = $state({ x: 0, y: 0 });

  /**
   * Constructor
   *
   * @param {GameModelData} _
   */
  constructor({
    zone,
    name,
    bg,
    boardPlacement
  }) {
    this.zone = zone;
    this.currentZone = zone;

    this.name = name;
    this.bg = bg;

    this.boardPlacement = boardPlacement;

    this.currentPlacement = {...boardPlacement};
  }

  /**
   * Move item to the specified zone
   *
   * @param {object} _
   * @param {string} _.zone
   * @param {PlacementXY} _.placement
   */
  moveToZone({ zone, placement }) {
    console.debug('moveToZone', zone);

    this.currentZone = zone;
    this.currentPlacement = placement;
  }

  /**
   * Check if the item is in the specified zone
   *
   * @param {GameZone} zone
   */
  isInZone( zone ) {
    return this.currentZone === zone;
  }
}
