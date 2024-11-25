<script>
	/**
	 *
	 * @type {{
	 *   classes?: string,
	 *   fieldClasses?: string,
	 *   legendClasses?: string,
	 *   legendTitle: string,
	 *   error?: boolean,
	 *   name?: string,
	 *   type: string,
	 *   placeholder: string,
	 *   required: boolean,
	 *   warningSymbol: string,
	 *   onblur?: () => void,
	 * }}
	 *
	 */
	let {
		// Style
		classes,
		fieldClasses,
		legendClasses,

		// Functionality
		legendTitle,
		type,
		placeholder,
		error,
		name,
		required,
		warningSymbol,
		onblur
	} = $props();
</script>

<fieldset data-hk-input-field class="flex w-full items-center rounded {fieldClasses}">
	<legend class="px-2 {legendClasses}" class:error>{legendTitle}</legend>
	<input
		class="w-full border-none bg-transparent {classes}"
		{type}
		{placeholder}
		{name}
		{required}
		{onblur}
	/>
	{#if error}
		<img src={warningSymbol} class="mb-2 mr-8" alt="Warning" />
	{/if}
</fieldset>
