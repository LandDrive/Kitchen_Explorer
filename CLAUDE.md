# Kitchen Explorer - Project Instructions

## Project Overview

**Kitchen Explorer** is an interactive cooking game built for an 11-year-old player. The game teaches cooking concepts through a drag-and-drop interface where players can prepare ingredients, combine them at various stations, and create complete dishes.

### Target Audience

- **Primary**: 11-year-old child learning cooking concepts
- **Design Goals**: Fun, educational, forgiving, visually engaging

### Technology Stack

- **Framework**: React (functional components with hooks)
- **Styling**: Tailwind CSS with inline styles for complex visuals
- **Graphics**: Custom SVG ingredient renderings with detailed visual states
- **State Management**: React useState hooks
- **Interactions**: HTML5 Drag and Drop API

## Architecture Overview

### File Structure

```
Kitchen_Explorer/
├── cooking-game.jsx     # Main game component (~2200 lines)
└── CLAUDE.md           # Project instructions (this file)
```

### Component Structure

**Main Component**: `CookingGame` (line 1330)

- Single-file architecture containing all game logic and visuals
- Uses React hooks for state management

**Key Sub-Components**:

- `IngredientSVG` (line 95): Renders detailed SVG graphics for each ingredient in various states
- `SteamEffect` (line 1090): Animated steam particles for cooking visualization
- `SizzleEffect`: Oil sizzle animation for frying
- `SushiRollVisual`: Rolled sushi visualization
- `MixedIngredientsVisual`: Combined ingredients display

### Data Models

**INGREDIENTS** (line 4-80):

- 50+ ingredients across 9 categories
- Each has: `name`, `category`, `states[]` (raw, cooked, sliced, etc.)

**INGREDIENT_CATEGORIES** (line 82-92):

- seafood, meat, vegetable, starch, dairy, sauce, spice, wrapper, protein

**RECIPES** (line 1082-1088):

- 5 complete recipes: Salmon Maki, Chicken Adobo, Fried Rice, Shrimp Tempura, Ginger Chicken
- Each has: `required[]` ingredients with states, `optional[]`, `action` trigger

### Kitchen Stations

| Station       | Purpose             | Actions Available       |
| ------------- | ------------------- | ----------------------- |
| Cutting Board | Prep ingredients    | Chop, Peel, Grate, Roll |
| Mixing Bowl   | Combine ingredients | Mix                     |
| Pot           | Boil/simmer         | Boil, Stir              |
| Pan           | Fry/sauté           | Fry, Flip               |
| Sink          | Wash ingredients    | Wash                    |
| Plate         | Final presentation  | Serve                   |

### Ingredient State Transformations

```
Raw → Sliced/Diced/Minced (via Chop)
Raw → Peeled (via Peel)
Whole → Minced (via Grate)
Dry Rice → Washed → Cooked → Seasoned
Raw Protein → Cooked (via Pot/Pan)
Diced Onion → Caramelized (via Pan)
Minced Garlic → Fried (via Pan)
```

## Development Guidelines

### Adding New Ingredients

1. Add to `INGREDIENTS` object with proper states
2. Add to appropriate category in `INGREDIENT_CATEGORIES`
3. Create SVG rendering in `IngredientSVG` switch statement
4. Handle all defined states (raw, cooked, sliced, etc.)

### Adding New Recipes

Add to `RECIPES` object:

```javascript
newRecipe: {
  name: 'Display Name',
  description: 'Brief description',
  required: [
    { ingredient: 'ingredientId', state: 'requiredState' }
  ],
  optional: ['ingredientId'],
  action: 'roll|fry|boil|mix',
  emoji: '🍽️'
}
```

### SVG Ingredient Guidelines

- Use gradients for realistic appearance
- Include shadows for depth
- Show state changes clearly (raw vs cooked coloring)
- Keep viewBox consistent (usually 0 0 50 50)
- Use filters for texture effects sparingly

### State Management

Key state variables:

- `cuttingBoardItems`, `mixingBowlItems`, `potItems`, `panItems`, `sinkItems`, `plateItems`
- `selectedTool` - current active tool
- `completedDishes` - successfully made recipes
- `sushiRoll` - current roll in progress
- `potHeat`, `panHeat` - cooking animations active
- `waterRunning` - sink animation

### Drag and Drop Flow

1. `handleDragStart`: Sets `draggedItem` with type, state, source
2. `handleDrop`: Routes to appropriate station handler
3. Station handlers validate and transform ingredients

## Code Style Preferences

- **Single-file component**: Keep all related code together for simplicity
- **Inline SVG**: Detailed graphics directly in component
- **Tailwind + inline styles**: Tailwind for layout, inline for complex gradients
- **Descriptive notifications**: Guide the player with helpful messages
- **Forgiving gameplay**: Give hints rather than hard failures

## Testing Considerations

### Manual Testing Checklist

- [ ] Drag ingredients from pantry to each station
- [ ] Transform ingredients through all state changes
- [ ] Complete each recipe successfully
- [ ] Test recipe validation feedback
- [ ] Verify visual states render correctly
- [ ] Check mobile/touch interactions

### Key User Flows

1. **Basic Sushi Roll**: Rice → Wash → Cook → Season → Roll with salmon + nori
2. **Fried Rice**: Cook rice + fry egg → combine with soy sauce
3. **Chicken Adobo**: Dice garlic → add chicken + soy + vinegar → boil

## Known Limitations & Future Enhancements

### Current Limitations

- Single-file architecture (could split for larger features)
- No persistent save state
- Limited mobile touch optimization
- No sound effects

### Potential Enhancements

- More recipes (expand from 5)
- Difficulty levels / timed challenges
- Achievement system
- Kitchen unlockables
- Recipe discovery mode
- Multiplayer cooking challenges
- Sound effects and music
- Save/load progress
- Tutorial mode for new players

## Performance Notes

- SVG rendering is computationally intensive with many ingredients
- Steam/sizzle effects use CSS animations for efficiency
- Consider virtualization if pantry grows significantly
- Drag preview uses native browser handling

## Contact & Context

This is a personal project for educational entertainment. The design prioritizes:

1. **Fun over realism** - Simplified cooking steps
2. **Learning** - Teaches real ingredient combinations
3. **Accessibility** - Large touch targets, clear feedback
4. **Visual appeal** - Detailed, appetizing ingredient graphics
