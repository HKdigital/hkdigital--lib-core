import {
  TRANSITION_CSS,
  FADE_IN,
  FADE_OUT
} from '$lib/widgets/presenter/index.js';

/** @typedef {import('$lib/widgets/presenter/typedef.js').Transition} Transition */

/** @type {Transition[]} */
export const INTRO_FADE_IN = [
  {
    type: FADE_IN,
    duration: 1000
  }
];

/** @type {Transition[]} */
export const INTRO_FADE_IN_SLIDE_UP = [
  {
    type: FADE_IN,
    duration: 1000
  },
  {
    type: TRANSITION_CSS,
    property: 'transform',
    from: 'translateY(3vw)',
    to: 'translateY(0vw)',
    duration: 1000,
    delay: 500
  }
];

/** @type {Transition[]} */
export const OUTRO_FADE_OUT = [
  {
    type: FADE_OUT,
    duration: 1000
  }
];
