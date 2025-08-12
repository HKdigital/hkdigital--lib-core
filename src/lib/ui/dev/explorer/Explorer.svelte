<script>
  import { goto } from '$app/navigation';

  /**
   * Reusable explorer component for navigating nested folder structures
   * @type {{
   *   navigationData: Object,
   *   currentPath: string,
   *   getActiveSegments?: (segments: string[]) => void,
   *   getNavigateToLevelFunction?: (fn: Function) => void,
   *   rootName?: string,
   *   folderName?: string
   * }}
   */
  let {
    navigationData,
    currentPath = '',
    getActiveSegments,
    getNavigateToLevelFunction,
    rootName = 'Categories',
    folderName
  } = $props();

  /** @type {string[]} */
  let pathSegments = $derived(
    currentPath ? currentPath.split('/').filter(Boolean) : []
  );

  /** @type {string[]} */
  let interactiveSegments = $state([]);

  /** @type {string[]} */
  let activeSegments = $derived(
    interactiveSegments.length > 0 ? interactiveSegments : pathSegments
  );

  // Notify parent of active segments changes - only when they change
  let lastActiveSegments = [];
  $effect(() => {
    if (
      getActiveSegments &&
      JSON.stringify(activeSegments) !== JSON.stringify(lastActiveSegments)
    ) {
      lastActiveSegments = [...activeSegments];
      getActiveSegments(activeSegments);
    }
  });

  /** @type {Object[]} */
  let breadcrumbColumns = $derived.by(() => {
    const columns = [];
    let current = navigationData;

    // Root column with sorted items (folders first, then endpoints)
    const rootItems = Object.values(current).map((item) => ({
      name: item.name,
      displayName: item.displayName || item.name,
      isEndpoint: item.isEndpoint,
      isSelected: activeSegments.length > 0 && 
        activeSegments[0] === item.name
    })).sort((a, b) => {
      // Sort by type first (folders before endpoints)
      if (a.isEndpoint !== b.isEndpoint) {
        return a.isEndpoint ? 1 : -1;
      }
      // Then sort alphabetically by display name
      return a.displayName.localeCompare(b.displayName);
    });

    columns.push({
      title: rootName,
      items: rootItems,
      level: 0
    });

    // Build columns for each path segment
    for (let i = 0; i < activeSegments.length; i++) {
      const segment = activeSegments[i];

      if (current[segment]) {
        current = current[segment].children;

        if (Object.keys(current).length > 0) {
          const nextSegment = activeSegments[i + 1];

          // Sort nested items (folders first, then endpoints)
          const nestedItems = Object.values(current).map((item) => ({
            name: item.name,
            displayName: item.displayName || item.name,
            isEndpoint: item.isEndpoint,
            isSelected: nextSegment === item.name
          })).sort((a, b) => {
            // Sort by type first (folders before endpoints)
            if (a.isEndpoint !== b.isEndpoint) {
              return a.isEndpoint ? 1 : -1;
            }
            // Then sort alphabetically by display name
            return a.displayName.localeCompare(b.displayName);
          });

          columns.push({
            title: segment,
            items: nestedItems,
            level: i + 1
          });
        }
      }
    }

    return columns;
  });

  /**
   * Handle navigation to a folder or endpoint
   * @param {number} level - Column level
   * @param {string} itemName - Item name
   * @param {boolean} isEndpoint - Whether this is a final endpoint
   */
  function handleNavigation(level, itemName, isEndpoint) {
    // Build new path segments up to the selected level
    const newSegments = [...activeSegments.slice(0, level), itemName];
    const fullPath = newSegments.join('/');

    // Always navigate to explorer URL - let the route system handle state
    goto(`/explorer/${folderName}/${fullPath}`);
  }

  /**
   * Handle breadcrumb navigation
   * @param {number} level - Level to navigate back to
   */
  function navigateToLevel(level) {
    if (level === 0) {
      // Navigate back to root explorer
      goto('/explorer');
    } else {
      // Navigate to specific level
      const currentSegments =
        interactiveSegments.length > 0 ? interactiveSegments : pathSegments;
      const newSegments = currentSegments.slice(0, level);
      const explorerPath = newSegments.join('/');
      goto(`/explorer/${folderName}/${explorerPath}`);
    }
  }

  // Expose the navigate function to parent
  if (getNavigateToLevelFunction) {
    getNavigateToLevelFunction(navigateToLevel);
  }
</script>

<div class="explorer-container">
  <!-- Dynamic columns -->
  <div class="navigation-columns">
    {#each breadcrumbColumns as column, columnIndex}
      <div class="column" data-column={`level-${column.level}`}>
        <h2 class="type-heading-h2 mb-20up">{column.title}</h2>
        <nav class="folder-list">
          {#each column.items as item}
            <button
              class="folder-item"
              class:active={item.isSelected}
              class:endpoint={item.isEndpoint}
              onclick={() =>
                handleNavigation(column.level, item.name, item.isEndpoint)}
            >
              <div class="item-content">
                <div class="item-icon">
                  {#if item.isEndpoint}
                    <svg 
                      class="external-icon" 
                      viewBox="0 0 16 16" 
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M3.5 2A1.5 1.5 0 002 3.5v9A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V9.75a.75.75 0 00-1.5 0v2.75a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25H6.5a.75.75 0 000-1.5h-3z"/>
                      <path d="M15.25 1a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-6.22 6.22a.75.75 0 101.06 1.06L13.75 3.31v2.69a.75.75 0 001.5 0V1z"/>
                    </svg>
                  {:else}
                    <svg 
                      class="folder-icon" 
                      viewBox="0 0 16 16" 
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M1.75 2A1.75 1.75 0 000 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0016 12.25v-7.5A1.75 1.75 0 0014.25 3H7.5L6.25 1.75A.75.75 0 005.75 1.5h-4A1.75 1.75 0 000 3.25V3.75z"/>
                    </svg>
                  {/if}
                </div>
                <span class="item-name">{item.displayName}</span>
              </div>
            </button>
          {/each}

          {#if column.items.length === 0}
            <div class="empty-state">
              <p class="type-base-sm">No items found</p>
            </div>
          {/if}
        </nav>
      </div>
    {/each}
  </div>
</div>

<style>
  .explorer-container {
    padding: 20px;
  }

  .navigation-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    align-items: start;
  }

  .column {
    min-height: 200px;
  }

  .folder-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .folder-item {
    display: block;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--color-surface-700);
    transition: all 0.2s;
    font-size: 14px;
    line-height: 1.4;
  }

  .folder-item:hover {
    background-color: var(--color-surface-100);
  }

  .folder-item.active {
    background-color: var(--color-primary-100);
    color: var(--color-primary-700);
  }

  .folder-item.endpoint:hover {
    background-color: var(--color-primary-50);
    color: var(--color-primary-600);
  }

  .item-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .item-icon {
    display: flex;
    align-items: center;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .item-name {
    flex: 1;
  }

  .external-icon,
  .folder-icon {
    width: 14px;
    height: 14px;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .folder-item:hover .external-icon,
  .folder-item:hover .folder-icon {
    opacity: 0.8;
  }

  .folder-item.endpoint .external-icon {
    color: var(--color-primary-600);
  }

  .folder-item .folder-icon {
    color: var(--color-surface-500);
  }

  .empty-state {
    padding: 20px;
    text-align: center;
    color: var(--color-surface-500);
  }
</style>