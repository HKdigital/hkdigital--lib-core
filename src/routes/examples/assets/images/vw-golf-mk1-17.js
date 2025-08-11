export const LABEL_RUSTY = 'rusty';
export const LABEL_ARMY_GREEN = 'army-green';
export const LABEL_ELECTRIC_BLUE = 'electric-blue';
export const LABEL_LEMON_YELLOW = 'lemon-yellow';
export const LABEL_OPAQUE_PURPLE = 'opaque-purple';
export const LABEL_SUNSET_ORANGE = 'sunset-orange';
export const LABEL_TOMATO_RED = 'tomato-red';

import Rusty from './vw-golf-mk1-17/rusty.jpg?preset=render&responsive';

import ArmyGreen from './vw-golf-mk1-17/army-green.jpg?preset=render&responsive';
import ElectricBlue from './vw-golf-mk1-17/electric-blue.jpg?preset=render&responsive';
import LemonYellow from './vw-golf-mk1-17/lemon-yellow.jpg?preset=render&responsive';
import OpaquePurple from './vw-golf-mk1-17/opaque-purple.jpg?preset=render&responsive';
import SunsetOrange from './vw-golf-mk1-17/sunset-orange.jpg?preset=render&responsive';
import TomatoRed from './vw-golf-mk1-17/tomato-red.jpg?preset=render&responsive';

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
