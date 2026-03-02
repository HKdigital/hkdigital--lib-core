<script>
	import { onMount } from 'svelte';

	import '../app.css';

	let { children, data } = $props();

	import { designTokens, designTokensToRootCssVars } from '$lib/design/index.js';

	import { Favicons, PWA, SEO, config } from './(meta)/index.js';
</script>

<Favicons {config} />
<PWA {config} />
<SEO {config} locale={data?.locale} />

<svelte:head>
	{@html designTokensToRootCssVars(designTokens)}
</svelte:head>

{@render children()}
