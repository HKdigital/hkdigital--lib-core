<script>
  import { Panel } from '$lib/primitives/panels/index.js';
</script>

<div class="p-20up">
  <h5 class="text-heading-h5 heading-font-family pt-10up">Light</h5>

  <div class="py-20up px-20up bg-surface-950">
    <Panel>
      <p class="type-base-lg pt-10up">This is a light panel</p>
      <p class="type-base-md pt-10up">This is a light panel</p>
      <p class="type-base-sm pt-10up">This is a light panel</p>
    </Panel>
  </div>

  <h5 class="type-heading-h5 pt-10up">Dark</h5>

  <div class="py-20up px-20up border-width-thin border-black bg-surface-50">
    <Panel variant="dark">
      <p class="type-base-lg-dark pt-10up">This is a dark panel</p>
      <p class="type-base-md-dark pt-10up">This is a dark panel</p>
      <p class="type-base-sm-dark pt-10up">This is a dark panel</p>
    </Panel>
  </div>
</div>
