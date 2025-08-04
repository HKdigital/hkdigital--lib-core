import Hello from '../slides/Hello.svelte';
import World from '../slides/World.svelte';

import { SLIDE_HELLO, SLIDE_WORLD } from './labels.js';
import {
  INTRO_FADE_IN,
  INTRO_FADE_IN_SLIDE_UP,
  OUTRO_FADE_OUT
} from './transitions.js';

/** @typedef {import('$lib/ui/components/presenter/index.js').Slide} Slide */

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
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
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
    intro: INTRO_FADE_IN,
    outro: OUTRO_FADE_OUT
  }
];
