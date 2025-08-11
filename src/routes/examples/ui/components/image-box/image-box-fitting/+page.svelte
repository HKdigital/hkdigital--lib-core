<script>
	import { onMount, untrack } from 'svelte';

	import ArmyGreen from '$examples/assets/images/army-green.jpg?preset=gradient';

	import ElectricBlue from '$examples/assets/images/electric-blue.jpg?preset=gradient';

	import { TransparentLines } from '$examples/assets/images.js';

	// console.log('ElectricBlue', ElectricBlue);

	import { ImageBox } from '$lib/ui/components/index.js';
</script>

<!-- Example that fits in an outer-box -->

<div class="outer-box">
	<ImageBox imageSource={ArmyGreen} fit="contain" position="center center" />
</div>

<!-- Examples that has have width, height or aspect set -->

<ImageBox
	imageSource={ArmyGreen}
	fit="contain"
	position="center center"
	width="w-[200px]"
	height="h-[200px]"
	classes="border-8 border-green-500"
/>

<ImageBox
	imageSource={ArmyGreen}
	fit="cover"
	position="right bottom"
	width="w-[200px]"
	aspect="aspect-square"
	classes="border-8 border-green-500"
/>

<ImageBox
	imageSource={ArmyGreen}
	fit="fill"
	position="center center"
	height="h-[200px]"
	aspect="aspect-square"
	classes="border-8 border-green-500"
/>

<!-- Transparent image -->
<ImageBox
	imageSource={TransparentLines}
	fit="contain"
	position="center center"
	height="h-[200px]"
	aspect="aspect-square"
	classes="border-8 bg-blue-500 border-green-500"
/>

<!-- Or hack it using !important -->

<!-- <ImageBox
	imageSource={ArmyGreen}
	fit="contain"
	position="center center"
	classes="!w-[200px] !h-[200px] border-8 border-green-500"
/> -->

<style>
	.outer-box {
		width: 200px;
		aspect-ratio: 1/1;
		border: solid 8px red;
	}
</style>
