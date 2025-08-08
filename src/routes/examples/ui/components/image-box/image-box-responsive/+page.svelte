<script>
  import ArmyGreenResponsive from '../../../../assets/images/army-green.jpg?preset=gradient&responsive';
  import { ImageBox } from '$lib/ui/components/index.js';

  /** @type {import('$lib/network/typedef.js').LoadingProgress} */
  let progress = $state({ bytesLoaded: 0, size: 0, loaded: false });

  const handleProgress = (p) => {
    progress = p;
  };
</script>

<div class="w-full aspect-video border-4 border-blue-500 relative">
  <ImageBox
    imageSource={ArmyGreenResponsive}
    fit="contain"
    position="center center"
    classes="border-2 border-red-500"
    onProgress={handleProgress}
  />

  {#if !progress.loaded}
    <div class="absolute inset-0 flex items-center justify-center bg-black/50">
      <div class="text-white text-center">
        <div class="mb-2">Loading...</div>
        {#if progress.size > 0}
          <div>{Math.round((progress.bytesLoaded / progress.size) * 100)}%</div>
        {/if}
      </div>
    </div>
  {/if}
</div>
