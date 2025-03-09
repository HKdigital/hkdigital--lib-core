<script>
  import { Panel } from '$lib/components/panels/index.js';
</script>

<div class="p-20up">
  <h5 class="text-heading-h5 heading-font-family pt-10up">Light</h5>

  <div class="py-20up px-20up bg-surface-950">
    <Panel>
      <h5 class="text-heading-h5 heading-font-family pt-10up">
        This is a light panel
      </h5>
    </Panel>
  </div>

  <h5 class="text-heading-h5 heading-font-family pt-10up">Dark</h5>

  <div class="py-20up px-20up border-width-thin border-black bg-surface-50">
    <Panel variant="dark">
      <h5 class="text-heading-h5 heading-font-family text-white pt-10up">
        This is a dark panel
      </h5>
    </Panel>
  </div>
</div>
