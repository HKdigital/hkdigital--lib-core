<script>
  import { createClientLogger } from '$lib/logging/index.js';
  import { TextButton } from '$lib/ui/primitives/index.js';
  import { enhance } from '$app/forms';
  import {
    throwSimpleError,
    throwErrorInSubFunction,
    throwPromiseRejection,
    throwHkPromiseTimeout,
    throwHttpException,
    throwExpectError,
    throwRethrowChainError,
    throwRawValibotError
  } from '$lib/logging/internal/test-errors.js';

  let { data, form } = $props();

  const logger = createClientLogger('test-logger');

  let clientResults = $state({});

  /**
   * Generic error handler for client tests
   */
  async function handleClientTest(testName, testFunction) {
    try {
      await testFunction();
      clientResults[testName] = {
        success: true,
        message: 'No error occurred (unexpected)',
        timestamp: new Date().toLocaleTimeString()
      };
    } catch (error) {
      // Send output to client logger
      // logger.error(`Test [${testName}]`, error);
      logger.error(error);

      clientResults[testName] = {
        success: false,
        message: `Client ${testName} error logged`,
        error: error.message,
        errorType: error.constructor.name,
        timestamp: new Date().toLocaleTimeString()
      };
    }
  }

  // Test functions
  const testSimpleError = () => handleClientTest('simple error', throwSimpleError);
  const testErrorInSubFunction = () => handleClientTest('nested error', throwErrorInSubFunction);
  const testPromiseRejection = () => handleClientTest('promise rejection', throwPromiseRejection);
  const testHkPromiseTimeout = () => handleClientTest('HkPromise timeout', throwHkPromiseTimeout);
  const testHttpException = () => handleClientTest('HTTP exception', throwHttpException);
  const testExpectError = () => handleClientTest('expect validation', throwExpectError);
  const testRethrowChain = () => handleClientTest('rethrow chain', throwRethrowChainError);
  const testRawValibotError = () => handleClientTest('raw valibot', throwRawValibotError);
</script>

<div class="container mx-auto p-20up" data-page>
  <h1 class="type-heading-h1 mb-20up">Logger error testing</h1>
  
  <div class="card p-20up mb-20up">
    <p class="type-base-md mb-12bt">
      This example demonstrates how the logger handles various types of errors
      with enhanced stack trace detection and error type identification.
    </p>
    
    <p class="type-base-sm text-surface-600">
      Check your server console and browser console to see the logged errors with
      function names and error types (rethrow, expect, validation, etc.).
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-20up">
    <!-- Server error buttons -->
    <div class="card p-20up">
      <h2 class="type-heading-h3 my-20up">Server logger</h2>
      
      <div class="grid grid-cols-1 gap-20up w-200up">
        <form method="POST" action="?/triggerSimpleError" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            Simple error
          </TextButton>
        </form>

        <form method="POST" action="?/triggerNestedError" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            Nested error
          </TextButton>
        </form>

        <form method="POST" action="?/triggerPromiseRejection" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            Promise rejection
          </TextButton>
        </form>

        <form method="POST" action="?/triggerHkPromiseTimeout" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            HkPromise timeout
          </TextButton>
        </form>

        <form method="POST" action="?/triggerHttpException" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            httpGet exception
          </TextButton>
        </form>

        <form method="POST" action="?/triggerExpectError" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            Expect fails
          </TextButton>
        </form>

        <form method="POST" action="?/triggerRethrowChain" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            Rethrow error
          </TextButton>
        </form>

        <form method="POST" action="?/triggerRawValibotError" use:enhance>
          <TextButton data-role="secondary" data-size="sm" buttonType="submit">
            Raw valibot error
          </TextButton>
        </form>
      </div>

      {#if form}
        <div class="mt-20up">
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

    <!-- Client error buttons -->
    <div class="card p-20up">
      <h2 class="type-heading-h3 my-20up">Client logger</h2>
      
      <div class="grid grid-cols-1 gap-20up w-200up">
        <TextButton data-role="secondary" data-size="sm" onclick={testSimpleError}>
          Simple error
        </TextButton>

        <TextButton data-role="secondary" data-size="sm" onclick={testErrorInSubFunction}>
          Nested error
        </TextButton>

        <TextButton data-role="secondary" data-size="sm" onclick={testPromiseRejection}>
          Promise rejection
        </TextButton>

        <TextButton data-role="secondary" data-size="sm" onclick={testHkPromiseTimeout}>
          HkPromise timeout
        </TextButton>

        <TextButton data-role="secondary" data-size="sm" onclick={testHttpException}>
          httpGet exception
        </TextButton>

        <TextButton data-role="secondary" data-size="sm" onclick={testExpectError}>
          Expect fails
        </TextButton>

        <TextButton data-role="secondary" data-size="sm" onclick={testRethrowChain}>
          Rethrow error
        </TextButton>

        <TextButton data-role="secondary" data-size="sm" onclick={testRawValibotError}>
          Raw valibot error
        </TextButton>
      </div>

      <!-- Results display -->
      {#if Object.keys(clientResults).length > 0}
        <div class="mt-20up">
          <h3 class="type-heading-h4 mb-20up">Test results</h3>

          {#each Object.entries(clientResults) as [testName, result]}
            <div class="alert {result.success ? 'variant-filled-success' : 'variant-filled-error'} mb-20up">
              <div class="alert-message">
                <h4 class="type-ui-md font-semibold">
                  {result.success ? '✅' : '❌'} {testName} - {result.message}
                </h4>
                {#if result.error}
                  <p class="type-ui-sm mt-4up">
                    <strong>Error:</strong> {result.error}
                  </p>
                  <p class="type-ui-sm">
                    <strong>Type:</strong> {result.errorType}
                  </p>
                {/if}
                <p class="type-ui-xs text-surface-500 mt-4up">
                  {result.timestamp}
                </p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
