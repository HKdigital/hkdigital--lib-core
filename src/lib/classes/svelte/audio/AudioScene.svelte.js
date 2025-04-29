import * as expect from '$lib/util/expect/index.js';

import {
	LoadingStateMachine,
	STATE_INITIAL,
	STATE_LOADING,
	STATE_UNLOADING,
	STATE_LOADED,
	STATE_CANCELLED,
	STATE_ERROR,
	LOAD,
	// CANCEL,
	ERROR,
	LOADED,
	UNLOAD,
	INITIAL
} from '$lib/classes/svelte/loading-state-machine/index.js';

import AudioLoader from '$lib/classes/svelte/audio/AudioLoader.svelte.js';

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

export default class AudioScene {
	#state = new LoadingStateMachine();

	// @note this exported state is set by $effect's
	state = $state(STATE_INITIAL);

	// @note this exported state is set by $effect's
	loaded = $derived.by(() => {
		return this.state === STATE_LOADED;
	});

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

	#progress = $derived.by(() => {
		// console.log('update progress');

		let totalSize = 0;
		let totalBytesLoaded = 0;
		let sourcesLoaded = 0;

		const sources = this.#memorySources;
		const numberOfSources = sources.length;

		for (let j = 0; j < numberOfSources; j++) {
			const source = sources[j];
			const { audioLoader } = source;

			const { bytesLoaded, size, loaded } = audioLoader.progress;

			totalSize += size;
			totalBytesLoaded += bytesLoaded;

			if (loaded) {
				sourcesLoaded++;
			}
		} // end for

		return {
			totalBytesLoaded,
			totalSize,
			sourcesLoaded,
			numberOfSources
		};
	});

	/**
	 * Construct AudioScene
	 */
	constructor() {
		const state = this.#state;

		$effect(() => {
			if (state.current === STATE_LOADING) {
				// console.log(
				//   'progress',
				//   JSON.stringify($state.snapshot(this.#progress))
				// );

				const { sourcesLoaded, numberOfSources } = this.#progress;

				if (sourcesLoaded === numberOfSources) {
					// console.debug(`AudioScene: ${numberOfSources} sources loaded`);
					this.#state.send(LOADED);
				}
			}
		});

		$effect(() => {
			switch (state.current) {
				case STATE_LOADING:
					{
						// console.log('AudioScene:loading');
						this.#startLoading();
					}
					break;

				case STATE_UNLOADING:
					{
						// console.log('AudioScene:unloading');
						// this.#startUnLoading();
					}
					break;

				case STATE_LOADED:
					{
						// console.log('AudioScene:loaded');

						// tODO
						// this.#abortLoading = null;
					}
					break;

				case STATE_CANCELLED:
					{
						// console.log('AudioScene:cancelled');
						// TODO
					}
					break;

				case STATE_ERROR:
					{
						console.error('AudioScene:error', state.error);
					}
					break;
			} // end switch

			this.state = state.current;
		});
	}

	destroy() {
		// TODO: disconnect all audio sources?
		// TODO: Unload AUdioLoaders?
	}

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

	/**
	 * Start loading all audio sources
	 */
	load() {
		this.#state.send(LOAD);

		// FIXME: in unit test when moved to startloading it hangs!

		for (const { audioLoader } of this.#memorySources) {
			audioLoader.load();
		}
	}

	/**
 	 * Set an audio context to use
 	 *
	 * @param {AudioContext} [audioContext]
	 */
	setAudioContext( audioContext ) {
		this.#audioContext = audioContext;
	}

	async #startLoading() {
		// console.log('#startLoading');

		// FIXME: in unit test when moved to startloading it hangs!
		// for (const { audioLoader } of this.#memorySources) {
		//   audioLoader.load();
		// }
	}

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
	 * Set target gain
	 *
	 * @param {number} value
	 */
	setTargetGain( value ) {
		this.#targetGain = value;

		// Set immediate
		this.#getGainNode().gain.value = value;
	}

	/**
	 * Get the scene gain
	 *
	 * @returns {number} value
	 */
	getTargetGain()
	{
		return this.#targetGain;
	}

	mute() {
		if( this.muted )
		{
			return;
		}

		this.#unmutedTargetGain = this.#targetGain;
		this.setTargetGain(0);
	}

	unmute() {
		if( !this.muted )
		{
			return;
		}

		this.setTargetGain(this.#unmutedTargetGain);
	}


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
}
