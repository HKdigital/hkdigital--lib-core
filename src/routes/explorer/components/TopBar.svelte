<script>
  import { enhance } from '$app/forms';

  /**
   * @type {{
   *   scalingEnabled: boolean,
   *   onchange?: (enabled: boolean) => void,
   *   crumblePath?: import('svelte').Snippet
   * }}
   */
  let { scalingEnabled = $bindable(), onchange, crumblePath } = $props();
</script>

<div class="examples-top-bar" data-component="top-bar">
  <div class="container">
    {#if crumblePath}
      <div class="crumble-path">
        {@render crumblePath()}
      </div>
    {/if}
    
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
          onchange={(e) => /** @type {HTMLInputElement} */ (e.target).form.requestSubmit()}
        />
        <span class="type-ui-sm">Enable Design Scaling</span>
      </label>
    </form>
  </div>
</div>

<style src="./topbar.css"></style>
