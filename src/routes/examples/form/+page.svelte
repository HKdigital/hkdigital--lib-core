<script>
  import { PlainPanel } from '$lib/components/panels/index.js';
  import { PanelRow2 } from '$lib/components/rows/index.js';

  import { TextInput } from '$lib/components/inputs/index.js';

  let urlValue = $state('http://test.com');
  let urlIsPristine = $state(false);

  // setTimeout(() => {
  //   urlValue = 'http://wrong.com';
  // }, 1000);

  let urlValid = $state(false);
  let urlHasFocus = $state(false);

  function validateHttps(value) {
    if (!value) return undefined;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') {
        return 'URL must use HTTPS protocol';
      }
    } catch {
      return undefined; // Let built-in URL validation handle invalid URLs
    }
    return undefined;
  }
</script>

<!-- <TextInput value="jens" classes></TextInput> -->

<!-- <PlainPanel>
  <PanelRow2>
    <TextInput value="jens"></TextInput>
    Hello
  </PanelRow2>
</PlainPanel> -->

<!--
<HkInputField
  warningSymbol={WarningIcon}
  name="name"
  type="text"
  required={true}
  placeholder="Voornaam"
  legendTitle="Voornaam"
  classes="px-2 pb-4 pt-2 {nameError || form?.nameError
    ? 'placeholder-surface-950'
    : 'placeholder-surface-200'} base-font-family focus:outline-none"
  fieldClasses="border-2 {nameError || form?.nameError || isValid
    ? 'border-primary-500'
    : ''} pl-5 base-font-family"
  legendClasses="{isValid
    ? 'text-primary-500'
    : 'text-surface-200'} {nameError || form?.nameError
    ? 'bg-tertiary-500 text-white'
    : ''}"
  error={nameError || form?.nameError}
  onblur={(/** @type {{ target: { value: string; }; }} */ event) => {
    validateField('name', event.target.value);
  }}
/>
-->

<!-- <div class="container p-20p w-[400px]" data-theme="hkdev">
  <TextInput
    type="url"
    required
    title="Website URL"
    placeholder="Enter HTTPS URL"
    validate={validateHttps}
  />
</div> -->

<div class="container p-20p w-[400px]">
  <TextInput
    bind:value={urlValue}
    bind:isValid={urlValid}
    bind:hasFocus={urlHasFocus}
    bind:isPristine={urlIsPristine}
    type="url"
    required
    title="Website URL"
    placeholder="Enter HTTPS URL"
    validate={validateHttps}
  />
</div>

<!-- idle="border-surface-200"
focused="border-primary-500"
invalid="border-primary-500" -->

<div class="prose p-20p">
  <p>
    Value: {urlValue}<br />
    Valid: {urlValid ? 'yes' : 'no'}<br />
    Has focus: {urlHasFocus ? 'yes' : 'no'}<br />
    Pristine: {urlIsPristine}
  </p>
</div>

<!-- <fieldset class="grid grid-cols-[1fr_auto] items-center gap-2 border">
  <input class="w-full" />
  <div class="icon">🔍</div>
</fieldset> -->
