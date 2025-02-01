<script>
	import { ImageLoader } from '$lib/classes/svelte/image/index.js';
	import { ImageVariantsLoader } from '$lib/classes/svelte/image/index.js';
	import { toSingleImageMeta } from '$lib/util/image/index.js';

	/**
	 * @type {{
	 *   base?: string,
	 *   bg?: string,
	 *   classes?: string,
	 *   width?: string,
	 *   height?: string,
	 *   aspect?: string,
	 *   overflow?: string,
	 *   fit?: 'contain' | 'cover' | 'fill',
	 *   position?: string,
	 *   imageMeta: import('$lib/config/typedef.js').ImageMeta | import('$lib/config/typedef.js').ImageMeta[],
	 *   imageLoader?: import('$lib/classes/svelte/image/index.js').ImageLoader,
	 *   alt?: string,
	 *   onProgress?: (progress: import('$lib/classes/svelte/network-loader/typedef.js').LoadingProgress) => void,
	 *   [attr: string]: any
	 * }}
	 */
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

		// Image data
		imageMeta,
		imageLoader,

		// Accessibility
		alt = '',

		// Events
		onProgress,

		// Additional attributes
		...attrs
	} = $props();

	if (!imageMeta) {
		throw new Error('Missing [imageMeta]');
	}

	/** @type {HTMLDivElement|undefined} */
	let containerElem = $state();

	let imageMeta_ = $state();
	let variantsLoader = $state();
	let variantObjectUrl = $state(null);
	let objectUrl = $state(null);

	// For single image meta
	let metaWidth = $state(0);
	let metaHeight = $state(0);

	/** @type {ImageLoader|undefined} */
	let imageLoader_ = $state();

	$effect(() => {
		// Setup variants loader for responsive images
		if (Array.isArray(imageMeta) && !imageLoader && !variantsLoader) {
			variantsLoader = new ImageVariantsLoader(imageMeta, {
				devicePixelRatio: window.devicePixelRatio
			});
		}
		// Handle single image meta
		else if (imageMeta && !variantsLoader) {
			imageMeta_ = toSingleImageMeta(imageMeta);
		}
	});

	// Handle progress reporting
	$effect(() => {
		if (!onProgress) return;

		// Report progress from variants loader
		if (variantsLoader) {
			onProgress(variantsLoader.progress);
		}
		// Report progress from single image loader
		else if (imageLoader_) {
			onProgress(imageLoader_.progress);
		}
	});

	$effect(() => {
		if (imageMeta_) {
			metaWidth = imageMeta_.width ?? 0;
			metaHeight = imageMeta_.height ?? 0;
		}
	});

	$effect(() => {
		if (!imageMeta && imageLoader && !imageLoader_) {
			imageLoader_ = imageLoader;
			imageMeta_ = imageLoader.imageMeta;
		}
	});

	$effect(() => {
		if (imageMeta_ && !imageLoader_) {
			imageLoader_ = new ImageLoader({ imageMeta: imageMeta_ });
		}
	});

	$effect(() => {
		if (imageLoader_?.initial) {
			imageLoader_.load();
		}
	});

	$effect(() => {
		if (imageLoader_?.loaded) {
			objectUrl = imageLoader_.getObjectURL();
		}

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
				objectUrl = null;
			}
		};
	});

	$effect(() => {
		if (!containerElem || !variantsLoader) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				variantsLoader.updateOptimalImageMeta({
					containerWidth: width,
					containerHeight: height,
					fit
				});
			}
		});

		resizeObserver.observe(containerElem);
		return () => resizeObserver.disconnect();
	});

	$effect(() => {
		if (variantsLoader?.loaded) {
			variantObjectUrl = variantsLoader.getObjectURL();
		}

		return () => {
			if (variantObjectUrl) {
				URL.revokeObjectURL(variantObjectUrl);
				variantObjectUrl = null;
			}
		};
	});
</script>

<div
	data-image="box"
	bind:this={containerElem}
	class="{base} {bg} {aspect} {overflow} {width} {height} {classes}"
	style:--fit={fit}
	style:--pos={position}
	style:width={width || (height && aspect) ? undefined : '100%'}
	style:height={height || (width && aspect) ? undefined : '100%'}
	{...attrs}
>
	{#if variantsLoader?.loaded && variantObjectUrl}
		<img
			src={variantObjectUrl}
			{alt}
			width={variantsLoader.variant.width}
			height={variantsLoader.variant.height}
		/>
	{:else if objectUrl && metaWidth && metaHeight}
		<img src={objectUrl} {alt} width={metaWidth} height={metaHeight} />
	{/if}
</div>

<style>
	[data-image='box'] {
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
