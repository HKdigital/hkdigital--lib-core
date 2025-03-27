<script>
  import { kebabToTitleCase } from '$lib/util/string/index.js';

  /**
   * @type {{
   *   data: {
   *     folders: Array<{
   *       displayName: string,
   *       path: string,
   *       depth: number
   *     }>
   *   }
   * }}
   */
  let { data } = $props();

  // De folders omzetten naar een hiërarchische boomstructuur
  const buildTree = (folders) => {
    // Root van de boomstructuur
    const root = {
      displayName: 'Root',
      children: {},
      items: []
    };

    // Folders verwerken en toevoegen aan de juiste plaats in de boom
    folders.forEach((item) => {
      const segments = item.path.split('/');
      let current = root;

      // Voor elk segment in het pad, bouw de boom verder op
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        // Als we de diepte van het item hebben bereikt, voeg het item toe
        if (i === item.depth) {
          current.items.push(item);
          break;
        }

        // Maak anders een nieuw niveau aan in de boom als het nog niet bestaat
        if (!current.children[segment]) {
          current.children[segment] = {
            displayName: segment,
            children: {},
            items: []
          };
        }

        // Ga een niveau dieper
        current = current.children[segment];
      }
    });

    return root;
  };

  const tree = buildTree(data.folders);
</script>

<section class="m-40up">
  <h3 class="text-heading-h3 font-heading mb-10up">Showcase</h3>

  <div class="multi-column">
    {@render FolderView(tree)}
  </div>
</section>

{#snippet FolderView(folder, level = 0)}
  {#if level > 0}
    <div class="level level-{level}">
      <h4 class="text-heading-h4 font-heading mt-20up mb-5up py-1ht">
        {kebabToTitleCase(folder.displayName)}
      </h4>
    </div>
  {/if}
  <ul>
    <!-- Eerst tonen we de items in deze map -->
    {#each folder.items.sort( (a, b) => a.displayName.localeCompare(b.displayName) ) as item}
      <li class="list-none text-nowrap my-4bt">
        <a
          class="text-base-md font-base"
          href={item.path}
          aria-label="Open {item.displayName}"
        >
          {item.displayName}
        </a>
      </li>
    {/each}
    <!-- Dan tonen we de submappen -->
    {#each Object.keys(folder.children).sort() as subfolder}
      {@render FolderView(folder.children[subfolder], level + 1)}
    {/each}
  </ul>
{/snippet}

<style>
  .level.level-1 {
    border-bottom: solid thin rgb(var(--color-surface-900));
  }

  .level.level-2 {
    border-bottom: dashed thin rgb(var(--color-surface-700));
  }

  /*.level:not(.level-1) {
  }*/

  /* Multi-column layout */
  .multi-column {
    column-count: 3;
    column-gap: 2rem;
  }

  /* Prevent items from breaking across columns */
  /*.multi-column h4,
  .multi-column ul > li {
    break-inside: avoid;
  }*/

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .multi-column {
      column-count: 2;
    }
  }

  @media (max-width: 768px) {
    .multi-column {
      column-count: 1;
    }
  }
</style>
