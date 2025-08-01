<script>
	import { onMount } from 'svelte';

	import '../app.css';

	let { children } = $props();

	import { DESIGN, CLAMPING } from '$lib/design/config/design-config.js';

	import { rootDesignVarsHTML } from '$lib/design/utils/root-vars.js';
</script>

<svelte:head>
	{@html rootDesignVarsHTML(DESIGN, CLAMPING)}
</svelte:head>

{@render children()}
