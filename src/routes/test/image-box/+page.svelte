<script>
	import { onMount, untrack } from 'svelte';

	import ArmyGreen from '../img/army-green.jpg?preset=gradient';

	// console.log(ArmyGreen);

	import ElectricBlue from '../img/electric-blue.jpg?preset=gradient';

	console.log(ElectricBlue);

	import ImageBox from '$lib/components/image/ImageBox.svelte';
</script>

<!-- Example that fits in an outer-box -->

<div class="outer-box">
	<ImageBox image={ArmyGreen} fit="contain" position="center center" />
</div>

<!-- Examples that has have width, height or aspect set -->

<ImageBox
	image={ArmyGreen}
	fit="contain"
	position="center center"
	width="w-[200px]"
	height="h-[200px]"
	classes="border-8 border-green-500"
/>

<ImageBox
	image={ArmyGreen}
	fit="contain"
	position="center center"
	width="w-[200px]"
	aspect="aspect-square"
	classes="border-8 border-green-500"
/>

<ImageBox
	image={ArmyGreen}
	fit="contain"
	position="center center"
	height="h-[200px]"
	aspect="aspect-square"
	classes="border-8 border-green-500"
/>

<!-- Or hack it using !important -->

<ImageBox
	image={ArmyGreen}
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
