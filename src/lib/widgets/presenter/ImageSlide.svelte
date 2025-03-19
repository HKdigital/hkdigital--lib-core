<script>
  import { ImageBox } from '$lib/widgets/index.js';

  /**
   * @type {{
   *   imageMeta?: import('@hkdigital/lib-sveltekit/config/typedef.js').ImageMeta | import('@hkdigital/lib-sveltekit/config/typedef.js').ImageMeta[],
   *   slideDuration?: number,
   *   nextSlideLabel?: string,
   *   presenter?: { gotoSlide: (name: string) => void, getCurrentSlideName: () => string },
   *   getLoadingController?: () => { loaded: () => void, cancel: () => void }
   *   [attr: string]: any
   * }}
   */
  let {
    imageMeta,
    slideDuration = 1000,
    nextSlideLabel,
    presenter,
    getLoadingController,
    ...attrs
  } = $props();

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

  let timer;

  $effect(() => {
    if (show && nextSlideLabel && !timer) {
      timer = setTimeout(() => {
        presenter.gotoSlide(nextSlideLabel);
      }, slideDuration);
    }

    return () => {
      clearTimeout(timer);
    };
  });
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
