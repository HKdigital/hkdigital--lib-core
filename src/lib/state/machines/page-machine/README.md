# PageMachine

State machine for managing page view states with URL route mapping.

## How it connects

```
┌─────────────────────────────────────────────────────────┐
│ MyFlowPageMachine (extends PageMachine)                 │
│ - Maps states to URL routes                             │
│ - Tracks current state and visited states               │
│ - Provides computed properties (inIntro, inStep1, etc.) │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Contained in state
                 │
┌────────────────▼────────────────────────────────────────┐
│ MyFlowState (extends RouteStateContext)                 │
│ get pageMachine() { return this.#pageMachine; }         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Context provided to layout
                 │
┌────────────────▼────────────────────────────────────────┐
│ +layout.svelte                                          │
│ IMPORTANT: Must sync URL with state:                    │
│   $effect(() => {                                       │
│     pageMachine.syncFromPath($page.url.pathname);       │
│   });                                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Pages use machine state
                 │
        ┌────────┴─────────┬────────────────┐
        ▼                  ▼                ▼
  ┌──────────┐      ┌──────────┐    ┌──────────┐
  │ +page    │      │ +page    │    │ Component│
  │          │      │          │    │          │
  └──────────┘      └──────────┘    └──────────┘
  Access via: pageMachine.current, pageMachine.inIntro, etc.
```

## Main Purposes

1. **Track current view/step** - Which page is active
2. **Map states to URL paths** - Connect state names to routes
3. **Sync with browser navigation** - Keep state in sync with URL
4. **Track visited states** - Know which pages user has seen

## Basic Usage

### 1. Create a page machine class

```javascript
// my-flow.machine.svelte.js
import PageMachine from '$lib/state/machines/PageMachine.svelte.js';

export const STATE_INTRO = 'intro';
export const STATE_STEP1 = 'step1';
export const STATE_STEP2 = 'step2';

export default class MyFlowPageMachine extends PageMachine {
  constructor(initialData = {}) {
    const routeMap = {
      [STATE_INTRO]: '/my-flow/intro',
      [STATE_STEP1]: '/my-flow/step1',
      [STATE_STEP2]: '/my-flow/step2'
    };

    super(STATE_INTRO, routeMap, initialData);
  }

  // Computed properties for convenience
  get inIntro() {
    return this.current === STATE_INTRO;
  }

  get inStep1() {
    return this.current === STATE_STEP1;
  }
}
```

### 2. Use in state container

```javascript
// my-flow.state.svelte.js
import { RouteStateContext } from '$lib/state/context.js';
import MyFlowPageMachine from './my-flow.machine.svelte.js';

export class MyFlowState extends RouteStateContext {
  #pageMachine;

  constructor() {
    super();
    this.#pageMachine = new MyFlowPageMachine();
  }

  get pageMachine() {
    return this.#pageMachine;
  }
}
```

### 3. Sync with route in +layout.svelte component

**This is IMPORTANT for url path to be connected to the page machine**

```svelte
<script>
  import { page } from '$app/stores';
  import { getMyFlowState } from '../my-flow.state.svelte.js';

  const flowState = getMyFlowState();
  const pageMachine = flowState.pageMachine;

  // Sync machine with URL changes
  $effect(() => {
    pageMachine.syncFromPath($page.url.pathname);
  });
</script>

{#if pageMachine.inIntro}
  <IntroView />
{:else if pageMachine.inStep1}
  <Step1View />
{/if}
```

## Key Methods

```javascript
// Sync with URL path
machine.syncFromPath(currentPath)

// Get current state
machine.current

// Get route for state
machine.getPathForState(stateName)

// Data properties (for business logic)
machine.setData('KEY', value)
machine.getData('KEY')

// Visited states tracking
machine.hasVisited(stateName)
machine.getVisitedStates()
```

## Important Notes

- Not a finite state machine - allows free navigation
- States map 1:1 with routes
- Use state constants instead of magic strings
- Always sync in `$effect` watching `$page.url.pathname`
- Data properties are for business logic, not UI state
