<script>
  /** @type {HTMLElement | null} */
  let container = $state(null);
  let isMouseDown = $state(false);
  let position = $state(50);

  /** @type {{
    leftContent?: import('svelte').Snippet,
    rightContent?: import('svelte').Snippet,
    classes?: string,
    dividerColor?: string,
    handleColor?: string
  } & Record<string, any>} */
  let {
    width='w-[100vw]',
    height='aspect-video',
    border='border border-surface-500',
    classes = '',
    dividerColor = 'bg-surface-500',
    handleColor = 'bg-surface-700',

    // Snippets
    leftContent,
    rightContent,
    ...attrs
  } = $props();

  const leftStyle = $derived(`clip-path: inset(0 ${100 - position}% 0 0)`);
  const rightStyle = $derived(`clip-path: inset(0 0 0 ${position}%)`);
  const dividerStyle = $derived(`left: ${position}%`);

  /**
   * Updates the position with keyboard navigation
   * @param {number} newPosition - The new position to set
   */
  function updatePosition(newPosition) {
    position = Math.max(0, Math.min(100, newPosition));
  }

  /**
   * Handles the mouse down event on the divider
   * @param {MouseEvent} event - The mouse event
   */
  function handleMouseDown(event) {
    event.preventDefault();
    isMouseDown = true;
  }

  /**
   * Updates the divider position based on mouse movement
   * @param {MouseEvent} event - The mouse event
   */
  function handleMouseMove(event) {
    if (!isMouseDown || !container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
    updatePosition((x / rect.width) * 100);
  }

  /**
   * Handles keyboard navigation for the slider
   * @param {KeyboardEvent} event - The keyboard event
   */
  function handleKeyDown(event) {
    const step = event.shiftKey ? 10 : 1;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        updatePosition(position - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        updatePosition(position + step);
        break;
      case 'Home':
        event.preventDefault();
        updatePosition(0);
        break;
      case 'End':
        event.preventDefault();
        updatePosition(100);
        break;
      case 'PageDown':
        event.preventDefault();
        updatePosition(position - 10);
        break;
      case 'PageUp':
        event.preventDefault();
        updatePosition(position + 10);
        break;
    }
  }

  /**
   * Resets the mouse down state
   */
  function handleMouseUp() {
    isMouseDown = false;
  }

  // Effect to handle document-level mouse events
  $effect(() => {
    if (isMouseDown) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });
</script>

<div
  bind:this={container}
  class="relative {width} {height} {border} {classes}"
  role="group"
  aria-label="Content comparison"
  {...attrs}
>
  <!-- Content container - both pieces of content are positioned absolutely -->
  <div class="relative h-full w-full">
    <!-- Left content -->
    <div
      class="absolute h-full w-full"
      style={leftStyle}
    >
      {@render leftContent()}
    </div>

    <!-- Right content -->
    <div
      class="absolute h-full w-full"
      style={rightStyle}
    >
      {@render rightContent()}
    </div>
  </div>

  <!-- Slider control -->
  <div
    class="absolute inset-y-0 z-10 flex w-1 items-center justify-center {dividerColor}"
    style={dividerStyle}
  >
    <!-- Vertical separator line -->
    <div class="absolute inset-y-0 w-0.5 bg-current opacity-50 pointer-events-none"></div>

    <button
      class="flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform {handleColor}"
      onmousedown={handleMouseDown}
      onkeydown={handleKeyDown}
      role="slider"
      aria-orientation="vertical"
      aria-valuenow={position}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Adjust divider position"
    >
      <svg
        class="h-6 w-6 stroke-surface-50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M7 16l-4-4 4-4" />
        <path d="M17 8l4 4-4 4" />
        <path d="M3 12h18" />
      </svg>
    </button>
  </div>
</div>
