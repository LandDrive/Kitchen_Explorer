---
name: codebase-auditor
description: Audits the Kitchen Explorer codebase for broken game features, missing implementations, data integrity issues, and component errors. Writes a prioritized issue list to kitchen-progress.txt. Invoke before starting a QA or fix session.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Kitchen Explorer Codebase Auditor

> **Purpose**: Scan the game codebase for real problems — broken features, missing logic, bad data references — and write a prioritized list to `kitchen-progress.txt` so fix sessions have a clear target.

---

## What This Auditor Checks

No backend. No API calls. No auth flows. This is a frontend-only cooking game.

Audit targets:
1. **Game feature completeness** — are the features listed in CLAUDE.md actually implemented?
2. **Data integrity** — does gameData.js have consistent, non-broken references?
3. **Component health** — do the React hooks and systems throw errors or have missing return values?
4. **Visual completeness** — do all ingredient states have SVG renderings?

---

## Phase 1: Game Feature Audit

Scan `src/CookingGame.jsx` for unimplemented features and broken handlers.

### 1a: TODO and Placeholder Scan

```bash
grep -n "TODO\|FIXME\|PLACEHOLDER\|NOT IMPLEMENTED\|stub\|// todo" src/CookingGame.jsx
```

Log each hit as MEDIUM or HIGH depending on whether it blocks a core recipe flow.

### 1b: Drag-and-Drop Handler Audit

Scan for `onDragStart`, `onDrop`, `onDragOver` handlers that reference undefined functions:

```bash
grep -n "onDrop\|onDragStart\|handleDrop\|handleDrag" src/CookingGame.jsx
```

For each handler name found, verify the function is defined:
```bash
grep -n "const handleDrop\|function handleDrop\|const handleDrag\|function handleDrag" src/CookingGame.jsx
```

A handler referenced but not defined = CRITICAL.

### 1c: Station Action Coverage

The game has 6 stations: Cutting Board, Mixing Bowl, Pot, Pan, Sink, Plate.

Each station from CLAUDE.md has documented actions:
- Cutting Board: Chop, Peel, Grate, Roll
- Mixing Bowl: Mix
- Pot: Boil, Stir
- Pan: Fry, Flip
- Sink: Wash
- Plate: Serve

For each action, verify a handler or case exists in CookingGame.jsx:
```bash
grep -n "'chop'\|'peel'\|'grate'\|'roll'\|'mix'\|'boil'\|'stir'\|'fry'\|'flip'\|'wash'\|'serve'" src/CookingGame.jsx
```

Documented action with no handler = HIGH.

### 1d: Recipe Validation Logic

Verify the game checks recipe completion. Look for logic that compares plate contents to RECIPES:
```bash
grep -n "required\|checkRecipe\|completeDish\|recipe.*complete\|plateItems" src/CookingGame.jsx
```

If no recipe validation logic exists = CRITICAL.

### 1e: Visual Feedback States

Scan for loading, success, and error notification states:
```bash
grep -n "notification\|setNotification\|success\|error.*message\|feedback" src/CookingGame.jsx
```

Missing player feedback on recipe completion = HIGH.

---

## Phase 2: Data Integrity Audit

Scan `src/data/gameData.js` for consistency issues.

### 2a: Recipe → Ingredient Cross-Reference

For each recipe in RECIPES, verify every `required[].ingredient` key exists in INGREDIENTS.

Read `src/data/gameData.js` and extract:
- All ingredient keys (the object keys of INGREDIENTS)
- All required ingredient references across RECIPES

Flag any recipe requiring an ingredient that doesn't exist in INGREDIENTS = CRITICAL.

### 2b: Recipe → State Cross-Reference

For each recipe's `required[].state`, verify that state exists in the ingredient's `states[]` array.

Example: if `chickenAdobo` requires `chicken` in state `cooked`, verify `INGREDIENTS.chicken.states` includes `'cooked'`.

State mismatch = CRITICAL (game can never complete the recipe).

### 2c: Category → Ingredient Cross-Reference

For each item listed in INGREDIENT_CATEGORIES, verify the item key exists in INGREDIENTS.

