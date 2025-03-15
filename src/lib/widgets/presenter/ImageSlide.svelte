<script>
  import { ImageBox } from '$lib/widgets/index.js';

  /**
   * @type {{
   *   imageMeta?: import('@hkdigital/lib-sveltekit/config/typedef.js').ImageMeta | import('@hkdigital/lib-sveltekit/config/typedef.js').ImageMeta[],
   *   presenter?: { gotoSlide: (name: string) => void, getCurrentSlideName: () => string },
   *   getLoadingController?: () => { loaded: () => void, cancel: () => void }
   *   [attr: string]: any
   * }}
   */
  let { imageMeta, presenter, getLoadingController, ...attrs } = $props();

  let show = $state(false);

  let controller = getLoadingController();

  async function progressListener(progress, id) {
    // console.log('loadingProgress', { ...progress, id });
    if (progress.loaded && !show) {
      setTimeout(() => {
        show = true;
        controller.loaded();
      }, 0);
    }
  }
</script>

<div class="absolute inset-0" class:invisible={!show}>
  <ImageBox
    {imageMeta}
    fit="cover"
    position="center center"
    onProgress={progressListener}
    {...attrs}
  />
</div>
