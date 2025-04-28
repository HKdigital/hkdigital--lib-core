import ImageSlide from '$lib/widgets/presenter/ImageSlide.svelte';

import {
  LABEL_RUSTY,
  LABEL_ARMY_GREEN,
  LABEL_ELECTRIC_BLUE,
  LABEL_LEMON_YELLOW,
  LABEL_OPAQUE_PURPLE,
  LABEL_SUNSET_ORANGE,
  LABEL_TOMATO_RED
} from '$lib/assets/autospuiten/labels.js';

import {
  Rusty,
  ArmyGreen,
  ElectricBlue,
  LemonYellow,
  OpaquePurple,
  SunsetOrange,
  TomatoRed
} from '$lib/assets/autospuiten/car-paint-picker.js';

import { INTRO_FADE_IN_SLIDE_UP, OUTRO_FADE_OUT } from './transitions.js';

/** @typedef {import('$lib/widgets/presenter/index.js').Slide} Slide */

/** @type {Slide[]} */
export let slides = [
  {
    name: LABEL_RUSTY,
    data: {
      component: ImageSlide,
      props: {
        imageMeta: Rusty
      }
    },
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
  },
  {
    name: LABEL_ARMY_GREEN,
    data: {
      component: ImageSlide,
      props: {
        imageMeta: ArmyGreen,
        fit: 'contain',
        position: 'right bottom',
        classes: 'border-8'
      }
    },
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
  },
  {
    name: LABEL_ELECTRIC_BLUE,
    data: {
      component: ImageSlide,
      props: {
        imageMeta: ElectricBlue
      }
    },
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
  },
  {
    name: LABEL_LEMON_YELLOW,
    data: {
      component: ImageSlide,
      props: {
        imageMeta: LemonYellow
      }
    },
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
  },
  {
    name: LABEL_OPAQUE_PURPLE,
    data: {
      component: ImageSlide,
      props: {
        imageMeta: OpaquePurple
      }
    },
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
  },
  {
    name: LABEL_SUNSET_ORANGE,
    data: {
      component: ImageSlide,
      props: {
        imageMeta: SunsetOrange
      }
    },
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
  },
  {
    name: LABEL_TOMATO_RED,
    data: {
      component: ImageSlide,
      props: {
        imageMeta: TomatoRed
      }
    },
    intro: INTRO_FADE_IN_SLIDE_UP,
    outro: OUTRO_FADE_OUT
  }
];