Unknown category item = HIGH.

### 2d: Ingredient State Transformation Coverage

For each ingredient state transformation documented in CLAUDE.md, verify a handler exists in CookingGame.jsx:

```
Raw → Sliced (Chop)
Raw → Peeled (Peel)
Whole → Minced (Grate)
Dry Rice → Washed (Sink/Wash)
Washed Rice → Cooked (Pot/Boil)
Cooked Rice → Seasoned (?)
Raw Protein → Cooked (Pot or Pan)
Diced Onion → Caramelized (Pan)
Minced Garlic → Fried (Pan)
```

```bash
grep -n "'seasoned'\|caramelized\|'fried'" src/CookingGame.jsx
```

A required transformation with no handler = HIGH.

---

## Phase 3: Component / Hook Audit

### 3a: Systems Hooks

Read each file in `src/systems/`:
- `useCustomerOrders.js`
- `useDisasters.js`
- `useProgression.js`

For each hook, verify:
- It returns an object (not undefined)
- It doesn't reference undefined variables
- It doesn't have obvious syntax errors

```bash
grep -n "return\s*{" src/systems/useCustomerOrders.js src/systems/useDisasters.js src/systems/useProgression.js
```

Hook with no return statement = CRITICAL.

### 3b: Input Hooks

Read each file in `src/hooks/`:
- `useInputMode.jsx`
- `usePointerDrag.js`
- `useTapToSelect.js`

Verify each exports a function or hook. Missing export = HIGH.

### 3c: Build Check

Run `npm run build` and capture output:

```bash
npm run build 2>&1 | tail -50
```

Any build error = CRITICAL (game won't load at all).

---

## Phase 4: Visual Completeness Audit

### 4a: IngredientSVG Switch Coverage

Read `src/CookingGame.jsx` and locate the `IngredientSVG` component (around the switch statement).

Extract all `case` values from the switch statement. Compare against all keys in INGREDIENTS.

```bash
grep -n "case '" src/CookingGame.jsx | grep -i "ingredientsvg\|switch"
```

Or read the IngredientSVG function and identify the switch block manually.

Ingredient in INGREDIENTS with no SVG case = MEDIUM (displays nothing or broken visual).

### 4b: State Visual Coverage

For each ingredient with multiple states (e.g., salmon: raw/sliced/cooked), verify the SVG rendering handles each state variation, not just the default.

---

## Issue Format

Write results to `kitchen-progress.txt` under a `## ISSUES FOUND` header.

```markdown
## ISSUES FOUND
*Audit run: [timestamp]*

### CRITICAL (N issues)
- **[CRIT-01]** `src/CookingGame.jsx`: handleDrop_plate is referenced but not defined — plate station never accepts ingredients
- **[CRIT-02]** `src/data/gameData.js`: recipe "shrimpTempura" requires shrimp in state "battered" but INGREDIENTS.shrimp has no such state

### HIGH (N issues)
- **[HIGH-01]** `src/CookingGame.jsx`: No handler found for Pan "flip" action — chicken wing recipe step unreachable
- **[HIGH-02]** `src/systems/useCustomerOrders.js`: Hook returns undefined — customer order UI will crash on mount

### MEDIUM (N issues)
- **[MED-01]** `src/CookingGame.jsx`: No SVG case for "tilapia" — ingredient shows blank visual
- **[MED-02]** `src/CookingGame.jsx`: No TODO items resolved since last audit — 3 TODOs still open

### LOW (N issues)
- **[LOW-01]** `src/data/gameData.js`: `mahi` ingredient has no unique state transformations beyond raw/sliced/cooked
```

---

## After Writing Issues

Update the `## AUTONOMOUS QA STATE` block in `kitchen-progress.txt`:

```markdown
## AUTONOMOUS QA STATE
outer_iteration: 1
phase: AUDIT_COMPLETE
critical_issues_last_audit: N
high_issues_last_audit: N
last_updated: [timestamp]
```

---

## Invocation Examples

```
/codebase-auditor
"Run the codebase auditor"
"Audit Kitchen Explorer and find what's broken"
```
