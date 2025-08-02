<script>
  import { ImageBox } from '$lib/components/index.js';

  /**
   * @type {{
   *   imageMeta?: import('$lib/media/typedef.js').ImageSource,
   *   slideDuration?: number,
   *   nextSlideLabel?: string,
   *   presenter?: { gotoSlide: (name: string) => void, getCurrentSlideName: () => string },
   *   getLoadingController?: () => { loaded: () => void, cancel: () => void }
   *   fit?: 'contain' | 'cover' | 'fill',
   *   position?: string,
   *   [attr: string]: any
   * }}
   */
  let {
    imageMeta,
    slideDuration = 1000,
    nextSlideLabel,
    presenter,
    getLoadingController,
    fit = 'cover',
    position = 'center center',
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

<div class="justify-self-stretch self-stretch grid" class:invisible={!show}>
  <ImageBox
    {imageMeta}
    {fit}
    {position}
    onProgress={progressListener}
    {...attrs}
  />
</div>
