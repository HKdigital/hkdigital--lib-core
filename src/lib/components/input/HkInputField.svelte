<script>
  /**
   *
   * @type {{
   *   legendTitle: string,
   *   error?: boolean,
   *   name?: string,
   *   type: string,
   *   placeholder: string,
   *   classes?: string,
   *   requiredBoolean: boolean,
   *   warningSymbol: string,
   *   fieldClasses?: string,
   *   legendClasses?: string
   * }}
   *
   */
  let 
  { 
    legendTitle, 
    type, 
    placeholder, 
    error, 
    name,
    requiredBoolean,
    warningSymbol,
    classes,
    fieldClasses,
    legendClasses
  } = $props();

</script>

<fieldset
  data-hk-input-field
  class="flex w-full items-center rounded {fieldClasses}"
>
  <legend class="px-2 {legendClasses}" class:error>{legendTitle}</legend>
  <input
    class='w-full border-none bg-transparent {classes}'
    {type}
    {placeholder}
    {name}
    required={requiredBoolean}
  />
  {#if error}
    <img src={warningSymbol} class="mb-2 mr-8" alt="Warning symbol" />
  {/if}
</fieldset>
