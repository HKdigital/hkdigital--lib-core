<script>
	import { onMount } from 'svelte';

	import '../app.css';

	let { children } = $props();

	import { designTokens, designTokensToRootCssVars } from '$lib/design/index.js';
</script>

<svelte:head>
	{@html designTokensToRootCssVars(designTokens)}
</svelte:head>

{@render children()}
