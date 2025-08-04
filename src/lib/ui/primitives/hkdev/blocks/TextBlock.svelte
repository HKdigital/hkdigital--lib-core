<script>
    /**
     * @type {{
     *   base?: string,
     *   bg?: string,
     *   classes?: string,
     *   title?: import('svelte').Snippet,
     *   content?: import('svelte').Snippet,
     *   footer?: import('svelte').Snippet
     * } & { [attr: string]: * }}
     */
    let {
      // Style
      base,
      bg,
      classes,
  
      // Content
      title,
      content,
      footer,
  
      // Attributes
      ...attrs
    } = $props();
  </script>
  
  <div data-title-text-button-block class="{base} {bg} {classes}" {...attrs}>
    {#if title}
      <h1 class="title-box h1">
        {@render title()}
      </h1>
    {/if}
  
    {#if content}
      <div class="content-box">
        {@render content()}
      </div>
    {/if}
  
    {#if footer}
      <div class="footer-box">
        {@render footer()}
      </div>
    {/if}
  </div>
  