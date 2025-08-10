# UI Library Organization

## Primitives vs Components

### **Primitives** (`$lib/ui/primitives/`)
Basic building blocks that are:
- Single-purpose
- Stateless or minimal state
- Used as building blocks for more complex components
- Simple, focused functionality

**Examples:**
- **buttons/** - Basic interactive elements
- **icons/** - Simple icon wrappers  
- **inputs/** - Form controls
- **area/** - Basic layout containers (HkArea, HkGridArea)
- **panels/** - Simple panel wrapper

### **Components** (`$lib/ui/components/`)
Compound or complex components that are:
- Feature-complete solutions
- Often stateful with complex behavior
- Solve specific use cases
- Combine multiple primitives or have complex internal logic

**Examples:**
- **presenter/** - Complex slideshow with state management
- **image-box/** - Feature-rich image display
- **game-box/** - Specialized game container
- **hk-app-layout/** - Complex app layout with state
- **compare-left-right/** - Specialized comparison view
- **virtual-viewport/** - Complex viewport management
- **button-group/** - Compound button collection
- **drag-drop/** - Complex system with multiple interdependent parts
- **tab-bar/** - Complex component with state management
- **grid-layers/** - Complex layout system with utilities
- **rows/** - Layout components that combine multiple elements

## Usage

```javascript
// Import primitives for building blocks
import { Button, TextInput, HkIcon } from '$lib/ui/primitives.js';

// Import components for complete solutions
import { Presenter, ImageBox, HkAppLayout } from '$lib/ui/components.js';
```

The distinction helps library users understand the intended use and complexity of each component.