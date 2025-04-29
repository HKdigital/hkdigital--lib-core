<script>
  import IconValid from './assets/IconValid.svelte';
  import IconInvalid from './assets/IconInvalid.svelte';

  import { Star, ExclamationTriangle, CheckCircle } from '@steeze-ui/heroicons';

  import { HkIcon } from '$lib/components/icons/index.js';

  import {
    PRISTINE,
    DIRTY,
    FOCUSED,
    UNFOCUSED,
    VALID,
    INVALID,
    REQUIRED,
    DISABLED
  } from '$lib/constants/state-labels/input-states.js';

  /**
   * @type {{
   *   base?: string,
   *   borderShape?: string,
   *   classes?: string,
   *   inputBase?: string,
   *   inputClasses?: string,
   *   legendBase?: string,
   *   legendClasses?: string,
   *   iconClasses?: string,
   *   initialValue?: string,
   *   value?: string,
   *   type?: 'text' | 'url' | 'email' | 'number',
   *   pattern?: string,
   *   required?: boolean,
   *   title?: string,
   *   placeholder?: string,
   *   isValid?: boolean,
   *   isPristine?: boolean,
   *   hasFocus?: boolean,
   *   validate?: (value: string) => string | undefined,
   *   iconRequired?: import('svelte').Snippet,
   *   iconValid?: import('svelte').Snippet,
   *   iconInvalid?: import('svelte').Snippet
   * } & { [attr: string]: any }}
   */
  let {
    initialValue = '',
    value = $bindable(''),

    isValid = $bindable(true),
    isPristine = $bindable(true),
    hasFocus = $bindable(false),

    // Fieldset
    base = 'px-10p pb-10p',
    borderShape = 'border-1p rounded-xs',

    classes = '',

    // Input
    inputBase = 'w-full outline-none border-none bg-transparent',
    inputClasses,

    // Legend
    legendBase,
    legendClasses,

    // Icon
    iconBase = 'w-[24px] h-[24px]',
    iconClasses = '',

    // Input type and built-in validation

    type = 'text',
    required = false,
    disabled = false,

    title = '',
    placeholder = '',

    // legend = 'Invalid',
    // legendInvalid?

    iconRequired,
    iconValid,
    iconInvalid,

    validate,

    ...attrs
  } = $props();

  let inputRef = $state();
  let validationMessage = $state('');

  $effect(() => {
    if (!inputRef) return;
    validateInput(inputRef, initialValue);
    value = initialValue;
  });

  function validateInput(input, currentValue) {
    input.setCustomValidity('');
    const isBuiltInValid = input.checkValidity();

    if (isBuiltInValid && validate) {
      const customError = validate(currentValue);
      input.setCustomValidity(customError || '');
    }

    isPristine = currentValue === initialValue;
    isValid = input.validity.valid;
    validationMessage = input.validationMessage;
  }

  function handleInput(event) {
    validateInput(event.target, event.target.value);
  }

  // let legendHeight = $state(0);

  // let paddingBottomStyle = $derived.by(() => {
  //   return `padding-bottom: ${legendHeight / 2}px;`;
  // });

  let hideLegendStyle = $derived.by(() => {
    if (isValid && !title) {
      return 'width: 0;';
    }
  });

  let stateClasses = $derived.by(() => {
    //
    // Return CSS classes that indicate the component's state
    //
    // @see $lib/constants/state-labels
    //
    const outArr = [];

    outArr.push(isPristine ? PRISTINE : DIRTY);
    outArr.push(hasFocus ? FOCUSED : UNFOCUSED);
    outArr.push(isValid ? VALID : INVALID);

    if (required) {
      outArr.push(REQUIRED);
    }

    if (disabled) {
      outArr.push(DISABLED);
    }

    return outArr.join(' ');
  });
</script>

<!-- {#snippet defaultWarning()}
  <WarningIcon />
{/snippet} -->

<fieldset
  data-input="text-input"
  class="{base} {borderShape} {classes} {stateClasses}"
>
  <legend
    data-child="legend"
    class="{legendBase} {legendClasses}"
    style={hideLegendStyle}
  >
    {#if title}
      {title}
      <!-- {:else if !isValid}
      {invalidTitle} -->
    {:else}
      &nbsp;
    {/if}
  </legend>

  <div class="grid grid-cols-[1fr_auto] items-center">
    <input
      data-child="input"
      bind:this={inputRef}
      {type}
      {required}
      {disabled}
      bind:value
      {placeholder}
      class="{inputBase} {inputClasses}"
      aria-invalid={!isValid}
      aria-errormessage={!isValid ? 'validation-message' : undefined}
      oninput={handleInput}
      onfocus={() => {
        hasFocus = true;
      }}
      onblur={() => {
        hasFocus = false;
      }}
      {...attrs}
    />

    <div data-child="icon-box" class="{iconBase} {iconClasses}">
      {#if isPristine && required}
        {#if iconRequired}
          {@render iconRequired()}
        {:else}
          <HkIcon src={Star} theme="solid" />
        {/if}
      {:else if isValid}
        {#if iconValid}
          {@render iconValid()}
        {:else}
          <HkIcon src={CheckCircle} theme="solid" />
        {/if}
      {:else if iconInvalid}
        {@render iconInvalid()}
      {:else}
        <HkIcon src={ExclamationTriangle} theme="solid" />
      {/if}
    </div>
  </div>
</fieldset>

<style>
</style>
