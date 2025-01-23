<script>
	import { onMount, untrack } from 'svelte';

	import ArmyGreen from '../assets/img/army-green.jpg?preset=gradient';

	// console.log(ArmyGreen);

	import ElectricBlue from '../assets/img/electric-blue.jpg?preset=gradient';

	console.log("ElectricBlue", ElectricBlue);

	import ImageBox from '$lib/components/image/ImageBox.svelte';
</script>

<!-- Example that fits in an outer-box -->

<div class="outer-box">
	<ImageBox imageMeta={ArmyGreen} fit="contain" position="center center" />
</div>

<!-- Examples that has have width, height or aspect set -->

<ImageBox
	imageMeta={ArmyGreen}
	fit="contain"
	position="center center"
	width="w-[200px]"
	height="h-[200px]"
	classes="border-8 border-green-500"
/>

<ImageBox
	imageMeta={ArmyGreen}
	fit="contain"
	position="center center"
	width="w-[200px]"
	aspect="aspect-square"
	classes="border-8 border-green-500"
/>

<ImageBox
	imageMeta={ArmyGreen}
	fit="contain"
	position="center center"
	height="h-[200px]"
	aspect="aspect-square"
	classes="border-8 border-green-500"
/>

<!-- Or hack it using !important -->

<ImageBox
	imageMeta={ArmyGreen}
	fit="contain"
	position="center center"
	classes="!w-[200px] !h-[200px] border-8 border-green-500"
/>

<style>
	.outer-box {
		width: 200px;
		aspect-ratio: 1/1;
		border: solid 8px red;
	}
</style>
