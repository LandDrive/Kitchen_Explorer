import { describe, it, expect } from 'vitest';
import { INGREDIENTS, INGREDIENT_CATEGORIES, RECIPES } from '../data/gameData.js';

// ============================================================================
// INGREDIENTS DATA LAYER TESTS
// ============================================================================

describe('INGREDIENTS', () => {
  it('has entries defined', () => {
    expect(Object.keys(INGREDIENTS).length).toBeGreaterThan(0);
  });

  it('every ingredient has required fields: id (key), name, category, states', () => {
    for (const [id, ingredient] of Object.entries(INGREDIENTS)) {
      expect(ingredient, `ingredient "${id}" missing name`).toHaveProperty('name');
      expect(ingredient, `ingredient "${id}" missing category`).toHaveProperty('category');
      expect(ingredient, `ingredient "${id}" missing states`).toHaveProperty('states');
      expect(typeof ingredient.name, `ingredient "${id}" name must be string`).toBe('string');
      expect(ingredient.name.length, `ingredient "${id}" name must not be empty`).toBeGreaterThan(0);
      expect(Array.isArray(ingredient.states), `ingredient "${id}" states must be an array`).toBe(true);
      expect(ingredient.states.length, `ingredient "${id}" must have at least one state`).toBeGreaterThan(0);
    }
  });

  it('every ingredient category is a valid enum value', () => {
    const validCategories = new Set(Object.keys(INGREDIENT_CATEGORIES));
    for (const [id, ingredient] of Object.entries(INGREDIENTS)) {
      expect(
        validCategories.has(ingredient.category),
        `ingredient "${id}" has unknown category "${ingredient.category}"`
      ).toBe(true);
    }
  });

  it('every ingredient state is a non-empty string', () => {
    for (const [id, ingredient] of Object.entries(INGREDIENTS)) {
      for (const state of ingredient.states) {
        expect(typeof state, `ingredient "${id}" has non-string state: ${state}`).toBe('string');
        expect(state.length, `ingredient "${id}" has empty state string`).toBeGreaterThan(0);
      }
    }
  });
});

// ============================================================================
// INGREDIENT CATEGORIES TESTS
// ============================================================================

describe('INGREDIENT_CATEGORIES', () => {
  it('has entries defined', () => {
    expect(Object.keys(INGREDIENT_CATEGORIES).length).toBeGreaterThan(0);
  });

  it('every category has required fields: name, icon, items', () => {
    for (const [id, category] of Object.entries(INGREDIENT_CATEGORIES)) {
      expect(category, `category "${id}" missing name`).toHaveProperty('name');
      expect(category, `category "${id}" missing icon`).toHaveProperty('icon');
      expect(category, `category "${id}" missing items`).toHaveProperty('items');
      expect(Array.isArray(category.items), `category "${id}" items must be an array`).toBe(true);
    }
  });

  it('every item listed in a category exists in INGREDIENTS', () => {
    for (const [categoryId, category] of Object.entries(INGREDIENT_CATEGORIES)) {
      for (const itemId of category.items) {
        expect(
          INGREDIENTS[itemId],
          `category "${categoryId}" references unknown ingredient "${itemId}"`
        ).toBeDefined();
      }
    }
  });
});

// ============================================================================
// RECIPES DATA LAYER TESTS
// ============================================================================

describe('RECIPES', () => {
  it('has entries defined', () => {
    expect(Object.keys(RECIPES).length).toBeGreaterThan(0);
  });

  it('every recipe has required fields: name, required, optional, action, emoji', () => {
    for (const [id, recipe] of Object.entries(RECIPES)) {
      expect(recipe, `recipe "${id}" missing name`).toHaveProperty('name');
      expect(recipe, `recipe "${id}" missing required`).toHaveProperty('required');
      expect(recipe, `recipe "${id}" missing optional`).toHaveProperty('optional');
      expect(recipe, `recipe "${id}" missing action`).toHaveProperty('action');
      expect(recipe, `recipe "${id}" missing emoji`).toHaveProperty('emoji');
      expect(Array.isArray(recipe.required), `recipe "${id}" required must be an array`).toBe(true);
      expect(Array.isArray(recipe.optional), `recipe "${id}" optional must be an array`).toBe(true);
      expect(recipe.required.length, `recipe "${id}" must have at least one required ingredient`).toBeGreaterThan(0);
    }
  });

  it('every required ingredient entry has ingredient and state fields', () => {
    for (const [recipeId, recipe] of Object.entries(RECIPES)) {
      for (const req of recipe.required) {
        expect(
          req,
          `recipe "${recipeId}" required entry missing ingredient field`
        ).toHaveProperty('ingredient');
        expect(
          req,
          `recipe "${recipeId}" required entry missing state field`
        ).toHaveProperty('state');
      }
    }
  });

  it("every recipe's required ingredients exist in INGREDIENTS", () => {
    for (const [recipeId, recipe] of Object.entries(RECIPES)) {
      for (const req of recipe.required) {
        expect(
          INGREDIENTS[req.ingredient],
          `recipe "${recipeId}" requires unknown ingredient "${req.ingredient}"`
        ).toBeDefined();
      }
    }
  });

  it("every recipe's required ingredient state exists in that ingredient's states array", () => {
    for (const [recipeId, recipe] of Object.entries(RECIPES)) {
      for (const req of recipe.required) {
        const ingredient = INGREDIENTS[req.ingredient];
        if (!ingredient) continue; // caught by previous test
        expect(
          ingredient.states.includes(req.state),
          `recipe "${recipeId}" requires "${req.ingredient}" in state "${req.state}", ` +
          `but that state is not in [${ingredient.states.join(', ')}]`
        ).toBe(true);
      }
    }
  });

  it("every recipe's optional ingredients exist in INGREDIENTS", () => {
    for (const [recipeId, recipe] of Object.entries(RECIPES)) {
      for (const optId of recipe.optional) {
        expect(
          INGREDIENTS[optId],
          `recipe "${recipeId}" lists unknown optional ingredient "${optId}"`
        ).toBeDefined();
      }
    }
  });

  it('every recipe action is a valid station action', () => {
    const validActions = new Set(['roll', 'fry', 'boil', 'mix', 'bake', 'chop', 'stir']);
    for (const [id, recipe] of Object.entries(RECIPES)) {
      expect(
        validActions.has(recipe.action),
        `recipe "${id}" has unknown action "${recipe.action}"`
      ).toBe(true);
    }
  });
});
