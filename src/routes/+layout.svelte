<script>
	import { onMount } from 'svelte';

	import '../app.postcss';

	let { children } = $props();

	// onMount(() => {
	// 	function updateScaleValues() {
	// 		// Same function as above
	// 		const vw = window.innerWidth;
	// 		const vh = window.innerHeight;

	// 		const scaleW = vw / 1920;
	// 		const scaleH = vh / 1080;

	// 		const scaleViewport = Math.min(scaleW, scaleH);

	// 		const scaleUI = Math.max(0.3, Math.min(scaleViewport, 2));
	// 		const scaleTextContent = Math.max(0.75, Math.min(scaleViewport, 1.5));
	// 		const scaleTextHeading = Math.max(0.75, Math.min(scaleViewport, 2.25));
	// 		const scaleTextUi = Math.max(0.5, Math.min(scaleViewport, 1.25));

	// 		document.documentElement.style.setProperty('--scale-w', String(scaleW));
	// 		document.documentElement.style.setProperty('--scale-h', String(scaleH));
	// 		document.documentElement.style.setProperty(
	// 			'--scale-viewport',
	// 			String(scaleViewport)
	// 		);
	// 		document.documentElement.style.setProperty('--scale-ui', String(scaleUI));
	// 		document.documentElement.style.setProperty(
	// 			'--scale-text-content',
	// 			String(scaleTextContent)
	// 		);
	// 		document.documentElement.style.setProperty(
	// 			'--scale-text-heading',
	// 			String(scaleTextHeading)
	// 		);
	// 		document.documentElement.style.setProperty(
	// 			'--scale-text-ui',
	// 			String(scaleTextUi)
	// 		);
	// 	}

	// 	updateScaleValues();
	// 	window.addEventListener('resize', updateScaleValues);

	// 	return () => {
	// 		window.removeEventListener('resize', updateScaleValues);
	// 	};
	// });

	import { DESIGN, CLAMPING } from '$lib/design-system/design-config.js';

	import { rootDesignVarsHTML } from '$lib/util/css/design-system.js';
</script>

<svelte:head>
	{@html rootDesignVarsHTML(DESIGN, CLAMPING)}
</svelte:head>

{@render children()}
