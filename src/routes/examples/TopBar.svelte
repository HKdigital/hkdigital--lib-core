<script>
  import { enhance } from '$app/forms';

  import { Panel } from '$lib/ui/primitives.js';

  /**
   * @type {{
   *   scalingEnabled: boolean,
   *   onchange?: (enabled: boolean) => void
   * }}
   */
  let { scalingEnabled = $bindable(), onchange } = $props();
</script>

<div class="examples-top-bar" data-component="top-bar">
  <div class="container">
    <h1 class="type-heading-h2">Examples</h1>
    
    <form 
      method="POST" 
      action="?/toggleScaling" 
      use:enhance={({ formData, cancel }) => {
        const newValue = formData.get('scalingEnabled') === 'on';
        scalingEnabled = newValue;
        onchange?.(newValue);
        
        return async ({ result }) => {
          if (result.type === 'success') {
            // Force page reload to apply scaling changes
            window.location.reload();
          }
        };
      }}
    >
      <label class="scaling-toggle">
        <input 
          type="checkbox" 
          name="scalingEnabled" 
          bind:checked={scalingEnabled}
          onchange={(e) => e.target.form.requestSubmit()}
        />
        <span class="type-ui-sm">Enable Design Scaling</span>
      </label>
    </form>
  </div>
</div>

<style src="./topbar.css"></style>
