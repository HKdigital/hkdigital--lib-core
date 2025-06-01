
import { ZONE_ONE } from "./zones.js";

/** @type {import('../typedef/game-model-data.js').GameModelData[]} */
export const GAME_ITEMS =
  [
    {
      zone: ZONE_ONE,
      name: 'red',
      bg: 'red',
      boardPlacement: {
        x: 100,
        y: 100,
        w: 100,
        h: 100
      }
    },
    {
      zone: ZONE_ONE,
      name: 'blue',
      bg: 'blue',
      boardPlacement: {
        x: 250,
        y: 150,
        w: 100,
        h: 100
      }
    }
  ]
