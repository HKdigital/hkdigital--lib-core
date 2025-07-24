<script>
  import { Star } from '@steeze-ui/heroicons';

  import { SteezeIconButton } from '$lib/primitives/buttons/index.js';
</script>

<div class="p-20up">
  <h5 class="text-heading-h5 heading-font-family pt-10up">Default</h5>

  <div class="py-20up">
    <SteezeIconButton src={Star} iconSize="sm" />
    <SteezeIconButton src={Star} iconSize="md" />
    <SteezeIconButton src={Star} iconSize="lg" />
  </div>
</div>
