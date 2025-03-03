<script>
	import { onMount } from 'svelte';

	import '../app.postcss';

	let { children } = $props();

	import { DESIGN, CLAMPING } from '$lib/design/design-config.js';

	import { rootDesignVarsHTML } from '$lib/util/design-system/index.js';
</script>

<svelte:head>
	{@html rootDesignVarsHTML(DESIGN, CLAMPING)}
</svelte:head>

{@render children()}
