const DEFAULT_WIDTHS = [1920, 1536, 1024, 640];

const DEFAULT_THUMBNAIL_WIDTH = 150;

const FAVICON_SIZES = [
  16,  // classic browser tab icon
  32,  // high-resolution browser support
  48,  // Windows desktop shortcuts
  120, // iPhone older retina
  152, // iPad retina, iOS Safari bookmarks
  167, // iPad Pro
  180, // iPhone retina, iOS home screen
  192, // Android home screen, Chrome PWA
  512  // PWA application icon, Android splash
];

const APPLE_TOUCH_SIZES = [
  120, // iPhone older retina
  152, // iPad retina, iOS Safari bookmarks
  167, // iPad Pro
  180  // iPhone retina, iOS home screen
];

const DEFAULT_PRESETS = {
	default: {
		format: 'avif',
		quality: '90',
		as: 'metadata'
	},
	render: {
		format: 'jpg',
		quality: '95',
		as: 'metadata'
	},
	photo: {
		format: 'jpg',
		quality: '95',
		as: 'metadata'
	},
	gradient: {
		format: 'jpg',
		quality: '95',
		as: 'metadata'
	},
	drawing: {
		format: 'avif',
		quality: '90',
		as: 'metadata'
	},
	savedata: {
		format: 'avif',
		quality: '85',
		as: 'metadata'
	},
	blur: {
		format: 'avif',
		quality: '50',
		blur: '75',
		as: 'metadata'
	}
};

/**
 * Configures and returns a function that can be used as
 * 'resolveConfigs' parameter in imagetools config
 *
 * @param {object} [options]
 * @param {number[]} [options.widths=DEFAULT_WIDTHS]
 * @param {number} [options.thumbnailWidth=DEFAULT_THUMBNAIL_WIDTH]
 * @param {number[]} [options.faviconSizes=FAVICON_SIZES]
 * @param {number[]} [options.appleTouchSizes=APPLE_TOUCH_SIZES]
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

		// console.log('entries', entries);
		// e.g.
		// entries [
		//   [ 'apple-touch-icons', [ '' ] ],
		//   [ 'as', [ 'metadata' ] ],
		//   [ 'format', [ 'avif' ] ],
		//   [ 'quality', [ '90' ] ]
		// ]

		// @ts-ignore
		const responsiveConfig = entries.find(([key]) => key === 'responsive');

		// @ts-ignore
		const isFavicon = !!entries.find(([key]) => key === 'favicons');

		// @ts-ignore
		const isAppleTouchIcon = !!entries.find(([key]) => key === 'apple-touch-icons');
		// console.log('responsiveConfig found:', !!responsiveConfig);

		const widths = options?.widths ?? DEFAULT_WIDTHS;
		const faviconSizes = options?.faviconSizes ?? FAVICON_SIZES;
		const appleTouchSizes = options?.appleTouchSizes ?? APPLE_TOUCH_SIZES;

		// Always include the main image(s) and a thumbnail version
		const thumbnailConfig = {
			...configPairs,
			w: String(options?.thumbnailWidth ?? DEFAULT_THUMBNAIL_WIDTH)
		};

		// Handle favicons directive - generate all favicon sizes as PNG
		if (isFavicon) {
			const faviconConfigs = faviconSizes.map((w) => {
				return {
					...configPairs,
					w: String(w),
					format: 'png',
					ensureAlpha: 'true'
				};
			});
			// console.log('Returning favicon configs:', faviconConfigs);
			return faviconConfigs;
		}

		// Handle apple-touch-icons directive - generate Apple touch icon sizes as PNG

		// console.log('**** Check:isAppleTouchIcon', isAppleTouchIcon);

		if (isAppleTouchIcon) {
			const appleTouchConfigs = appleTouchSizes.map((w) => {
				return {
					...configPairs,
					w: String(w),
					format: 'png',
					ensureAlpha: 'true',
					density: '300'
				};
			});
			// console.log('**** Returning apple-touch-icon configs:', appleTouchConfigs);
			return appleTouchConfigs;
		}

		if (!responsiveConfig) {
			// Directive 'responsive' was not set => return original + thumbnail
			const originalConfig = configPairs; // No 'w' means original dimensions
			// console.log('Returning original + thumbnail configs:', [originalConfig, thumbnailConfig]);
			return [originalConfig, thumbnailConfig];
		}

		// Directive 'responsive' was set => return responsive widths + thumbnail
		const responsiveConfigs = widths.map((w) => {
			return { ...configPairs, w: String(w) };
		});
		const result = [...responsiveConfigs, thumbnailConfig];
		// console.log('Returning responsive + thumbnail configs:', result);
		return result;
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

		// @see https://github.com/JonasKruckenberg/
		//      imagetools/blob/main/docs/directives.md#metadata

		if (params.has('responsive')) {
			params.set('as', 'metadata');
		}

		// > Return metadata if directive 'favicons' is set

		if (params.has('favicons')) {
			params.set('as', 'metadata');
		}

		// > Return metadata if directive 'apple-touch-icons' is set

		if (params.has('apple-touch-icons')) {
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
