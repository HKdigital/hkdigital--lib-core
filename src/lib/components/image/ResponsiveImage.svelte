<script>
	/** @typedef {import('$lib/config/typedef.js').ImageMeta} ImageMeta */

	import { ImageVariantsLoader } from '$lib/classes/svelte/image/index.js';

	/**
	 * @type {{
	 *   base?: string,
	 *   classes?: string
	 *   boxBase?: string,
	 *   boxClasses?: string
	 *   boxAttrs?: { [attr: string]: * },
	 *   images: ImageMeta[],
	 *   alt?: string
	 * } & { [attr: string]: * }}
	 */
	const {
		base,
		classes,
		boxBase,
		boxClasses,
		boxAttrs,

		// Functional
		images,
		alt = '',

		// Attributes
		...attrs
	} = $props();

	let variantsLoader = new ImageVariantsLoader(images);

	let containerWidth = $state(0);

	/** @type {ImageMeta|null} */
	let imageVariant = $state(null);

	$effect(() => {
		variantsLoader.updateOptimalImageMeta({ containerWidth });
	});

	// $effect(() => {
	//   console.log('imageVariant', $state.snapshot(imageVariant));
	// });

	/** @type {string|null} */
	let imageUrl = $state(null);

	$effect(() => {
		let image;

		if (variantsLoader.loaded) {
			// @ts-ignore
			imageUrl = variantsLoader.getObjectURL();
		}

		return () => {
			if (imageUrl) {
				URL.revokeObjectURL(imageUrl);
				imageUrl = null;
			}
		};
	});

	let variant = $derived(variantsLoader.variant);

	// let image = $derived(variantsLoader.image);
</script>

™
<div
	bind:clientWidth={containerWidth}
	class="{boxBase} {boxClasses}"
	{...boxAttrs}
>
	<!-- <p class="p text-white">variant: {JSON.stringify(variant)}</p> -->

	{#if variant}
		<img
			data-image="responsive"
			src={imageUrl ? imageUrl : ''}
			width={variant.width}
			height={variant.height}
			{alt}
			class="{boxBase} {boxClasses}"
			{...attrs}
		/>
	{/if}
</div>
