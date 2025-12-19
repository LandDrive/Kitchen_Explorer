import React, { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================================
// INGREDIENT DEFINITIONS
// ============================================================================

const INGREDIENTS = {
  // Fish & Seafood
  salmon: { name: 'Salmon', category: 'seafood', states: ['raw', 'sliced', 'cooked'] },
  tuna: { name: 'Tuna', category: 'seafood', states: ['raw', 'sliced', 'cooked'] },
  mahi: { name: 'Mahi Mahi', category: 'seafood', states: ['raw', 'sliced', 'cooked'] },
  tilapia: { name: 'Tilapia', category: 'seafood', states: ['raw', 'sliced', 'cooked'] },
  cod: { name: 'Cod', category: 'seafood', states: ['raw', 'sliced', 'cooked'] },
  shrimp: { name: 'Shrimp', category: 'seafood', states: ['raw', 'peeled', 'cooked'] },
  crab: { name: 'Crab', category: 'seafood', states: ['raw', 'cooked'] },
  scallops: { name: 'Scallops', category: 'seafood', states: ['raw', 'cooked'] },

  // Meat
  chicken: { name: 'Chicken Breast', category: 'meat', states: ['raw', 'diced', 'cooked'] },
  chickenWing: { name: 'Chicken Wing', category: 'meat', states: ['raw', 'cooked'] },
  chickenThigh: { name: 'Chicken Thigh', category: 'meat', states: ['raw', 'diced', 'cooked'] },
  porkBelly: { name: 'Pork Belly', category: 'meat', states: ['raw', 'sliced', 'cooked'] },
  porkChop: { name: 'Pork Chop', category: 'meat', states: ['raw', 'cooked'] },
  groundPork: { name: 'Ground Pork', category: 'meat', states: ['raw', 'cooked'] },
  groundBeef: { name: 'Ground Beef', category: 'meat', states: ['raw', 'cooked'] },
  steak: { name: 'Steak', category: 'meat', states: ['raw', 'sliced', 'cooked'] },
  wagyu: { name: 'Wagyu', category: 'meat', states: ['raw', 'sliced', 'cooked'], unlockLevel: 5 },
  lamb: { name: 'Lamb', category: 'meat', states: ['raw', 'diced', 'cooked'] },
  bacon: { name: 'Bacon', category: 'meat', states: ['raw', 'cooked'] },

  // Vegetables
  onion: { name: 'Onion', category: 'vegetable', states: ['whole', 'diced', 'caramelized'] },
  garlic: { name: 'Garlic', category: 'vegetable', states: ['whole', 'minced', 'fried'] },
  ginger: { name: 'Ginger', category: 'vegetable', states: ['whole', 'peeled', 'minced'] },
  cucumber: { name: 'Cucumber', category: 'vegetable', states: ['whole', 'sliced'] },
  avocado: { name: 'Avocado', category: 'vegetable', states: ['whole', 'sliced'] },
  carrot: { name: 'Carrot', category: 'vegetable', states: ['whole', 'sliced', 'diced'] },
  bellPepper: {
    name: 'Bell Pepper',
    category: 'vegetable',
    states: ['whole', 'sliced', 'diced'],
    unlockLevel: 2,
  },
  broccoli: {
    name: 'Broccoli',
    category: 'vegetable',
    states: ['whole', 'chopped', 'cooked'],
    unlockLevel: 3,
  },
  cabbage: { name: 'Cabbage', category: 'vegetable', states: ['whole', 'shredded'] },
  mushroom: {
    name: 'Mushroom',
    category: 'vegetable',
    states: ['whole', 'sliced', 'cooked'],
    unlockLevel: 3,
  },
  greenOnion: { name: 'Green Onion', category: 'vegetable', states: ['whole', 'chopped'] },
  tomato: { name: 'Tomato', category: 'vegetable', states: ['whole', 'diced'] },
  spinach: { name: 'Spinach', category: 'vegetable', states: ['raw', 'cooked'] },
  bokChoy: {
    name: 'Bok Choy',
    category: 'vegetable',
    states: ['whole', 'chopped', 'cooked'],
    unlockLevel: 4,
  },

  // Starches
  rice: { name: 'Rice', category: 'starch', states: ['dry', 'washed', 'cooked', 'seasoned'] },
  noodles: { name: 'Noodles', category: 'starch', states: ['dry', 'cooked'] },
  flour: { name: 'Flour', category: 'starch', states: ['dry'] },
  potato: { name: 'Potato', category: 'starch', states: ['whole', 'diced', 'cooked'] },
  sweetPotato: { name: 'Sweet Potato', category: 'starch', states: ['whole', 'sliced', 'cooked'] },

  // Dairy & Eggs
  egg: { name: 'Egg', category: 'dairy', states: ['raw', 'beaten', 'cooked'] },
  butter: { name: 'Butter', category: 'dairy', states: ['solid', 'melted'], unlockLevel: 2 },
  cheese: { name: 'Cheese', category: 'dairy', states: ['block', 'shredded'] },
  cream: { name: 'Cream', category: 'dairy', states: ['liquid'] },
  coconutMilk: { name: 'Coconut Milk', category: 'dairy', states: ['liquid'] },

  // Sauces & Liquids
  soySauce: { name: 'Soy Sauce', category: 'sauce', states: ['liquid'] },
  vinegar: { name: 'Rice Vinegar', category: 'sauce', states: ['liquid'] },
  fishSauce: { name: 'Fish Sauce', category: 'sauce', states: ['liquid'] },
  oysterSauce: { name: 'Oyster Sauce', category: 'sauce', states: ['liquid'], unlockLevel: 3 },
  sesameOil: { name: 'Sesame Oil', category: 'sauce', states: ['liquid'], unlockLevel: 3 },
  mirin: { name: 'Mirin', category: 'sauce', states: ['liquid'] },
  sake: { name: 'Sake', category: 'sauce', states: ['liquid'] },
  chiliOil: { name: 'Chili Oil', category: 'sauce', states: ['liquid'], unlockLevel: 4 },
  hoiSin: { name: 'Hoisin Sauce', category: 'sauce', states: ['liquid'] },

  // Spices
  salt: { name: 'Salt', category: 'spice', states: ['dry'] },
  pepper: { name: 'Black Pepper', category: 'spice', states: ['dry'] },
  chiliFlakes: { name: 'Chili Flakes', category: 'spice', states: ['dry'] },
  paprika: { name: 'Paprika', category: 'spice', states: ['dry'], unlockLevel: 4 },
  cumin: { name: 'Cumin', category: 'spice', states: ['dry'], unlockLevel: 4 },
  turmeric: { name: 'Turmeric', category: 'spice', states: ['dry'], unlockLevel: 5 },
  curryPowder: { name: 'Curry Powder', category: 'spice', states: ['dry'], unlockLevel: 5 },
  fiveSpice: { name: 'Five Spice', category: 'spice', states: ['dry'] },
  cinnamon: { name: 'Cinnamon', category: 'spice', states: ['dry'] },
  starAnise: { name: 'Star Anise', category: 'spice', states: ['dry'] },

  // Wrappers & Others
  nori: { name: 'Nori', category: 'wrapper', states: ['dry'] },
  wonton: { name: 'Wonton Wrapper', category: 'wrapper', states: ['dry'] },
  springRoll: { name: 'Spring Roll Wrapper', category: 'wrapper', states: ['dry'] },
  tofu: { name: 'Tofu', category: 'protein', states: ['raw', 'diced', 'fried'] },
  tempeh: { name: 'Tempeh', category: 'protein', states: ['raw', 'sliced', 'fried'] },
};

const INGREDIENT_CATEGORIES = {
  seafood: {
    name: 'Seafood',
    icon: '🐟',
    items: ['salmon', 'tuna', 'mahi', 'tilapia', 'cod', 'shrimp', 'crab', 'scallops'],
  },
  meat: {
    name: 'Meat',
    icon: '🥩',
    items: [
      'chicken',
      'chickenWing',
      'chickenThigh',
      'porkBelly',
      'porkChop',
      'groundPork',
      'groundBeef',
      'steak',
      'wagyu',
      'lamb',
      'bacon',
    ],
  },
  vegetable: {
    name: 'Veggies',
    icon: '🥬',
    items: [
      'onion',
      'garlic',
      'ginger',
      'cucumber',
      'avocado',
      'carrot',
      'bellPepper',
      'broccoli',
      'cabbage',
      'mushroom',
      'greenOnion',
      'tomato',
      'spinach',
      'bokChoy',
    ],
  },
  starch: {
    name: 'Starches',
    icon: '🍚',
    items: ['rice', 'noodles', 'flour', 'potato', 'sweetPotato'],
  },
  dairy: { name: 'Dairy', icon: '🥚', items: ['egg', 'butter', 'cheese', 'cream', 'coconutMilk'] },
  sauce: {
    name: 'Sauces',
    icon: '🫗',
    items: [
      'soySauce',
      'vinegar',
      'fishSauce',
      'oysterSauce',
      'sesameOil',
      'mirin',
      'sake',
      'chiliOil',
      'hoiSin',
    ],
  },
  spice: {
    name: 'Spices',
    icon: '🧂',
    items: [
      'salt',
      'pepper',
      'chiliFlakes',
      'paprika',
      'cumin',
      'turmeric',
      'curryPowder',
      'fiveSpice',
      'cinnamon',
      'starAnise',
    ],
  },
  wrapper: { name: 'Wrappers', icon: '🥟', items: ['nori', 'wonton', 'springRoll'] },
  protein: { name: 'Plant', icon: '🫘', items: ['tofu', 'tempeh'] },
};

// Starting ingredients for new players (Level 1)
const STARTER_INGREDIENTS = [
  'chicken',
  'egg',
  'tofu',
  'onion',
  'garlic',
  'carrot',
  'tomato',
  'cucumber',
  'rice',
  'noodles',
  'soySauce',
  'salt',
  'pepper',
  'nori',
];

// ============================================================================
// PROGRESSION SYSTEM
// ============================================================================

const CHEF_LEVELS = {
  1: { title: 'Kitchen Helper', xpRequired: 0, unlocksMessage: 'Welcome to your kitchen!' },
  2: {
    title: 'Junior Chef',
    xpRequired: 100,
    unlocksMessage: 'You can now use the pan! New ingredients unlocked!',
  },
  3: {
    title: 'Line Cook',
    xpRequired: 300,
    unlocksMessage: 'Exotic ingredients and mixing bowl unlocked!',
  },
  4: { title: 'Sous Chef', xpRequired: 600, unlocksMessage: 'Advanced techniques available!' },
  5: { title: 'Head Chef', xpRequired: 1000, unlocksMessage: 'Premium ingredients unlocked!' },
  6: { title: 'Master Chef', xpRequired: 1500, unlocksMessage: 'You are a culinary master!' },
};

const STATIONS_BY_LEVEL = {
  1: ['cuttingBoard', 'sink', 'pot'],
  2: ['pan'],
  3: ['mixingBowl'],
  4: [],
  5: [],
  6: [],
};

// ============================================================================
// RECIPES
// ============================================================================

const RECIPES = {
  salmonMaki: {
    name: 'Salmon Maki Roll',
    description: 'Classic sushi roll with fresh salmon',
    required: [
      { ingredient: 'rice', state: 'seasoned' },
      { ingredient: 'salmon', state: 'sliced' },
      { ingredient: 'nori', state: 'dry' },
    ],
    optional: ['avocado', 'cucumber'],
    action: 'roll',
    emoji: '🍣',
    difficulty: 'easy',
    xpReward: 20,
  },
  chickenAdobo: {
    name: 'Chicken Adobo',
    description: 'Filipino braised chicken in soy and vinegar',
    required: [
      { ingredient: 'chicken', state: 'cooked' },
      { ingredient: 'soySauce', state: 'liquid' },
      { ingredient: 'vinegar', state: 'liquid' },
      { ingredient: 'garlic', state: 'minced' },
    ],
    optional: ['onion'],
    action: 'boil',
    emoji: '🍲',
    difficulty: 'medium',
    xpReward: 30,
  },
  friedRice: {
    name: 'Fried Rice',
    description: 'Wok-fried rice with egg and vegetables',
    required: [
      { ingredient: 'rice', state: 'cooked' },
      { ingredient: 'egg', state: 'cooked' },
      { ingredient: 'soySauce', state: 'liquid' },
    ],
    optional: ['onion', 'garlic', 'shrimp'],
    action: 'fry',
    emoji: '🍳',
    difficulty: 'easy',
    xpReward: 20,
  },
  shrimpTempura: {
    name: 'Shrimp Tempura',
    description: 'Light and crispy fried shrimp',
    required: [
      { ingredient: 'shrimp', state: 'peeled' },
      { ingredient: 'flour', state: 'dry' },
      { ingredient: 'egg', state: 'beaten' },
    ],
    optional: [],
    action: 'fry',
    emoji: '🍤',
    difficulty: 'medium',
    xpReward: 25,
    unlockLevel: 2,
  },
  gingerChicken: {
    name: 'Ginger Chicken',
    description: 'Aromatic chicken with fresh ginger',
    required: [
      { ingredient: 'chicken', state: 'cooked' },
      { ingredient: 'ginger', state: 'minced' },
      { ingredient: 'garlic', state: 'minced' },
      { ingredient: 'soySauce', state: 'liquid' },
    ],
    optional: ['onion'],
    action: 'fry',
    emoji: '🍗',
    difficulty: 'medium',
    xpReward: 30,
    unlockLevel: 2,
  },
};

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

const CUSTOMER_TYPES = {
  regular: {
    name: 'Regular Customer',
    patience: 180,
    tipMultiplier: 1.0,
    emoji: '😊',
    color: '#4CAF50',
    probability: 0.6,
  },
  foodie: {
    name: 'Food Critic',
    patience: 240,
    tipMultiplier: 3.0,
    emoji: '🧐',
    color: '#9C27B0',
    starRequirement: 3,
    probability: 0.1,
    unlockLevel: 3,
  },
  rushCustomer: {
    name: 'In a Hurry',
    patience: 90,
    tipMultiplier: 2.0,
    emoji: '😰',
    color: '#FF9800',
    probability: 0.15,
  },
  kid: {
    name: 'Hungry Kid',
    patience: 120,
    tipMultiplier: 0.5,
    emoji: '😋',
    color: '#FF5722',
    forgiving: true,
    probability: 0.1,
  },
  vip: {
    name: 'VIP Guest',
    patience: 300,
    tipMultiplier: 5.0,
    emoji: '👑',
    color: '#FFD700',
    starRequirement: 3,
    probability: 0.05,
    unlockLevel: 5,
  },
};

// This file will continue in the next response due to length...
// I'll create this as a proper complete implementation

export default function CookingGameEnhanced() {
  return <div>Enhanced version loading...</div>;
}
