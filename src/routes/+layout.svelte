<script>
	import { onMount } from 'svelte';

	import '../app.css';

	let { children, data } = $props();

	import { designTokens, designTokensToRootCssVars } from '$lib/design/index.js';

	import { Favicons, PWA, SEO } from './(meta)/index.js';
</script>

<Favicons />
<PWA />
<SEO {data} />

<svelte:head>
	{@html designTokensToRootCssVars(designTokens)}
</svelte:head>

{@render children()}
