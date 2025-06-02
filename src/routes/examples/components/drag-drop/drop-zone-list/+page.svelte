<script>
  import {
    Draggable,
    DropZoneList,
    DragDropContext
  } from '$lib/components/drag-drop';

  // Available tasks in the source list
  let items = $state([
    { id: 1, name: 'Task 1', type: 'task', priority: 'high' },
    { id: 2, name: 'Task 2', type: 'task', priority: 'medium' },
    { id: 3, name: 'Task 3', type: 'task', priority: 'low' }
  ]);

  // Tasks in the destination lists
  let todoItems = $state([]);
  let doneItems = $state([]);

  // Bindable states for drop zone interactions
  let isDraggingTask = $state(false);
  let todoCanDrop = $state(false);
  let doneCanDrop = $state(false);
</script>

<DragDropContext>
  <div class="container">
    <!-- Source items -->
    <div class="source">
      <h3>Available Tasks</h3>
      {#each items as item (item.id)}
        <Draggable
          {item}
          source="available"
          bind:isDragging={isDraggingTask}
          onDragStart={({ item, getController }) => {
            console.log(
              'Started dragging:',
              item.name,
              'priority:',
              item.priority
            );

            const controller = getController();
            controller.grabPreviewImage();
          }}
        >
          <div class="task-content">
            <span>{item.name}</span>
            <span class="priority-badge {item.priority}">{item.priority}</span>
          </div>
        </Draggable>
      {/each}

      {#if items.length === 0}
        <div class="empty-source">All tasks have been assigned</div>
      {/if}
    </div>

    <!-- Todo zone -->
    <DropZoneList
      zone="todo"
      accepts={({item}) => item.type === 'task'}
      bind:canDrop={todoCanDrop}
      onDrop={({ item, source }) => {
        console.log('Dropping to TODO:', item.name, 'priority:', item.priority, 'from:', source);

        // Remove from source list
        if (source === 'available') {
          items = items.filter((i) => i.id !== item.id);
        } else if (source === 'done') {
          doneItems = doneItems.filter((i) => i.id !== item.id);
        }

        // Add to todo list
        todoItems = [...todoItems, item];
      }}
    >
      <div data-layer="content">
        <h3>To Do (accepts all)</h3>
        <div class="state-info">Can Drop: {todoCanDrop}</div>

        {#if todoItems.length === 0}
          <div class="empty-state">
            <p>No tasks yet</p>
            <p>Drag tasks here to get started</p>
          </div>
        {:else}
          {#each todoItems as item (item.id)}
            <Draggable
              {item}
              source="todo"
              onDragStart={({ item }) => {
                console.log('Moving from Todo:', item.name);
              }}
            >
              <div class="task-card">
                {item.name} ({item.priority})
              </div>
            </Draggable>
          {/each}
        {/if}
      </div>

      {#snippet dropPreviewSnippet(data)}
        <div class="preview">Dropping: {data?.item?.name}</div>
      {/snippet}
    </DropZoneList>

    <!-- Done zone with restrictions -->
    <DropZoneList
      zone="done"
      accepts={({item}) => {
        // Only accept medium/low priority tasks
        return item.type === 'task' && item.priority !== 'high';
      }}
      bind:canDrop={doneCanDrop}
      onDrop={({ item, source }) => {
        console.log('Dropping to DONE:', item.name, 'priority:', item.priority, 'from:', source);

        // Remove from source list
        if (source === 'available') {
          items = items.filter((i) => i.id !== item.id);
        } else if (source === 'todo') {
          todoItems = todoItems.filter((i) => i.id !== item.id);
        }

        // Add to done list
        doneItems = [...doneItems, item];
      }}
    >
      <div data-layer="content">
        <h3>Done (only medium/low priority)</h3>
        <div class="state-info">Can Drop: {doneCanDrop}</div>

        {#if doneItems.length === 0}
          <div class="empty-state">
            <p>No completed tasks</p>
            <p>Only medium/low priority tasks can be marked as done</p>
          </div>
        {:else}
          {#each doneItems as item (item.id)}
            <Draggable
              {item}
              source="done"
              onDragStart={({ item }) => {
                console.log('Moving from Done:', item.name);
              }}
            >
              <div class="task-card done">
                {item.name} ({item.priority})
              </div>
            </Draggable>
          {/each}
        {/if}
      </div>

      {#snippet dropPreviewSnippet(data)}
        <div class="preview {doneCanDrop ? 'can-drop' : 'cannot-drop'}">
          {#if doneCanDrop}
            ✓ Can drop: {data?.item?.name}
          {:else}
            ❌ Cannot drop high priority here
          {/if}
        </div>
      {/snippet}
    </DropZoneList>
  </div>
</DragDropContext>

<style>
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;

    & :global( [data-component='drop-zone'] ) {
      padding: 1rem;
    }

  }

  .source {
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 0.5rem;
    border: 1px solid #e0e0e0;
  }

  .empty-source,
  .empty-state {
    padding: 1.5rem;
    text-align: center;
    color: #666;
    background: #f0f0f0;
    border-radius: 0.25rem;
    font-style: italic;
  }

  .task-content {
    padding: 0.75rem;
    background: white;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
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
    color: #2e7d32;
  }

  .state-info {
    font-size: 0.875rem;
    padding: 0.5rem;
    background: #f0f0f0;
    margin-bottom: 0.5rem;
  }

  .preview {
    position: absolute;
    left: 0; right: 0; top: 0; bottom: 0;
    /*padding: 0.5rem;*/
    /*background: rgba(0, 0, 0, 0.05);*/
    background: white;
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
