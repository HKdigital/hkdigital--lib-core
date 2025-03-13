<script>
  import { ImageBox } from '$lib/widgets/index.js';

  const { ...attrs } = $props();

  // console.log('attrs:', attrs.imageMeta);

  if (!attrs.imageMeta) {
    throw new Error('Missing property [imageMeta]');
  }
</script>

<ImageBox {...attrs} />
