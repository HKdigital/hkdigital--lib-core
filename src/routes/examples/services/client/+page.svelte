<script>
import { onMount, onDestroy } from 'svelte';
import { ServiceManager } from '$lib/services/service-manager/ServiceManager.js';
import ConfigPlugin from '$lib/services/manager-plugins/ConfigPlugin.js';
import { Button } from '$lib/ui/primitives.js';
import {
  SERVICE_STATE_CHANGED,
  SERVICE_HEALTH_CHANGED,
  SERVICE_ERROR
} from '$lib/services/service-manager/constants.js';
import CountdownService from './CountdownService.js';

let manager;
let configPlugin;
let countdownService;

// Service state tracking
let serviceStates = $state({});
let logs = $state([]);

// Countdown display
let countdown = $state(0);
let targetTime = $state(null);
let formattedTime = $state('');

function addLog(message) {
  logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
  // Keep only last 10 logs
  if (logs.length > 10) {
    logs = logs.slice(-10);
  }
}

onMount(async () => {
  addLog('Initializing services...');
  
  // Create ServiceManager
  manager = new ServiceManager({
    debug: true,
    logLevel: 'DEBUG'
  });
  
  // Create ConfigPlugin with initial countdown configuration
  const initialConfig = {
    countdown: {
      targetTime: new Date(Date.now() + 60000).toISOString() // 1 minute from now
    }
  };
  
  // console.log('Initial config:', initialConfig);
  // addLog(`Initial config: ${JSON.stringify(initialConfig)}`);
  
  configPlugin = new ConfigPlugin(initialConfig);
  // console.log('ConfigPlugin created:', configPlugin);
  // console.log('ConfigPlugin allConfigs:', configPlugin.allConfigs);
  
  manager.attachPlugin(configPlugin);
  // console.log('Plugin attached. Manager plugins:', manager);
  
  // Check if plugin is attached
  // addLog(`ConfigPlugin attached. Has resolveServiceConfig: ${typeof configPlugin.resolveServiceConfig === 'function'}`);
  // addLog(`Manager has ${manager.plugins ? manager.plugins.size : 'no'} plugins`);
  
  // Register countdown service with config label
  manager.register('countdown', CountdownService, 'countdown');
  
  // Test config resolution manually
  // try {
  //   const testServiceEntry = manager.services.get('countdown');
  //   addLog(`Service registered. Entry exists: ${testServiceEntry ? 'YES' : 'NO'}`);
  //   if (testServiceEntry) {
  //     addLog(`Service config: ${JSON.stringify(testServiceEntry.serviceConfigOrLabel)}`);
  //     
  //     // Manually test ConfigPlugin
  //     const manualConfig = await configPlugin.resolveServiceConfig('countdown', testServiceEntry, null);
  //     addLog(`Manual config resolution result: ${JSON.stringify(manualConfig)}`);
  //   }
  // } catch (error) {
  //   addLog(`Manual config test error: ${error.message}`);
  //   console.error('Manual config test error:', error);
  // }
  
  // Listen to service events
  manager.on(SERVICE_STATE_CHANGED, ({ service, data }) => {
    serviceStates[service] = data.newState;
    addLog(`${service}: ${data.oldState} → ${data.newState}`);
  });
  
  manager.on(SERVICE_ERROR, ({ service, data }) => {
    addLog(`ERROR in ${service}: ${data.error.message}`);
  });
  
  manager.on(SERVICE_HEALTH_CHANGED, ({ service, data }) => {
    addLog(`${service} health: ${data.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  });
  
  // Start the countdown service
  try {
    addLog('Attempting to start countdown service...');
    // console.log('About to start service...');
    
    const startResult = await manager.startService('countdown');
    addLog(`Start service result: ${startResult}`);
    // console.log('Start service result:', startResult);
    
    countdownService = manager.get('countdown');
    addLog(`Got service instance: ${countdownService ? 'YES' : 'NO'}`);
    // console.log('Service instance:', countdownService);
    
    if (countdownService) {
      addLog(`Service state: ${countdownService.state}`);
      // console.log('Service state:', countdownService.state);
      // console.log('Service error:', countdownService.error);
      // console.log('Service countdown:', countdownService.countdown);
      
      // Set up reactivity through service events
      countdownService.on('countdownUpdated', ({ countdown: newCountdown }) => {
        countdown = newCountdown;
        targetTime = countdownService.targetTime;
        formattedTime = countdownService.formattedTime;
      });
      
      // Initial values
      countdown = countdownService.countdown;
      targetTime = countdownService.targetTime; 
      formattedTime = countdownService.formattedTime;
      
    } else {
      // Try to get the service entry to see what happened
      const entry = manager.services.get('countdown');
      // console.log('Service entry:', entry);
      if (entry && entry.instance) {
        // console.log('Entry has instance but get() returned null');
        // console.log('Entry instance state:', entry.instance.state);
        // console.log('Entry instance error:', entry.instance.error);
      }
    }

    addLog('Services initialized successfully');
  } catch (error) {
    addLog(`Failed to start services: ${error.message}`);
    // console.error('Service startup error:', error);
  }
});

onDestroy(async () => {
  if (manager) {
    await manager.stopAll();
    addLog('Services stopped');
  }
});

async function extendCountdown() {
  if (!countdownService) return;
  
  const currentTarget = new Date(targetTime);
  const newTarget = new Date(currentTarget.getTime() + 60000); // Add 1 minute
  
  addLog(`Extending countdown to ${newTarget.toLocaleTimeString()}`);
  
  // Live configuration update via ConfigPlugin
  await configPlugin.replaceConfig('countdown', {
    targetTime: newTarget.toISOString()
  });
}

async function resetCountdown() {
  if (!countdownService) return;
  
  const newTarget = new Date(Date.now() + 120000); // 2 minutes from now
  
  addLog(`Resetting countdown to ${newTarget.toLocaleTimeString()}`);
  
  await configPlugin.replaceConfig('countdown', {
    targetTime: newTarget.toISOString()
  });
}

async function checkHealth() {
  if (!manager) return;
  
  const health = await manager.checkHealth();
  addLog(`Health check: ${JSON.stringify(health.countdown, null, 2)}`);
}
</script>

<div class="container mx-auto p-20up" data-page>
  <h1 class="type-heading-h1 mb-20up">Client services example</h1>
  
  <p class="type-base-md mb-20up">
    This example demonstrates the core services architecture:
    <strong>ServiceBase</strong> inheritance, <strong>ServiceManager</strong> orchestration, 
    and <strong>ConfigPlugin</strong> with live configuration updates.
  </p>
  
  <!-- Countdown Display -->
  <div class="card p-20up mb-20up" data-section="countdown">
    <h2 class="type-heading-h2 mb-16bt">Mission countdown</h2>
    
    <div class="text-center mb-20up">
      <div class="type-heading-h1 text-primary-500 mb-12bt">{formattedTime}</div>
      {#if targetTime}
        <div class="type-ui-sm text-surface-600">Target: {targetTime.toLocaleString()}</div>
      {/if}
    </div>
    
    <div class="flex gap-10up justify-center flex-wrap">
      <Button onclick={extendCountdown}>Extend +1 minute</Button>
      <Button onclick={resetCountdown}>Reset (2 minutes)</Button>
      <Button onclick={checkHealth}>Check health</Button>
    </div>
  </div>
  
  <!-- Service Status -->
  <div class="card p-20up mb-20up" data-section="status">
    <h2 class="type-heading-h2 mb-16bt">Service status</h2>
    <div class="space-y-5up">
      {#each Object.entries(serviceStates) as [serviceName, state]}
        <div class="flex gap-10up items-center">
          <span class="type-base-md font-medium">{serviceName}:</span>
          <span 
            class="type-ui-sm uppercase px-10up py-2up rounded"
            class:bg-success-100={state === 'running'}
            class:text-success-700={state === 'running'}
            class:bg-error-100={state === 'error'}
            class:text-error-700={state === 'error'}
            class:bg-surface-200={state !== 'running' && state !== 'error'}
            class:text-surface-600={state !== 'running' && state !== 'error'}
          >
            {state}
          </span>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Event Log -->
  <div class="card p-20up mb-20up" data-section="log">
    <h2 class="type-heading-h2 mb-16bt">Event log</h2>
    <div class="log-container bg-surface-100 p-10up rounded max-h-200 overflow-y-auto">
      {#each logs as logEntry}
        <div class="type-ui-sm mb-2up break-all">{logEntry}</div>
      {/each}
    </div>
  </div>
  
  <!-- Technical Notes -->
  <div class="card p-20up" data-section="notes">
    <h2 class="type-heading-h2 mb-16bt">What's happening</h2>
    <ul class="space-y-6up type-base-md">
      <li><strong>ServiceBase:</strong> CountdownService extends ServiceBase with lifecycle methods</li>
      <li><strong>ServiceManager:</strong> Orchestrates service registration, startup, and event handling</li>
      <li><strong>ConfigPlugin:</strong> Enables live configuration updates without service restart</li>
      <li><strong>Svelte 5:</strong> Reactive countdown updates using $state and $effect</li>
      <li><strong>Health monitoring:</strong> Built-in health checks with custom service status</li>
    </ul>
  </div>
</div>

<style src="./style.css"></style>
