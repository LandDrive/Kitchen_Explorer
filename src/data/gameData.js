// ============================================================================
// GAME DATA - All constants for Kitchen Explorer
// ============================================================================

// Ingredient definitions
export const INGREDIENTS = {
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
  wagyu: { name: 'Wagyu', category: 'meat', states: ['raw', 'sliced', 'cooked'] },
  lamb: { name: 'Lamb', category: 'meat', states: ['raw', 'diced', 'cooked'] },
  bacon: { name: 'Bacon', category: 'meat', states: ['raw', 'cooked'] },
  // Vegetables
  onion: { name: 'Onion', category: 'vegetable', states: ['whole', 'diced', 'caramelized'] },
  garlic: { name: 'Garlic', category: 'vegetable', states: ['whole', 'minced', 'fried'] },
  ginger: { name: 'Ginger', category: 'vegetable', states: ['whole', 'peeled', 'minced'] },
  cucumber: { name: 'Cucumber', category: 'vegetable', states: ['whole', 'sliced'] },
  avocado: { name: 'Avocado', category: 'vegetable', states: ['whole', 'sliced'] },
  carrot: { name: 'Carrot', category: 'vegetable', states: ['whole', 'sliced', 'diced'] },
  bellPepper: { name: 'Bell Pepper', category: 'vegetable', states: ['whole', 'sliced', 'diced'] },
  broccoli: { name: 'Broccoli', category: 'vegetable', states: ['whole', 'chopped', 'cooked'] },
  cabbage: { name: 'Cabbage', category: 'vegetable', states: ['whole', 'shredded'] },
  mushroom: { name: 'Mushroom', category: 'vegetable', states: ['whole', 'sliced', 'cooked'] },
  greenOnion: { name: 'Green Onion', category: 'vegetable', states: ['whole', 'chopped'] },
  tomato: { name: 'Tomato', category: 'vegetable', states: ['whole', 'diced'] },
  spinach: { name: 'Spinach', category: 'vegetable', states: ['raw', 'cooked'] },
  bokChoy: { name: 'Bok Choy', category: 'vegetable', states: ['whole', 'chopped', 'cooked'] },
  // Starches
  rice: { name: 'Rice', category: 'starch', states: ['dry', 'washed', 'cooked', 'seasoned'] },
  noodles: { name: 'Noodles', category: 'starch', states: ['dry', 'cooked'] },
  flour: { name: 'Flour', category: 'starch', states: ['dry'] },
  potato: { name: 'Potato', category: 'starch', states: ['whole', 'diced', 'cooked'] },
  sweetPotato: { name: 'Sweet Potato', category: 'starch', states: ['whole', 'sliced', 'cooked'] },
  // Dairy & Eggs
  egg: { name: 'Egg', category: 'dairy', states: ['raw', 'beaten', 'cooked', 'boiled'] },
  butter: { name: 'Butter', category: 'dairy', states: ['solid', 'melted'] },
  cheese: { name: 'Cheese', category: 'dairy', states: ['block', 'shredded'] },
  cream: { name: 'Cream', category: 'dairy', states: ['liquid'] },
  coconutMilk: { name: 'Coconut Milk', category: 'dairy', states: ['liquid'] },
  // Sauces & Liquids
  soySauce: { name: 'Soy Sauce', category: 'sauce', states: ['liquid'] },
  vinegar: { name: 'Rice Vinegar', category: 'sauce', states: ['liquid'] },
  fishSauce: { name: 'Fish Sauce', category: 'sauce', states: ['liquid'] },
  oysterSauce: { name: 'Oyster Sauce', category: 'sauce', states: ['liquid'] },
  sesameOil: { name: 'Sesame Oil', category: 'sauce', states: ['liquid'] },
  mirin: { name: 'Mirin', category: 'sauce', states: ['liquid'] },
  sake: { name: 'Sake', category: 'sauce', states: ['liquid'] },
  chiliOil: { name: 'Chili Oil', category: 'sauce', states: ['liquid'] },
  hoiSin: { name: 'Hoisin Sauce', category: 'sauce', states: ['liquid'] },
  // Spices
  salt: { name: 'Salt', category: 'spice', states: ['dry'] },
  pepper: { name: 'Black Pepper', category: 'spice', states: ['dry'] },
  chiliFlakes: { name: 'Chili Flakes', category: 'spice', states: ['dry'] },
  paprika: { name: 'Paprika', category: 'spice', states: ['dry'] },
  cumin: { name: 'Cumin', category: 'spice', states: ['dry'] },
  turmeric: { name: 'Turmeric', category: 'spice', states: ['dry'] },
  curryPowder: { name: 'Curry Powder', category: 'spice', states: ['dry'] },
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

export const INGREDIENT_CATEGORIES = {
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

// Recipe definitions
export const RECIPES = {
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
    xpReward: 25,
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
    xpReward: 30,
  },
};

// ============================================================================
// PROGRESSION SYSTEM DATA
// ============================================================================

export const CHEF_LEVELS = [
  { level: 1, title: 'Kitchen Helper', xpRequired: 0, unlocksMessage: 'Welcome to your kitchen!' },
  { level: 2, title: 'Junior Chef', xpRequired: 100, unlocksMessage: 'New ingredients unlocked!' },
  {
    level: 3,
    title: 'Line Cook',
    xpRequired: 300,
    unlocksMessage: 'Advanced ingredients unlocked!',
  },
  {
    level: 4,
    title: 'Sous Chef',
    xpRequired: 600,
    unlocksMessage: 'Premium ingredients unlocked!',
  },
  { level: 5, title: 'Head Chef', xpRequired: 1000, unlocksMessage: 'Rare ingredients unlocked!' },
  {
    level: 6,
    title: 'Master Chef',
    xpRequired: 1500,
    unlocksMessage: 'You are a culinary master!',
  },
];

// Starter ingredients available at level 1
export const STARTER_INGREDIENTS = [
  'salmon',
  'tuna',
  'shrimp',
  'chicken',
  'porkBelly',
  'groundBeef',
  'egg',
  'tofu',
  'onion',
  'garlic',
  'carrot',
  'tomato',
  'cucumber',
  'ginger',
  'avocado',
  'rice',
  'noodles',
  'flour',
  'soySauce',
  'vinegar',
  'salt',
  'pepper',
  'nori',
];

// Ingredient unlock levels
export const INGREDIENT_UNLOCKS = {
  2: ['mahi', 'bellPepper', 'butter', 'bacon', 'cheese'],
  3: ['wagyu', 'scallops', 'tempeh', 'broccoli', 'mushroom', 'oysterSauce', 'sesameOil'],
  4: ['crab', 'lamb', 'bokChoy', 'chiliOil', 'paprika', 'cumin'],
  5: ['tilapia', 'cod', 'chickenWing', 'chickenThigh', 'turmeric', 'curryPowder'],
};

// ============================================================================
// CUSTOMER ORDER SYSTEM DATA
// ============================================================================

export const CUSTOMER_TYPES = {
  regular: {
    name: 'Regular Customer',
    patience: 180, // 3 minutes
    tipMultiplier: 1.0,
    emoji: '😊',
    color: '#4CAF50',
    probability: 0.6,
    orders: ['any'],
  },
  foodie: {
    name: 'Food Critic',
    patience: 240, // 4 minutes
    tipMultiplier: 3.0,
    emoji: '🧐',
    color: '#9C27B0',
    probability: 0.1,
    unlockLevel: 3,
    preferredDishes: ['chickenAdobo', 'gingerChicken'],
  },
  rushCustomer: {
    name: 'In a Hurry',
    patience: 90, // 1.5 minutes
    tipMultiplier: 2.0,
    emoji: '😰',
    color: '#FF9800',
    probability: 0.15,
    orders: ['any'],
  },
  kid: {
    name: 'Hungry Kid',
    patience: 120, // 2 minutes
    tipMultiplier: 0.5,
    emoji: '😋',
    color: '#FF5722',
    forgiving: true,
    probability: 0.1,
    preferredDishes: ['friedRice', 'shrimpTempura'],
  },
  vip: {
    name: 'VIP Guest',
    patience: 300, // 5 minutes
    tipMultiplier: 5.0,
    emoji: '👑',
    color: '#FFD700',
    probability: 0.05,
    unlockLevel: 5,
    orders: ['any'],
  },
};

// ============================================================================
// DISASTER SYSTEM DATA
// ============================================================================

export const DISASTER_TYPES = {
  fire: {
    name: 'Pan Fire',
    emoji: '🔥',
    responseTime: 10, // seconds
    actionButton: 'Use Fire Extinguisher',
    warningMessage: 'The pan is getting too hot!',
    failureMessage: 'The food burned!',
    successMessage: 'Fire extinguished!',
    triggerCondition: 'panTimer > 30', // 30 seconds on high heat
    xpReward: 15,
  },
  overflow: {
    name: 'Pot Overflow',
    emoji: '💦',
    responseTime: 8,
    actionButton: 'Turn Off Heat',
    warningMessage: 'The pot is boiling over!',
    failureMessage: 'Water spilled everywhere!',
    successMessage: 'Crisis averted!',
    triggerCondition: 'potBoiling > 45',
    xpReward: 10,
  },
  burning: {
    name: 'Food Burning',
    emoji: '🍳',
    responseTime: 6,
    actionButton: 'Remove from Heat',
    warningMessage: 'Something smells burned!',
    failureMessage: 'The food is ruined!',
    successMessage: 'Saved just in time!',
    triggerCondition: 'overcooking',
    xpReward: 10,
  },
};
