<script>
  import { Star } from '@steeze-ui/heroicons';

  import { SteezeIcon } from '$lib/primitives/icons/index.js';
</script>

<div class="p-20up">
  <h5 class="text-heading-h5 heading-font-family pt-10up">Default (outline)</h5>

  <div class="py-20up">
    <SteezeIcon src={Star} size="sm" />
    <SteezeIcon src={Star} size="md" />
    <SteezeIcon src={Star} size="lg" />
  </div>

  <h5 class="text-heading-h5 heading-font-family pt-10up">Solid</h5>

  <div class="py-20up">
    <SteezeIcon src={Star} size="sm" theme="solid" />
    <SteezeIcon src={Star} size="md" theme="solid" />
    <SteezeIcon src={Star} size="lg" theme="solid" />
  </div>
</div>
