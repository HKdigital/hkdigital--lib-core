<script>
  import { Draggable, DropZone } from '$lib/components/drag-drop';

  let items = $state([
    { id: 1, name: 'Task 1', type: 'task', priority: 'high' },
    { id: 2, name: 'Task 2', type: 'task', priority: 'medium' },
    { id: 3, name: 'Task 3', type: 'task', priority: 'low' }
  ]);

  let todoItems = $state([]);
  let doneItems = $state([]);

  // Bindable states
  let isDraggingTask = $state(false);
  let canDropInDone = $state(false);
  let todoCanDrop = $state(false);
  let doneCanDrop = $state(false);
</script>

<div class="container">
  <!-- Source items -->
  <div class="source">
    <h3>Available Tasks</h3>
    {#each items as item (item.id)}
      <Draggable
        {item}
        source="available"
        bind:isDragging={isDraggingTask}
        onDragStart={({ item }) => console.log('Started dragging:', item.name, 'priority:', item.priority)}
      >
        <div class="task-content">
          <span>{item.name}</span>
          <span class="priority-badge {item.priority}">{item.priority}</span>
        </div>
      </Draggable>
    {/each}
  </div>

  <!-- Todo zone -->
  <DropZone
    zone="todo"
    accepts={(item) => item.type === 'task'}
    bind:itemCount={todoItems.length}
    bind:canDrop={todoCanDrop}
    onDrop={({ item }) => {
      console.log('Dropping to TODO:', item.name, 'priority:', item.priority);
      todoItems = [...todoItems, item];
      items = items.filter((i) => i.id !== item.id);
    }}
  >
    <h3>To Do (accepts all)</h3>
    <div class="state-info">Can Drop: {todoCanDrop}</div>
    {#each todoItems as item (item.id)}
      <div class="task-card">{item.name} ({item.priority})</div>
    {/each}

    {#snippet empty()}
      <p>No tasks yet</p>
    {/snippet}

    {#snippet preview(data)}
      <div class="preview">Dropping: {data?.item?.name}</div>
    {/snippet}
  </DropZone>

  <!-- Done zone with restrictions -->
  <DropZone
    zone="done"
    accepts={(item) => {
      console.log('Checking accepts for done:', item.name, 'priority:', item.priority, 'result:', item.type === 'task' && item.priority !== 'high');
      return item.type === 'task' && item.priority !== 'high';
    }}
    maxItems={5}
    bind:canDrop={canDropInDone}
    bind:itemCount={doneItems.length}
    onDrop={({ item }) => {
      console.log('Dropping to DONE:', item.name, 'priority:', item.priority);
      doneItems = [...doneItems, item];
      items = items.filter((i) => i.id !== item.id);
    }}
  >
    <h3>Done (only medium/low priority)</h3>
    <div class="state-info">Can Drop: {canDropInDone}</div>
    {#each doneItems as item (item.id)}
      <div class="task-card done">{item.name} ({item.priority})</div>
    {/each}

    {#snippet empty()}
      <p>No completed tasks</p>
    {/snippet}

    {#snippet preview(data)}
      <div class="preview {canDropInDone ? 'can-drop' : 'cannot-drop'}">
        {#if canDropInDone}
          ✓ Can drop: {data?.item?.name}
        {:else}
          ❌ Cannot drop high priority here
        {/if}
      </div>
    {/snippet}
  </DropZone>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }

  .task-content {
    padding: 0.75rem;
    background: white;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .priority-badge.high {
    background: #fee;
    color: #c00;
  }

  .priority-badge.medium {
    background: #ffe;
    color: #880;
  }

  .priority-badge.low {
    background: #efe;
    color: #080;
  }

  .task-card {
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 0.375rem;
    margin-bottom: 0.5rem;
  }

  .task-card.done {
    background: #e8f5e9;
  }

  .state-info {
    font-size: 0.875rem;
    padding: 0.5rem;
    background: #f0f0f0;
    margin-bottom: 0.5rem;
  }

  .preview {
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 0.25rem;
    text-align: center;
    font-style: italic;
  }

  .preview.can-drop {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .preview.cannot-drop {
    background: #ffebee;
    color: #c62828;
  }
</style>
