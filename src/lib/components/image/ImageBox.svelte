<script>
	import { onMount } from 'svelte';

	import { ImageLoader } from '$lib/classes/svelte/image/index.js';

	/**
	 * @example
	 * import { ImageBox } from '/path/to/ImageBox/index.js';
	 *
	 * // @note 'as=metadata' is set by the preset
	 * import NeonLightsOff from '$lib/img/NeonLightsOff.jpg?preset=gradient';
	 *
   * <!-- Example that fits in an outer-box -->
   *
   * <div class="outer-box">
   *   <ImageBox image={ArmyGreen} fit="contain" position="center center" />
   * </div>
   *
   * <!-- Examples that has have width, height or aspect set -->
   *
   * <ImageBox
   *   image={ArmyGreen}
   *   fit="contain"
   *   position="center center"
   *   width="w-[200px]"
   *   height="h-[200px]"
   *   classes="border-8 border-green-500"
   * />
   *
   * <ImageBox
   *   image={ArmyGreen}
   *   fit="contain"
   *   position="center center"
   *   width="w-[200px]"
   *   aspect="aspect-square"
   *   classes="border-8 border-green-500"
   * />
   *
   * <ImageBox
   *   image={ArmyGreen}
   *   fit="contain"
   *   position="center center"
   *   height="h-[200px]"
   *   aspect="aspect-square"
   *   classes="border-8 border-green-500"
   * />
   *
   * <!-- Or hack it using !important -->
   *
   * <ImageBox
   *   image={ArmyGreen}
   *   fit="contain"
   *   position="center center"
   *   classes="!w-[200px] !h-[200px] border-8 border-green-500"
   * />
	 */

	/**
   * @typedef {import('./typedef.js').ObjectFit} ObjectFit
   * @typedef {import('./typedef.js').ObjectPosition} ObjectPosition
   *
   * @typedef {import('$lib/classes/svelte/network-loader/typedef.js').LoadingProgress} LoadingProgress
   *
   * @typedef {import('$lib/config/typedef.js').ImageMeta} ImageMeta
   *
   * @typedef {Object} Props
   * @property {string} [base] - Base styling class
   * @property {string} [bg] - Background styling class
   * @property {string} [classes] - Additional CSS classes
   * @property {string} [width] - Width of the image container
   * @property {string} [height] - Height of the image container
   * @property {string} [aspect] - Aspect ratio of the image container
   * @property {string} [overflow] - Overflow behavior
   * @property {ObjectFit} [fit] - Object-fit property
   * @property {ObjectPosition} [position] - Object-position property
   * @property {ImageMeta|ImageMeta[]} image - Image metadata or array of image metadata
   * @property {string} [alt] - Alternative text for the image
   * @property {() => LoadingProgress} [onProgress] - Progress callback function
   * @property {*} [attr] - Additional arbitrary attributes
   */

	/** @type {Props} */
	let {
		// Style
		base,
		bg,
		classes,
		width,
		height,
    aspect,
		overflow = 'overflow-clip',

    // Fitting and positioning of image in its container
		fit = 'contain',
		position = 'left top',

    // Image meta
		image,

		alt = '',

		// Attributes
		...attrs
	} = $props();

	// let show = $state(false);

	/** @type {HTMLDivElement|undefined} */
	let imgBoxElem = $state();

	/** @type {HTMLImageElement|undefined} */
	let imgElem = $state();

	let aspectStyle = $state('');

	// > Loading

	let metaWidth = $state(0);
	let metaHeight = $state(0);

	let singleImage = $state();

	$effect(() => {
		if (image instanceof Array && image[0]) {
			throw new Error('Responsive image is not supported (yet)');
		} else if (typeof image === 'object') {
			// expect image.src
			// expect image.width
			// expect image.height
			singleImage = image;
		}
	});

	$effect(() => {
		//
		// Set meta width and height
		//
		if (singleImage) {
			if (singleImage.width) {
				metaWidth = singleImage.width;
			}

			if (singleImage.height) {
				metaHeight = singleImage.height;
			}
		}
	});

	/** @type {ImageLoader|undefined} */
	let imageLoader = $state();

	/** @type {string|null} */
	let objectUrl = $state(null);

	$effect(() => {
		//
		// Create image loader
		//
		if (singleImage.src && !imageLoader) {
			const url = singleImage.src;
			imageLoader = new ImageLoader({ url });
		}
	});

	$effect(() => {
		//
		// Start loading if imageLoader is in state 'initial'
		//
		// TODO: implement lazy flag
		//
		if (imageLoader?.initial) {
			imageLoader.load();
		}
	});

	$effect(() => {
		//
		// Get objectUrl when the image has finished loading
		//
		if (imageLoader.loaded) {
			// @ts-ignore
			objectUrl = imageLoader.getObjectURL();
		}

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
				objectUrl = null;
			}
		};
	});

	$effect(() => {
		console.log('classes', classes);
	});
</script>

<div
	data-image-box
	bind:this={imgBoxElem}
	class="{base} {bg} {aspect} {overflow} {width} {height} {classes}"
	style:--fit={fit}
	style:--pos={position}
	style:aspect-ratio={aspectStyle}
	style:width={width || (height && aspect) ? undefined : '100%'}
	style:height={height || (width && aspect) ? undefined : '100%'}
	{...attrs}
>
	{#if metaWidth && metaHeight}
		<img src={objectUrl} {alt} width={metaWidth} height={metaHeight} />
	{/if}
</div>

<style>
	[data-image-box] {
		max-width: 100%;
		max-height: 100%;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		object-fit: var(--fit);
		object-position: var(--pos);
	}
</style>
