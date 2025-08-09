<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import TopBar from './TopBar.svelte';
  
  /** @type {{ data: { navigationData: Object, scalingEnabled: boolean } }} */
  let { data } = $props();
  
  /** @type {boolean} */
  let scalingEnabled = $state(data.scalingEnabled);

  /**
   * Handle scaling change from TopBar
   * @param {boolean} enabled
   */
  function handleScalingChange(enabled) {
    scalingEnabled = enabled;
  }
  
  // Initialize selections from URL parameters
  /** @type {string} */
  let selectedMainFolder = $state($page.url.searchParams.get('main') || '');
  
  /** @type {string} */
  let selectedSubFolder = $state($page.url.searchParams.get('sub') || '');

  // Get main folders from navigation data
  /** @type {string[]} */
  const mainFolders = $derived(Object.keys(data.navigationData));
  
  // Get current main folder data
  /** @type {Object | null} */
  const currentMainFolder = $derived(selectedMainFolder ? data.navigationData[selectedMainFolder] : null);
  
  // Get subfolders for selected main folder
  /** @type {string[]} */
  const subFolders = $derived(currentMainFolder ? Object.keys(currentMainFolder.subfolders) : []);
  
  // Get current subfolder data
  /** @type {Object | null} */
  const currentSubFolder = $derived(currentMainFolder && selectedSubFolder ? 
    currentMainFolder.subfolders[selectedSubFolder] : null);
  
  // Get examples for selected subfolder
  /** @type {Array} */
  const examples = $derived(currentSubFolder ? currentSubFolder.examples : 
    (currentMainFolder ? currentMainFolder.examples : []));

  /**
   * Handles main folder selection and updates URL
   * @param {string} folder - Folder name
   */
  function selectMainFolder(folder) {
    selectedMainFolder = folder;
    selectedSubFolder = '';
    updateURL();
  }

  /**
   * Handles subfolder selection and updates URL
   * @param {string} folder - Folder name
   */
  function selectSubFolder(folder) {
    selectedSubFolder = folder;
    updateURL();
  }

  /**
   * Updates URL with current selections
   */
  function updateURL() {
    const params = new URLSearchParams();
    if (selectedMainFolder) params.set('main', selectedMainFolder);
    if (selectedSubFolder) params.set('sub', selectedSubFolder);
    
    const query = params.toString();
    const url = query ? `/examples?${query}` : '/examples';
    
    goto(url, { replaceState: true });
  }

  /**
   * Navigates to an example
   * @param {string} path - Example path
   */
  function navigateToExample(path) {
    window.location.href = `/examples/${path}`;
  }
</script>

<TopBar bind:scalingEnabled onchange={handleScalingChange} />

<div class="examples-navigator" data-page>
  
  <div class="navigation-columns">
    <!-- First Column: Main Folders -->
    <div class="column" data-column="main">
      <h2 class="type-heading-h2 mb-20up">Categories</h2>
      <nav class="folder-list">
        {#each mainFolders as folder}
          <button 
            class="folder-item" 
            class:active={selectedMainFolder === folder}
            onclick={() => selectMainFolder(folder)}
          >
            {folder}
          </button>
        {/each}
      </nav>
    </div>

    <!-- Second Column: Sub Folders -->
    {#if selectedMainFolder}
      <div class="column" data-column="sub">
        <h2 class="type-heading-h2 mb-20up">{selectedMainFolder}</h2>
        <nav class="folder-list">
          {#each subFolders as folder}
            <button 
              class="folder-item"
              class:active={selectedSubFolder === folder}
              onclick={() => selectSubFolder(folder)}
            >
              {folder}
            </button>
          {/each}
          
          {#if subFolders.length === 0}
            <div class="empty-state">
              <p class="type-base-sm">No subfolders found</p>
            </div>
          {/if}
        </nav>
      </div>
    {/if}

    <!-- Third Column: Examples -->
    {#if selectedMainFolder && (selectedSubFolder || currentMainFolder?.examples.length > 0)}
      <div class="column" data-column="examples">
        <h2 class="type-heading-h2 mb-20up">{selectedSubFolder || selectedMainFolder}</h2>
        <nav class="folder-list">
          {#each examples as example}
            <button 
              class="folder-item"
              onclick={() => navigateToExample(example.path)}
            >
              {example.displayName}
            </button>
          {/each}
          
          {#if examples.length === 0}
            <div class="empty-state">
              <p class="type-base-sm">No examples found</p>
            </div>
          {/if}
        </nav>
      </div>
    {/if}
  </div>
</div>

<style src="./style.css"></style>