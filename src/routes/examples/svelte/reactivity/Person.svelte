<script>

  let {
    person = $bindable()
  } = $props();

  // $inspect('person', person);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="person" onclick={()=>{
  person.incrementAge();
}}>
  Person: age={person.age}
</div>

<style>
  div.person {
    border: solid 1px red;
    padding: 4px;
    width: max-content;
    min-width: 10rem;
    cursor: pointer;
  }
</style>
