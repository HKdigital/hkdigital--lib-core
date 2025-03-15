import Hello from '../slides/Hello.svelte';
import World from '../slides/World.svelte';

import { SLIDE_HELLO, SLIDE_WORLD } from './labels.js';
import { DEFAULT_INTRO, DEFAULT_OUTRO } from './transitions.js';

/** @typedef {import('$lib/widgets/presenter/index.js').Slide} Slide */

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
