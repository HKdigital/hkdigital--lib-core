<script>
  let { item, itemSize, isDragging } = $props();

  let borderColorStyle = $derived.by( () => {
    if( isDragging )
    {
      return '';
    }

    switch( item.type )
    {
      case 'plastic':
        return 'border-warning-500';
      case 'paper':
        return 'border-secondary-500';
      case 'glass':
        return 'border-tertiary-500';
      case 'waste':
        return 'border-surface-500';
      case 'organic':
        return 'border-primary-500';
    }
  } );
</script>

<div
  class="border-8 flex items-center justify-center bg-white {borderColorStyle}"
  style:width="{itemSize}px"
  style:height="{itemSize}px"
>
  <span class="text-2xl">{item.icon}</span>
</div>
