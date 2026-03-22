---
name: test-suite-generator
description: Generates Vitest unit and component tests for Kitchen Explorer. No Playwright, no E2E. Tests go in src/test/. Invoke when adding coverage for new features or refactored utility functions.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Test Suite Generator — Kitchen Explorer

> **Purpose**: Write tests that prove game behavior works correctly. Focus on data validation, pure utility functions, and basic component rendering.

---

## What We Test (and What We Don't)

### Test

- **Data layer** (`src/data/gameData.js`): ingredient integrity, recipe cross-references, state validity
- **Pure utility functions** (`src/utils/` — once extracted from CookingGame.jsx): recipe validation, state transformation logic, tip calculation
- **Game logic hooks** (`src/systems/`): that hooks return correctly shaped data, that state transitions are valid
- **Basic component rendering** (`src/CookingGame.jsx`): mounts without crashing, core elements render

### Do NOT Test

- Drag-and-drop interactions (too brittle in jsdom, not worth the maintenance cost)
- SVG rendering details (visual correctness is manual)
- Animation state (CSS transitions don't run in jsdom)
- Full recipe completion flows (game interaction is too complex for automation at this stage — manual QA instead)

---

## Test File Locations

All test files go in `src/test/`:

```
src/test/
├── setup.js              # @testing-library/jest-dom import (already exists)
├── gameData.test.js      # Data layer tests (already exists)
├── utils.test.js         # Pure utility function tests (already exists)
├── systems.test.js       # Hook unit tests
└── CookingGame.test.jsx  # Component smoke tests
```

---

## Pattern: Data Layer Tests

Reference: `src/test/gameData.test.js` (already written).

Template for adding a new data section (e.g., CHEF_LEVELS, CUSTOMER_TYPES):

```js
import { describe, it, expect } from 'vitest';
import { CHEF_LEVELS } from '../data/gameData.js';

describe('CHEF_LEVELS', () => {
  it('has entries defined', () => {
    expect(Array.isArray(CHEF_LEVELS)).toBe(true);
    expect(CHEF_LEVELS.length).toBeGreaterThan(0);
  });

  it('every level has required fields: level, title, xpRequired', () => {
    for (const entry of CHEF_LEVELS) {
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('title');
      expect(entry).toHaveProperty('xpRequired');
      expect(typeof entry.xpRequired).toBe('number');
      expect(entry.xpRequired).toBeGreaterThanOrEqual(0);
    }
  });

  it('levels are in ascending order', () => {
    for (let i = 1; i < CHEF_LEVELS.length; i++) {
      expect(CHEF_LEVELS[i].xpRequired).toBeGreaterThan(CHEF_LEVELS[i - 1].xpRequired);
    }
  });
});
```

---

## Pattern: Pure Utility Function Tests

When logic is extracted from CookingGame.jsx into `src/utils/`, write tests here.

Template for a state transformation validator:

```js
import { describe, it, expect } from 'vitest';
import { getNextState } from '../utils/stateTransforms.js';

describe('getNextState', () => {
  it('returns sliced when chopping a raw ingredient', () => {
    expect(getNextState('salmon', 'raw', 'chop')).toBe('sliced');
  });

  it('returns null for invalid action on ingredient', () => {
    expect(getNextState('salt', 'dry', 'boil')).toBeNull();
  });

  it('returns cooked when frying peeled shrimp', () => {
    expect(getNextState('shrimp', 'peeled', 'fry')).toBe('cooked');
  });
});
```

Template for recipe completion check:

```js
import { describe, it, expect } from 'vitest';
import { checkRecipeCompletion } from '../utils/recipeValidator.js';
import { RECIPES } from '../data/gameData.js';

describe('checkRecipeCompletion', () => {
  it('returns true when all required items are on plate in correct state', () => {
    const plate = [
      { id: 'rice', state: 'seasoned' },
      { id: 'salmon', state: 'sliced' },
      { id: 'nori', state: 'dry' },
    ];
    expect(checkRecipeCompletion(plate, RECIPES.salmonMaki)).toBe(true);
  });

  it('returns false when required item is in wrong state', () => {
    const plate = [
      { id: 'rice', state: 'cooked' }, // needs 'seasoned'
      { id: 'salmon', state: 'sliced' },
      { id: 'nori', state: 'dry' },
    ];
    expect(checkRecipeCompletion(plate, RECIPES.salmonMaki)).toBe(false);
  });

  it('returns false when a required ingredient is missing entirely', () => {
    const plate = [
      { id: 'rice', state: 'seasoned' },
      { id: 'salmon', state: 'sliced' },
      // nori missing
    ];
    expect(checkRecipeCompletion(plate, RECIPES.salmonMaki)).toBe(false);
  });
});
```

---

## Pattern: Hook Tests

File: `src/test/systems.test.js`

Test that hooks return the correct shape without crashing. Use `renderHook` from React Testing Library.

```js
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useProgression from '../systems/useProgression.js';

describe('useProgression', () => {
  it('mounts without throwing', () => {
    expect(() => renderHook(() => useProgression())).not.toThrow();
  });

  it('returns an object with expected fields', () => {
    const { result } = renderHook(() => useProgression());
    expect(result.current).toBeDefined();
    // Add specific field checks based on what the hook actually returns
    // e.g.: expect(result.current).toHaveProperty('level');
    //       expect(result.current).toHaveProperty('xp');
  });
});
```

Same pattern applies to `useCustomerOrders` and `useDisasters`.

---

## Pattern: Component Smoke Tests

File: `src/test/CookingGame.test.jsx`

These are lightweight — just verify the component mounts and renders key structural elements.

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CookingGame from '../CookingGame.jsx';

describe('CookingGame', () => {
  it('mounts without crashing', () => {
    expect(() => render(<CookingGame />)).not.toThrow();
  });

  it('renders the pantry section', () => {
    render(<CookingGame />);
    // Adjust selector to match actual rendered text or role in CookingGame.jsx
    expect(screen.getByText(/pantry/i)).toBeInTheDocument();
  });

  it('renders at least one kitchen station', () => {
    render(<CookingGame />);
    // Adjust to match actual station labels rendered
    const stations = screen.getAllByRole('region');
    expect(stations.length).toBeGreaterThan(0);
  });
});
```

**Note on mocking**: CookingGame.jsx uses browser drag-and-drop events. These don't need mocking for smoke tests since we're only checking that the component renders, not that drag works.

---

## Running Tests

```bash
# Single run (CI mode)
npm run test

# Watch mode (development)
npm run test:watch

# Run a specific test file
npx vitest run src/test/gameData.test.js
```

---

## What Makes a Good Game Test

1. **Tests real game behavior**: not implementation details
2. **Clear failure message**: if it fails, you know exactly what broke
3. **No false positives**: the test only passes when behavior is actually correct
4. **Stable**: doesn't break when unrelated code changes
5. **Fast**: each test file runs in under 2 seconds

---

## Related Skills

| Need | Skill |
|---|---|
| Find what's broken first | `codebase-auditor` |
| Fix broken code | `development-loop` |
| Run the full improvement loop | `autonomous-qa-loop` |
