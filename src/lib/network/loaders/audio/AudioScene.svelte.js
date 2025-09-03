import * as expect from '$lib/util/expect.js';

import SceneBase from '../base/SceneBase.svelte.js';
import AudioLoader from './AudioLoader.svelte.js';

/**
 * @typedef {object} SourceConfig
 * // property ...
 */

/**
 * @typedef {object} MemorySource
 * @property {string} label
 * @property {AudioLoader} audioLoader
 * @property {SourceConfig} [config]
 */

export default class AudioScene extends SceneBase {

	#targetGain = $state(1);

	#unmutedTargetGain = 1;

	muted = $derived( this.#targetGain === 0 );

	targetGain = $derived( this.#targetGain );

	/** @type {AudioContext|null} */
	#audioContext = null;

	/** {GainNode} */
	#targetGainNode = null;

	/** @type {MemorySource[]} */
	#memorySources = $state([]);


	/**
	 * Construct AudioScene
	 */
	constructor() {
		super();
	}

	/* ==== SceneBase implementation */

	/**
	 * Get the array of memory sources managed by this scene
	 *
	 * @returns {MemorySource[]}
	 */
	get sources() {
		return this.#memorySources;
	}

	/**
	 * Extract the audio loader from a source object
	 *
	 * @param {MemorySource} source
	 *
	 * @returns {AudioLoader}
	 */
	// eslint-disable-next-line no-unused-vars
	getLoaderFromSource(source) {
		return source.audioLoader;
	}

	/* ==== Source definitions */

	/**
	 * Add in-memory audio source
	 * - Uses an AudioLoader instance to load audio data from network
	 *
	 * @param {object} _
	 * @param {string} _.label
	 * @param {string} _.url
	 * @param {SourceConfig} [_.config]
	 */
	defineMemorySource({ label, url, config }) {
		expect.notEmptyString(label);
		expect.notEmptyString(url);

		const audioLoader = new AudioLoader({ url });

		this.#memorySources.push({ label, audioLoader, config });
	}

	/* ==== Resource access */

	/**
	 * Get a source that can be used to play the audio once
	 *
	 * @param {string} label
	 *
	 * @returns {Promise<AudioBufferSourceNode>}
	 */
	async getSourceNode(label) {
		// @note Gain setup
		// https://stackoverflow.com/questions/46203191/should-i-disconnect-nodes-that-cant-be-used-anymore

		const { audioLoader /*, config */ } = this.#getMemorySource(label);

		if (!audioLoader.loaded) {
			throw new Error(`Source [${label}] has not been loaded yet`);
		}

		const sourceNode = await audioLoader.getAudioBufferSourceNode(
			this.#getAudioContext()
		);

		// @ts-ignore
		sourceNode.connect(this.#getGainNode());
		// sourceNode.connect(this.#getAudioContext().destination);

		// Clean up
		sourceNode.onended = () => {
			// console.log(`Source [${label}] ended `);
			sourceNode.disconnect();
		};

		return sourceNode;
	}

	/**
 	 * Set an audio context to use
 	 *
	 * @param {AudioContext} [audioContext]
	 */
	setAudioContext( audioContext ) {
		this.#audioContext = audioContext;
	}


	/* ==== Audio specific */

	/**
	 * Set target gain (volume level) for all audio in this scene
	 * - Currently applies immediately, but "target" allows for future 
	 *   smooth transitions using Web Audio API's gain scheduling
	 * - Range: 0.0 (silence) to 1.0 (original) to 1.0+ (amplified)
	 *
	 * @param {number} value - Target gain value (0.0 to 1.0+)
	 */
	setTargetGain( value ) {
		this.#targetGain = value;

		// Set immediate
		this.#getGainNode().gain.value = value;
	}

	/**
	 * Get the current target gain (volume level)
	 *
	 * @returns {number} Target gain value (0.0 to 1.0+)
	 */
	getTargetGain()
	{
		return this.#targetGain;
	}

	/**
	 * Mute all audio in this scene
	 * - Saves current volume level for restoration
	 * - Sets target gain to 0 (silence)
	 * - Safe to call multiple times
	 */
	mute() {
		if( this.muted )
		{
			return;
		}

		this.#unmutedTargetGain = this.#targetGain;
		this.setTargetGain(0);
	}

	/**
	 * Unmute all audio in this scene
	 * - Restores volume level from before muting
	 * - Safe to call multiple times
	 * - No effect if scene is not currently muted
	 */
	unmute() {
		if( !this.muted )
		{
			return;
		}

		this.setTargetGain(this.#unmutedTargetGain);
	}

	/* ==== Internals */

	#getGainNode()
	{
		if( !this.#targetGainNode )
		{
			const audioContext = this.#getAudioContext();

			this.#targetGainNode = audioContext.createGain();
			this.#targetGainNode.connect(audioContext.destination);
			this.setTargetGain(this.#targetGain);
		}

		return this.#targetGainNode;
	}

	#getAudioContext()
	{
		if( !this.#audioContext )
		{
			this.#audioContext = new AudioContext();
		}

		return this.#audioContext;
	}

	/**
	 * Get memory source
	 *
	 * @param {string} label
	 *
	 * @returns {MemorySource}
	 */
	#getMemorySource(label) {
		for (const source of this.#memorySources) {
			if (label === source.label) {
				return source;
			}
		}

		throw new Error(`Source [${label}] has not been defined`);
	}
} // end class
