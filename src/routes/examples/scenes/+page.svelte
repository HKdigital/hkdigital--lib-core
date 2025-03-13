<script>
  let { data } = $props();
</script>

<section class="m-40up">
  <h3 class="text-heading-h3 font-heading mb-10up">Scenes</h3>

  {#each data.folders as folder}
    <li class="list-none text-nowrap">
      <a
        class="text-base-md font-base underline"
        href={folder.path}
        aria-label="Open folder {folder.displayName}"
      >
        {folder.displayName}
      </a>
    </li>
  {/each}
</section>
