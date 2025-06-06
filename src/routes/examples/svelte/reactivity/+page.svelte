<script>
  import PersonModel from './PersonModel.svelte.js';
  import Person from './Person.svelte';

  let persons = $state([]);

  for( let j=0; j < 10; j = j + 1 ) {
    persons.push( new PersonModel() );
  }

  // Sum will update because we use the reactive property
  // person.age in a reactive computation scope
  let sum = $derived.by( () => {
    let sum = 0;

    for( const person of persons )
    {
      sum += person.age;
    }

    return sum;
  } );

  // Will not be triggered by an age update:
  // - Only triggers when the array itself is changed
  $inspect(persons);

</script>

{#each persons as person}
  <Person {person} />
{/each}

<div class="mt-20up">
  Sum ages: {sum}
</div>

