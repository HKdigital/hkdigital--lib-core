<script>
	import { onMount } from 'svelte';

	import { ImageLoader } from '$lib/classes/svelte/image/index.js';

	import { toSingleImageMeta } from '$lib/util/image/index.js';

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
   *
   * @property {ImageMeta|ImageMeta[]} [imageMeta]
   *   Image metadata, TODO: array of image metadata for responsive image
   *
   * @property {ImageLoader} [imageLoader]
   *   Image loader
   *
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

    // Image meta data
		imageMeta,

		imageLoader,

		alt = '',

		// Attributes
		...attrs
	} = $props();

  if( !imageMeta )
  {
    throw new Error('Missing [imageMeta]');
  }

	// let show = $state(false);

	/** @type {HTMLDivElement|undefined} */
	let imgBoxElem = $state();

	/** @type {HTMLImageElement|undefined} */
	let imgElem = $state();

	let aspectStyle = $state('');

	// > Loading

	let metaWidth = $state(0);
	let metaHeight = $state(0);

	let imageMeta_ = $state();

	$effect(() => {
		if( imageMeta )
		{
			imageMeta_ = toSingleImageMeta( imageMeta );
		}
	});

	$effect(() => {
		//
		// Set meta width and height
		//
		if (imageMeta_) {
			if (imageMeta_.width) {
				metaWidth = imageMeta_.width;
			}

			if (imageMeta_.height) {
				metaHeight = imageMeta_.height;
			}
		}
	});

	/** @type {ImageLoader|undefined} */
	let imageLoader_ = $state();

	$effect( () => {
		//
		// User supplied imageLoader instead of imageMeta
		//
		if( !imageMeta && imageLoader && !imageLoader_ )
		{
			imageLoader_ = imageLoader;
			imageMeta_ = imageLoader.imageMeta;
		}
	} );

	/** @type {string|null} */
	let objectUrl = $state(null);

	$effect(() => {
		//
		// Create image loader
		//
		if (imageMeta_ && !imageLoader_) {
			imageLoader_ = new ImageLoader({ imageMeta: imageMeta_ });
		}
	});

	$effect(() => {
		//
		// Start loading if imageLoader_ is in state 'initial'
		//
		// TODO: implement lazy flag
		//
		if (imageLoader_?.initial) {
			imageLoader_.load();
		}
	});

	$effect(() => {
		//
		// Get objectUrl when the image has finished loading
		//
		if (imageLoader_.loaded) {
			// @ts-ignore
			objectUrl = imageLoader_.getObjectURL();
		}

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
				objectUrl = null;
			}
		};
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
