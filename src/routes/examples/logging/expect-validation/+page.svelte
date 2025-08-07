<script>
  import { expect, rethrow } from '$lib/util/index.js';
  import { createClientLogger } from '$lib/logging/index.js';
  import { TextButton } from '$lib/ui/primitives/index.js';
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  const logger = createClientLogger('test-logger');

  /**
   * Client-side function that triggers an expect validation error
   */
  function triggerClientExpectError() {
    try {
      // This will always fail and trigger an expect error
      expect.string(123);
    } catch (e) {
      rethrow('triggerClientExpectError failed', e);
    }
  }

  let clientResult = $state(null);

  function handleClientError() {
    try {
      triggerClientExpectError();
      clientResult = {
        success: true,
        message: 'No error occurred (unexpected)'
      };
    } catch (error) {
      // Send output to client logger
      logger.error('The triggered error was', error);

      clientResult = {
        success: false,
        message: 'Client expect error logged',
        error: error.message,
        errorType: error.constructor.name
      };
    }
  }
</script>

<div class="container mx-auto p-20up" data-page>
  <h1 class="type-heading-h1 mb-20up">Logger with expect errors</h1>
  
  <div class="card p-16up mb-16up">
    <p class="type-base-md mb-12bt">
      This example demonstrates how the logger handles <code class="code">expect</code> 
      validation errors on both server and client side.
    </p>
    
    <p class="type-base-sm text-surface-600">
      Check your server console and browser console to see the logged errors.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-20up">
    <!-- Server error button -->
    <div class="card p-16up mt-20up">
      <h2 class="type-heading-h3 mb-12bt">Server logger</h2>
      
      <form method="POST" action="?/triggerServerError" use:enhance>
        <TextButton buttonType="submit">
          Generate server expect error
        </TextButton>
      </form>

      {#if form}
        <div class="mt-12up mt-20up">
          <div class="alert {form.success ? 'variant-filled-success' : 'variant-filled-error'}">
            <div class="alert-message">
              <h3 class="type-ui-md font-semibold">
                {form.success ? '✅' : '❌'} {form.message}
              </h3>
              {#if form.error}
                <p class="type-ui-sm mt-4up">
                  <strong>Error:</strong> {form.error}
                </p>
                <p class="type-ui-sm">
                  <strong>Type:</strong> {form.errorType}
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Client error button -->
    <div class="card p-16up mt-20up">
      <h2 class="type-heading-h3 mb-12bt">Client logger</h2>
      
      <TextButton onclick={handleClientError}>
        Generate client expect error
      </TextButton>

      {#if clientResult}
        <div class="mt-12up mt-20up">
          <div class="alert {clientResult.success ? 'variant-filled-success' : 'variant-filled-error'}">
            <div class="alert-message">
              <h3 class="type-ui-md font-semibold">
                {clientResult.success ? '✅' : '❌'} {clientResult.message}
              </h3>
              {#if clientResult.error}
                <p class="type-ui-sm mt-4up">
                  <strong>Error:</strong> {clientResult.error}
                </p>
                <p class="type-ui-sm">
                  <strong>Type:</strong> {clientResult.errorType}
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
