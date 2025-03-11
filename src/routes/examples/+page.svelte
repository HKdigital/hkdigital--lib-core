<script>
  let { data } = $props();

  console.log(import.meta);
  const url = import.meta.url;
  const baseUrl = import.meta.url;
</script>

<section class="prose p-40p">
  <h1>Examples</h1>

  {#each data.folders as folder}
    <li class="list-none text-nowrap">
      <a
        onclick={() => {}}
        href={folder.path}
        aria-label="Open folder {folder.displayName}"
      >
        {folder.displayName}
      </a>
    </li>
  {/each}
</section>
