import {
  LABEL_RUSTY,
  LABEL_ARMY_GREEN,
  LABEL_ELECTRIC_BLUE,
  LABEL_LEMON_YELLOW,
  LABEL_OPAQUE_PURPLE,
  LABEL_SUNSET_ORANGE,
  LABEL_TOMATO_RED
} from './labels.js';

import Rusty from './car-paint-picker/rusty.jpg?preset=render&responsive';

import ArmyGreen from './car-paint-picker/army-green.jpg?preset=render&responsive';
import ElectricBlue from './car-paint-picker/electric-blue.jpg?preset=render&responsive';
import LemonYellow from './car-paint-picker/lemon-yellow.jpg?preset=render&responsive';
import OpaquePurple from './car-paint-picker/opaque-purple.jpg?preset=render&responsive';
import SunsetOrange from './car-paint-picker/sunset-orange.jpg?preset=render&responsive';
import TomatoRed from './car-paint-picker/tomato-red.jpg?preset=render&responsive';

// console.log('ArmyGreen', ArmyGreen);

export const carPaintImages = {
  [LABEL_RUSTY]: Rusty,
  [LABEL_ARMY_GREEN]: ArmyGreen,
  [LABEL_ELECTRIC_BLUE]: ElectricBlue,
  [LABEL_LEMON_YELLOW]: LemonYellow,
  [LABEL_OPAQUE_PURPLE]: OpaquePurple,
  [LABEL_SUNSET_ORANGE]: SunsetOrange,
  [LABEL_TOMATO_RED]: TomatoRed
};

/* Also export as individual images */
export {
  Rusty,
  ArmyGreen,
  ElectricBlue,
  LemonYellow,
  OpaquePurple,
  SunsetOrange,
  TomatoRed
};
