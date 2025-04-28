import {
  TRANSITION_CSS,
  FADE_IN,
  FADE_OUT
} from '$lib/widgets/presenter/constants.js';

/** @typedef {import('$lib/widgets/presenter/index.js').Slide} Slide */

/** @type {Slide[]} */
export let slides = [
  {
    name: 'hello',
    data: { title: 'Hello' },
    intro: [
      {
        type: TRANSITION_CSS,
        property: 'opacity',
        from: '0',
        to: '1',
        duration: 2000
      },
      {
        type: TRANSITION_CSS,
        property: 'transform',
        from: 'rotateX(180deg)',
        to: 'rotateX(0deg)',
        duration: 2000
      }
    ],
    outro: [
      {
        type: TRANSITION_CSS,
        property: 'opacity',
        from: '1',
        to: '0',
        duration: 2000
      },
      {
        type: TRANSITION_CSS,
        property: 'transform',
        from: 'rotateX(180deg)',
        to: 'rotateX(0deg)',
        duration: 2000
      }
    ]
  },
  {
    name: 'world',
    data: { title: 'World' },
    intro: [
      {
        type: FADE_IN,
        duration: 2000
      },
      {
        type: TRANSITION_CSS,
        property: 'transform',
        from: 'translateY(20px)',
        to: 'translateY(0px)',
        duration: 2000
      }
    ],
    outro: [
      {
        type: FADE_OUT,
        duration: 2000
      },
      {
        type: TRANSITION_CSS,
        property: 'transform',
        from: 'translateY(0px)',
        to: 'translateY(20px)',
        duration: 2000
      }
    ]
  }
];
