import * as expect from '$lib/util/expect/index.js';

import { pushNotEmpty } from '$lib/util/array/index.js';

import { TRANSITION_CSS, FADE_IN, FADE_OUT } from './constants.js';

/**
 * @typedef {import("./typedef").Transition} Transition
 */

/** ----------------------------------------------------------------- Exports */

/** ----------------------------------- Generate CSS for lists of transitions */

/**
 * Generates style and class names to be used before the transitions
 * become active
 *
 * @param {Transition[]} transitions
 *
 * @returns {{style: string, classes: string}}
 */
export function cssBefore(transitions) {
  expect.objectArray(transitions);

  /** @type {string[]} */ let propertyStyleArr = [];
  /** @type {string[]} */ let transitionStyleArr = [];
  /** @type {string[]} */ let classesArr = [];

  for (const transition of transitions) {
    const { propertyStyle, transitionStyle, classes } =
      transitionCssBefore(transition);

    pushNotEmpty(propertyStyleArr, propertyStyle);
    pushNotEmpty(transitionStyleArr, transitionStyle);
    pushNotEmpty(classesArr, classes);
  }

  let style = propertyStyleArr.join(';');

  if (transitionStyleArr.length) {
    style += `;transition: ${transitionStyleArr.join(',')}`;
  }

  // console.log('cssBefore', transitions, style);

  return { style, classes: classesArr.join() };
}

/**
 * Generates style and class names to be used when the transitions are active
 *
 * @param {Transition[]} transitions
 *
 * @returns {{style: string, classes: string}}
 */
export function cssDuring(transitions) {
  expect.objectArray(transitions);

  /** @type {string[]} */ let propertyStyleArr = [];
  /** @type {string[]} */ let transitionStyleArr = [];
  /** @type {string[]} */ let classesArr = [];

  for (const transition of transitions) {
    const { propertyStyle, transitionStyle, classes } =
      transitionCssDuring(transition);

    pushNotEmpty(propertyStyleArr, propertyStyle);
    pushNotEmpty(transitionStyleArr, transitionStyle);
    pushNotEmpty(classesArr, classes);
  } // end for

  let style = propertyStyleArr.join(';');

  if (transitionStyleArr.length) {
    style += `;transition: ${transitionStyleArr.join(',')}`;
  }

  return { style, classes: classesArr.join() };
}

/** ------------------------------------- Generate CSS for single transitions */

/**
 * Generates style and class names for specified transition for
 * the stage 'stageBeforeIn'
 *
 * @param {Transition} transition
 *
 * @returns {{propertyStyle: string, transitionStyle: string, classes: string}}
 */
export function transitionCssBefore(transition) {
  expect.objectNoArray(transition);

  let {
    type,
    // @ts-ignore
    property,
    from
  } = transition;

  let propertyStyle = '';
  let transitionStyle = '';
  let classes = '';

  switch (type) {
    case FADE_IN:
      type = TRANSITION_CSS;
      property = 'opacity';
      from = from ?? '0';
      break;

    case FADE_OUT:
      type = TRANSITION_CSS;
      property = 'opacity';
      from = from ?? '1';
      break;
  }

  if (!type || TRANSITION_CSS === type) {
    expect.notEmptyString(property);
    expect.string(from);

    propertyStyle = `${property}: ${from}`;
  } else {
    throw new Error(`Unknown transition type [${type}]`);
  }

  // console.log('transitionCssBefore', { propertyStyle, transitionStyle });

  return { propertyStyle, transitionStyle, classes };
}

/**
 * Generates style and class names for specified transition for
 * the stage 'stageIn'
 *
 * @param {Transition} transition
 *
 * @returns {{propertyStyle: string, transitionStyle: string, classes: string}}
 */
export function transitionCssDuring(transition) {
  expect.objectNoArray(transition);

  let {
    type,
    // @ts-ignore
    property,
    to,
    delay = 0,
    duration = 1000,
    timing = 'ease'
  } = transition;

  let propertyStyle;
  let transitionStyle;
  let classes = '';

  switch (type) {
    case FADE_IN:
      type = TRANSITION_CSS;
      property = 'opacity';
      to = to ?? '1';
      break;

    case FADE_OUT:
      type = TRANSITION_CSS;
      property = 'opacity';
      to = to ?? '0';
      break;
  }

  if (!type || TRANSITION_CSS === type) {
    expect.notEmptyString(property);
    expect.string(to);

    propertyStyle = `${property}: ${to}`;

    /* property name | duration | easing function | delay */
    transitionStyle = `${property} ${duration}ms ${timing} ${delay}ms`;
  } else {
    throw new Error(`Unknown transition type [${type}]`);
  }

  // console.log('transitionCssDuring', { propertyStyle, transitionStyle });

  return { propertyStyle, transitionStyle, classes };
}
