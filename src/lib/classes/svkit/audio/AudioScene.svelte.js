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
} from '$lib/classes/svkit/loading-state-machine/index.js';

import AudioLoader from '$lib/classes/svkit/audio/AudioLoader.svelte.js';

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

	/** @type {AudioContext|null} */
	#audioContext = null;

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
	 *
	 * @param {object} _
	 * @param {AudioContext} _.audioContext
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
					console.log(`All [${numberOfSources}] sources loaded`);
					this.#state.send(LOADED);
				}
			}
		});

		$effect(() => {
			switch (state.current) {
				case STATE_LOADING:
					{
						console.log('AudioScene:loading');
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
						console.log('AudioScene:loaded');

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
						console.log('AudioScene:error', state.error);
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
	 *
	 * @param {AudioContext} audioContext
	 */
	load(audioContext) {
		this.#audioContext = audioContext;
		// console.log(123);
		this.#state.send(LOAD);

		// FIXME: in unit test when moved to startloading it hangs!

		for (const { audioLoader } of this.#memorySources) {
			audioLoader.load();
		}
	}

	async #startLoading() {
		console.log('#startLoading');

		// FIXME: in unit test when moved to startloading it hangs!
		// for (const { audioLoader } of this.#memorySources) {
		//   audioLoader.load();
		// }
	}

	/**
	 * Get a source that can be used to play the audio once
	 *
	 * @param {string} label
	 */
	async getSourceNode(label) {
		// @note Gain setup
		// https://stackoverflow.com/questions/46203191/should-i-disconnect-nodes-that-cant-be-used-anymore

		const { audioLoader /*, config */ } = this.#getMemorySource(label);

		if (!audioLoader.loaded) {
			throw new Error(`Source [${label}] has not been loaded yet`);
		}

		const sourceNode = await audioLoader.getAudioBufferSourceNode(
			// @ts-ignore
			this.#audioContext
		);

		// @ts-ignore
		sourceNode.connect(this.#audioContext.destination);

		// Clean up
		sourceNode.onended = () => {
			// console.log(`Source [${label}] ended `);
			sourceNode.disconnect();
		};

		return sourceNode;
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

	// connect
	// play

	// source.connect(audioContext.destination);
	// source.loop = true;
	// source.start();

	// /**
	//  * Get the source identified by the specified label
	//  *
	//  * @param {string} label
	//  */
	// async getBufferSourceNode(label) {
	//   // expect.notEmptyString( label );

	//   for (const source of this.#memorySources) {
	//     if (label === source.label) {
	//       if (!source.bufferSourceNode) {
	//         source.bufferSourceNode =
	//           await source.AudioLoader.transferToBufferSource(this.#audioContext);
	//       }

	//       return source.bufferSourceNode;
	//     }
	//   }
	// }

	// async connectSourceToDestination(label) {
	//   const source = await this.getBufferSourceNode(label);

	//   if (source) {
	//     source.connect(this.#audioContext.destination);
	//   }
	// }
}
