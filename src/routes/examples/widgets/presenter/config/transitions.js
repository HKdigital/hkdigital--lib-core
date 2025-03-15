import {
  TRANSITION_CSS,
  FADE_IN,
  FADE_OUT
} from '$lib/widgets/presenter/index.js';

/** @typedef {import('$lib/widgets/presenter/typedef.js').Transition} Transition */

/** @type {Transition[]} */
export const DEFAULT_INTRO = [
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
export const DEFAULT_OUTRO = [
  {
    type: FADE_OUT,
    duration: 1000
  }
];
