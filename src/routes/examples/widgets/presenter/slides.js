/** @typedef {import('$lib/widgets/presenter/typedef.js').Transition} Transition */
import {
  TRANSITION_CSS,
  FADE_IN,
  FADE_OUT
} from '$lib/widgets/presenter/index.js';

import Hello from './slides/Hello.svelte';
import World from './slides/World.svelte';

/** @typedef {import('$lib/widgets/presenter/index.js').Slide} Slide */

export const SLIDE_HELLO = 'hello';
export const SLIDE_WORLD = 'world';

/** @type {Transition[]} */
const DEFAULT_INTRO = [
  {
    type: FADE_IN,
    duration: 500
  }
];

/** @type {Transition[]} */
const DEFAULT_OUTRO = [
  {
    type: FADE_OUT,
    duration: 1000
  }
];

/** @type {Slide[]} */
export let slides = [
  {
    name: SLIDE_HELLO,
    data: {
      component: Hello,
      props: {
        title: 'Hello',
        subtitle: 'Welcome to this presentation'
      }
    },
    intro: DEFAULT_INTRO,
    outro: DEFAULT_OUTRO
  },
  {
    name: SLIDE_WORLD,
    data: {
      component: World,
      props: {
        title: 'World',
        subtitle: 'The journey continues...'
      }
    },
    intro: DEFAULT_INTRO,
    outro: DEFAULT_OUTRO
  }
];
