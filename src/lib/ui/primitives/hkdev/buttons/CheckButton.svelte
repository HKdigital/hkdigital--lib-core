<script>
    /**
     *
     * @type {{
     *   checked?: boolean,
     *   activeChild?: boolean,
     *   inactiveChild?: boolean,
     *   iconActiveBase?: string,
     *   classes?: string
     *   disabled?: boolean,
     *   title: string,
     *   iconInactiveBase?: string,
     *   inactiveClasses?: string,
     *   activeClasses: string,
     *   onclick?: () => void,
     *   onchange?: () => void,
     *   topic?: string,
     * }}
     */
    let {
      classes,
      checked = $bindable(false),
      iconInactiveBase = 'pointer-events-none',
      iconActiveBase = 'pointer-events-none',
      disabled = false,
      topic,
      title,
      onchange = () => {},
      inactiveChild,
      activeChild,
      activeClasses,
      inactiveClasses,
      onclick = () => {}
    } = $props();
  
  
  </script>
  
  <button
    class="variant-filled btn {classes} {checked
      ? activeClasses
      : inactiveClasses}"
  >
    {title}
    {#if checked && activeChild}
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 9L9 1M1 1L9 9"
          stroke="white"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    {/if}
  </button>
  