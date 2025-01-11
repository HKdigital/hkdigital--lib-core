const DEFAULT_WIDTHS = [640, 1024, 1536, 1920];

const DEFAULT_PRESETS = {
	default: {
		format: 'avif',
		quality: '90'
	},
	gradient: {
		format: 'jpg',
		quality: '95'
	},
	photo: {
		format: 'jpg',
		quality: '95'
	},
	drawing: {
		format: 'avif',
		quality: '90'
	},
	savedata: {
		format: 'avif',
		quality: '85'
	},
	blur: {
		format: 'avif',
		quality: '50',
		blur: '75'
	}
};

/**
 * Configures and returns a function that can be used as
 * 'resolveConfigs' parameter in imagetools config
 *
 * @param {object} [options]
 * @param {number[]} [options.widths=DEFAULT_WIDTHS]
 *
 * @returns {(
 *   entries: [string, string[]][]
 * ) => (Record<string, string | string[]>[])}
 */
export function generateResponseConfigs(options) {
	//
	// @see https://github.com/JonasKruckenberg/imagetools
	//      /blob/main/docs/core/src/functions/resolveConfigs.md
	//
	return function resolveConfigs(entries /*, outputFormats*/) {
		// console.log('resolveConfigs:entries', entries);

		/** @type {Record<string, string | string[]>} */
		const configPairs = {};

		for (const current of entries) {
			const key = current[0];
			const value = current[1][0];

			// @ts-ignore
			configPairs[key] = value;
		}

		// @ts-ignore
		const responsiveConfig = entries.find(([key]) => key === 'responsive');

		if (!responsiveConfig) {
			// Directive 'responsive' was not set => return original config

			return [configPairs];

			// Alternative: by returning undefined, the default resolveConfig is used
			// return undefined;
		}

		const widths = options?.widths ?? DEFAULT_WIDTHS;

		return widths.map((w) => {
			return { ...configPairs, w: String(w) };
		});
	};
}

/**
 * Configures and returns a function that can be used as
 * 'defaultDirectives' parameter in imagetools config
 *
 * - This function runs before 'resolveConfigs'
 *
 * @param {object} [options]
 * @param {number[]} [options.presets=DEFAULT_PRESETS]
 */
export function generateDefaultDirectives(options) {
	/**
	 * Function that sets a.o. format and quality directives if
	 * the 'preset' driective is set
	 *
	 * @param {URL} url
	 */
	return function defaultDirectives(url) {
		// Check the directive in the URL to determine which preset to use
		const params = url.searchParams;

		let presetName = params.get('preset');

		// > Return metadata if directive 'responsive' is set

		if (params.has('responsive')) {
			params.set('as', 'metadata');
		}
		// > Process presets

		if (presetName) {
			params.delete('preset');
		} else {
			presetName = 'default';
		}

		const presets = options?.presets || DEFAULT_PRESETS;

		// @ts-ignore
		let preset = presets[presetName];

		// console.log(`defaultDirectives [url=${url}]`, preset);

		if (!preset) {
			preset = DEFAULT_PRESETS.default;
		}

		for (const key in preset) {
			params.set(key, preset[key]);
		}

		// TODO: process directive 'w''
		// - generate only allowed widths
		// - support width presets such as 'hd'

		// let width = params.get('w');

		// if (!width) {
		// 	// Set max allowed width by default
		// 	// width = 'hd';
		// }

		// let presets = {
		//   sm: '640',
		//   md: '1024',
		//   lg: '1536',
		//   hd: '1920'
		// };

		// // @ts-ignore
		// let presetWidth = presets[width];
		// console.log({ width, presetWidth });

		// if (presetWidth) {
		//   params.set('w', presetWidth);
		// } else if (responsive || width === null) {
		//   params.set('as', 'metadata');
		//   params.delete('w');
		//   // } else if (width === null) {
		//   // 	// Set largest size is width parameter is missing
		//   // 	params.set('w', presets.hd);
		// } else {
		//   throw new Error(
		//     `Directive [w=${width}] is should be a preset value {sm,md,lg,hd,responsive}`
		//   );

		//   // let allowedWidths = new Set(['640', '1024', '1536', '1920']);
		//   // if (!allowedWidths.has(width)) {
		//   // 	throw new Error(`Width [${width}] is not in list of allowed widths`);
		//   // }
		// }

		// params.set('withoutEnlargement', 'true');

		// console.log('defaultDirectives:output params', params);

		return params;
	};
}
