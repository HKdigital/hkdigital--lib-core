
import { ZONE_ONE, ZONE_TWO } from "./zones.js";

/** @type {import('../typedef/game-model-data.js').GameModelData[]} */
export const GAME_ITEMS =
  [
    {
      zone: ZONE_ONE,
      name: 'red',
      bg: 'red',
      boardPlacement: {
        x: 100,
        y: 25,
        w: 100,
        h: 100
      }
    },
    {
      zone: ZONE_TWO,
      name: 'blue',
      bg: 'blue',
      boardPlacement: {
        x: 250,
        y: 25,
        w: 100,
        h: 100
      }
    }
  ]
