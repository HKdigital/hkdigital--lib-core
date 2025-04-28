/**
 * @typedef {{
 *     type: (import('$lib/widgets/presenter/constants').TRANSITION_CSS),
 *     property: string,
 *     from: string,
 *     to: string,
 *     delay?: number
 *     duration?: number
 *     timing?: string
 * }} CssTransition
 */

/**
 * @typedef {{
 *     type: (import('$lib/widgets/presenter/constants').FADE_IN),
 *     from?: string,
 *     to?: string,
 *     delay?: number
 *     duration?: number
 *     timing?: string
 * }} FadeInTransition
 */

/**
 * @typedef {{
 *     type: (import('$lib/widgets/presenter/constants').FADE_OUT),
 *     from?: string,
 *     to?: string,
 *     delay?: number
 *     duration?: number
 *     timing?: string
 * }} FadeOutTransition
 */

/**
 * @typedef {Object} LoadController
 * @property {() => void} loaded - Function to call when loading is complete
 * @property {() => void} cancel - Function to return to the previous slide
 */

/**
 * @typedef {{
 *   stage: string,
 *   slideName: string
 * }} ListenerParams
 */

/**
 * @typedef {( params: ListenerParams) => () => void } ListenerCallback
 */

/**
 * @typedef {() => void } UnregisterFn
 */

/**
 * @typedef {Object} PresenterRef
 * @property {(name: string) => void} gotoSlide - Navigate to a slide by name
 * @property {() => string} getCurrentSlideName - Get the current slide name
 * @property {( callback: ListenerCallback ) => UnregisterFn} onBefore
 *   Register listener that is called when a slide enters state 'before'
 * @property {( callback: ListenerCallback ) => UnregisterFn} onShow
 *   Register listener that is called when a slide enters state 'show'
 */

/**
 * @typedef {CssTransition|FadeInTransition|FadeOutTransition} Transition
 */

/**
 * @typedef {{[attrs: string]: *}} SlideData
 */

/**
 * @typedef {{[attrs: string]: *}} SlideLayerLayout
 */

/**
 * @typedef {{data?:SlideData, layout?:SlideLayerLayout}} SlideLayer
 */

/**
 * @typedef {object} Slide
 * @property {string} name
 * @property {SlideData} [data]
 * @property {SlideLayer[]} [layers]
 * @property {Transition[]} [intro]
 * @property {Transition[]} [outro]
 * @property {number} [duration]
 */

/**
 * @typedef {object} Layer
 * @property {number} z
 * @property {boolean} visible
 * @property {boolean} [stageIdle]
 * @property {boolean} [stageBeforeIn]
 * @property {boolean} [stageIn]
 * @property {boolean} [stageShow]
 * @property {boolean} [stageBeforeOut]
 * @property {boolean} [stageOut]
 * @property {boolean} [stageAfter]
 * @property {Transition[]} [transitions]
 */

export default {};
