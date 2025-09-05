<script>
  import { TextInput } from '$lib/ui/primitives/inputs/index.js';
  import { v } from '$lib/valibot/valibot.js';
  import { Name } from '$lib/valibot/parsers.js';

  let nameValue = $state('');
  let nameHasFocus = $state(false);
  let nameIsValid = $state(false);
  let nameIsPristine = $state(false);

  let emailValue = $state('');
  let emailHasFocus = $state(false);

  /**
   * @param {any} value
   */
  function validateName(value) {
    if (!value) return undefined;
    try {
      let result = v.safeParse(Name, value);
      if (!result.success) {
        return 'Must use a real name';
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  /**
   * @param {any} value
   */
  function validateEmail(value) {
    if (!value) return undefined;
    try {
      const EmailSchema = v.pipe(v.string(), v.email());
      let result = v.safeParse(EmailSchema, value);
      if (!result.success) {
        return 'Must use a real email';
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
</script>

<div class="container p-20p w-[400px] bg-white">
  <TextInput
    initialValue="test"
    bind:value={nameValue}
    bind:isValid={nameIsValid}
    bind:isPristine={nameIsPristine}
    bind:hasFocus={nameHasFocus}
    type="text"
    required
    title="naam"
    placeholder="John Doe"
    validate={validateName}
  />

  <TextInput
    bind:value={emailValue}
    bind:hasFocus={emailHasFocus}
    type="text"
    required
    title="email"
    placeholder="jouw@mail.nl"
    validate={validateEmail}
  />
</div>

<p>Name: {nameValue}</p>
<p>
  valid: {nameIsValid}<br />
  pristine: {nameIsPristine}<br />
  focus: {nameHasFocus}<br />
</p>
<p>Email: {emailValue}</p>
