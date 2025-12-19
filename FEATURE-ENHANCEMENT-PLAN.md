# Kitchen Explorer - Feature Enhancement Plan

## Overview

This document outlines the implementation plan for three major features that will transform Kitchen Explorer from a simple drag-and-drop game into an engaging, skill-based cooking adventure.

**Target Features**:

1. Progressive Skill System with Unlockables
2. Customer Order System with Time Pressure
3. Kitchen Disasters & Cleanup Mini-Games

**Design Philosophy**: Keep it fun and forgiving for an 11-year-old while adding depth, challenge, and replayability.

---

## 🌟 Feature 1: Progressive Skill System with Unlockables

### What It Brings to the Game

- **Long-term engagement**: Players return to unlock new content
- **Sense of achievement**: Tangible rewards for skill improvement
- **Learning curve**: Gradual complexity increase keeps frustration low
- **Discovery moments**: "I unlocked truffle!" creates excitement
- **Replay value**: Try different paths, collect all achievements

### Core Mechanics

#### A. Chef Level Progression

```javascript
const CHEF_LEVELS = {
  1: { title: 'Kitchen Helper', xpRequired: 0, unlocksMessage: 'Welcome to your kitchen!' },
  2: { title: 'Junior Chef', xpRequired: 100, unlocksMessage: 'You can now use the pan!' },
  3: { title: 'Line Cook', xpRequired: 300, unlocksMessage: 'Exotic ingredients unlocked!' },
  4: { title: 'Sous Chef', xpRequired: 600, unlocksMessage: 'Advanced techniques available!' },
  5: { title: 'Head Chef', xpRequired: 1000, unlocksMessage: 'Premium ingredients unlocked!' },
  6: { title: 'Master Chef', xpRequired: 1500, unlocksMessage: 'You are a culinary master!' },
};
```

**XP Sources**:

- Complete a recipe: +20 XP
- Complete with ⭐⭐⭐ rating: +10 bonus XP
- Discover new recipe combo: +50 XP
- Serve a customer on time: +15 XP
- No disasters for 5 minutes: +25 XP
- Daily login streak: +10 XP/day

**Visual Feedback**:

- XP bar at top of screen (fills with satisfying animation)
- Level-up particle explosion with sound effect
- Badge display: "Level 3 - Line Cook 🔪"
- Toast notification: "New ingredient unlocked: Wagyu Beef!"

#### B. Ingredient Unlock System

**Starting Ingredients (Level 1)** - 15 basics:

```javascript
const STARTER_INGREDIENTS = [
  // Proteins
  'chicken',
  'egg',
  'tofu',
  // Vegetables
  'onion',
  'garlic',
  'carrot',
  'tomato',
  'cucumber',
  // Starches
  'rice',
  'noodles',
  // Sauces
  'soySauce',
  'salt',
  'pepper',
  // Wrappers
  'nori',
];
```

**Unlock Tiers**:

- **Level 2**: Basic seafood (salmon, shrimp), bell peppers, butter
- **Level 3**: Premium fish (tuna, mahi), ginger, mushrooms, sesame oil
- **Level 4**: Specialty meats (pork belly, bacon), exotic vegetables (bok choy), spices
- **Level 5**: Luxury items (wagyu, scallops, crab), premium sauces (truffle oil)
- **Level 6**: Ultra-rare (lobster, caviar, gold flakes - for fun!)

**Implementation**:

```javascript
// Add to state
const [playerLevel, setPlayerLevel] = useState(1);
const [playerXP, setPlayerXP] = useState(0);
const [unlockedIngredients, setUnlockedIngredients] = useState(STARTER_INGREDIENTS);

// Filter pantry display
const availableIngredients = Object.keys(INGREDIENTS).filter((id) =>
  unlockedIngredients.includes(id)
);

// XP gain function
const gainXP = (amount, reason) => {
  const newXP = playerXP + amount;
  setPlayerXP(newXP);

  // Check for level up
  const currentLevelData = CHEF_LEVELS[playerLevel];
  const nextLevelData = CHEF_LEVELS[playerLevel + 1];

  if (nextLevelData && newXP >= nextLevelData.xpRequired) {
    setPlayerLevel(playerLevel + 1);
    unlockNewContent(playerLevel + 1);
    showLevelUpAnimation();
  }

  // Show XP gain notification
  showNotification(`+${amount} XP - ${reason}`, 'success');
};
```

#### C. Station Unlock System

**Progression**:

- **Level 1**: Cutting Board, Sink (washing basics)
- **Level 2**: Pot (boiling), Pan (frying) - "Now you can cook!"
- **Level 3**: Mixing Bowl (combining), Grill (outdoor cooking)
- **Level 4**: Steamer (dim sum!), Deep Fryer (tempura)
- **Level 5**: Wok (stir-fry mastery), Oven (baking)
- **Level 6**: Specialty stations (Sushi bar, Molecular gastronomy)

**Visual Design**:

- Locked stations show with padlock icon and "Unlock at Level X"
- Hover shows preview: "🔒 Pan - Fry, sauté, and sear! (Level 2)"
- Unlock animation: Padlock shatters, station glows, tools appear

#### D. Recipe Discovery System

**Types of Recipes**:

1. **Starter Recipes** (shown from beginning): Salmon Maki, Fried Rice
2. **Hidden Recipes** (discovered by experimentation): 25 additional dishes
3. **Secret Recipes** (unlocked by achievements): 5 rare dishes

**Discovery Mechanic**:

```javascript
// When player plates ingredients, check for recipe match
const checkRecipeDiscovery = (ingredientsOnPlate) => {
  Object.entries(RECIPES).forEach(([recipeId, recipe]) => {
    // Already discovered?
    if (discoveredRecipes.includes(recipeId)) return;

    // Check if ingredients match (with 80% accuracy tolerance)
    const matches = checkIngredientMatch(ingredientsOnPlate, recipe.required);

    if (matches > 0.8) {
      // DISCOVERY!
      setDiscoveredRecipes([...discoveredRecipes, recipeId]);
      showDiscoveryAnimation(recipe);
      gainXP(50, 'Recipe Discovery!');
      playSound('discovery_fanfare.mp3');
    }
  });
};
```

**Recipe Book UI**:

- Beautiful illustrated cookbook (opens with book animation)
- Discovered recipes show with full details, ingredients, story
- Undiscovered show as "???" with hint: "Uses salmon and rice..."
- Star rating for each recipe (track best performance)

#### E. Achievement System

**Categories**:

**Speed Demon** 🏃

- "Quick Cook": Make any dish in under 1 minute
- "Lightning Chef": Make 5 dishes in 3 minutes
- "Speed Master": Serve 10 customers without missing deadline

**Perfectionist** ⭐

- "First Star": Get ⭐⭐⭐ rating on any dish
- "Triple Threat": Get ⭐⭐⭐ on 3 different recipes
- "Flawless": Get ⭐⭐⭐ rating 10 times in a row

**Explorer** 🗺️

- "Taste Tester": Try making 5 different recipes
- "Culinary Journey": Discover all 30 recipes
- "Master of Cuisines": Make at least one dish from each cuisine (Japanese, Filipino, Chinese, Korean)

**Ingredient Master** 🥕

- "Gatherer": Use 20 different ingredients
- "Collector": Unlock all ingredients
- "Variety Show": Use all 50 ingredients in one session

**Survivor** 💪

- "Clean Kitchen": No disasters for 10 minutes
- "Crisis Manager": Recover from 5 disasters in one game
- "Safety First": Pass food inspector with perfect score

**Unlockables from Achievements**:

- Complete "Culinary Journey" → Unlock "Mystery Spice" ingredient
- Complete "Flawless" → Unlock "Golden Spatula" cosmetic tool
- Complete all achievements → Unlock "Master Chef Hat" avatar customization

### Data Structure

```javascript
// Player profile state
const [playerProfile, setPlayerProfile] = useState({
  level: 1,
  xp: 0,
  totalXP: 0,
  unlockedIngredients: STARTER_INGREDIENTS,
  unlockedStations: ['cuttingBoard', 'sink'],
  discoveredRecipes: ['salmonMaki', 'friedRice'],
  achievements: [],
  stats: {
    recipesCompleted: 0,
    perfectRatings: 0,
    customersServed: 0,
    disastersHandled: 0,
    totalPlayTime: 0,
  },
});

// Save to localStorage
useEffect(() => {
  localStorage.setItem('kitchenExplorerProfile', JSON.stringify(playerProfile));
}, [playerProfile]);
```

### Integration Points

- **With Customer System**: XP awarded for serving customers
- **With Disasters**: XP awarded for disaster-free streaks
- **With Graphics**: Show locked/unlocked states with visual feedback
- **With Tutorial**: Progressive disclosure - teach new features as they unlock

---

## 👥 Feature 2: Customer Order System with Time Pressure

### What It Brings to the Game

- **Clear objectives**: "Make this specific dish"
- **Urgency and excitement**: Racing against the clock
- **Emotional engagement**: "The customer is leaving!"
- **Strategy**: Which order to do first?
- **Consequences**: Star ratings affect reputation

### Core Mechanics

#### A. Customer Types & Behaviors

```javascript
const CUSTOMER_TYPES = {
  regular: {
    name: 'Regular Customer',
    patience: 180, // 3 minutes
    tipMultiplier: 1.0,
    emoji: '😊',
    color: '#4CAF50',
    orderPool: 'all_discovered_recipes',
    probability: 0.6, // 60% of customers
  },

  foodie: {
    name: 'Food Critic',
    patience: 240, // 4 minutes (patient but picky)
    tipMultiplier: 3.0,
    emoji: '🧐',
    color: '#9C27B0',
    orderPool: 'complex_recipes_only',
    starRequirement: 3, // Must be perfect
    probability: 0.1,
    unlockCondition: 'playerLevel >= 3',
    rewardOnSuccess: { xp: 100, possibleRecipeUnlock: true },
  },

  rushCustomer: {
    name: 'In a Hurry',
    patience: 90, // 1.5 minutes
    tipMultiplier: 2.0,
    emoji: '😰',
    color: '#FF9800',
    orderPool: 'simple_recipes',
    probability: 0.15,
  },

  kid: {
    name: 'Hungry Kid',
    patience: 120, // 2 minutes
    tipMultiplier: 0.5,
    emoji: '😋',
    color: '#FF5722',
    orderPool: 'kid_friendly_recipes', // Simple: fried rice, chicken
    forgiving: true, // Accepts ⭐⭐ rating
    probability: 0.1,
  },

  vip: {
    name: 'VIP Guest',
    patience: 300, // 5 minutes
    tipMultiplier: 5.0,
    emoji: '👑',
    color: '#FFD700',
    orderPool: 'luxury_recipes',
    starRequirement: 3,
    probability: 0.05,
    unlockCondition: 'playerLevel >= 5',
    rewardOnSuccess: { xp: 200, achievement: 'VIP Service' },
  },
};
```

#### B. Order Ticket System

**Visual Design**:

```
┌─────────────────────┐
│  TICKET #42         │
│  👑 VIP Guest       │
├─────────────────────┤
│  🍣 Salmon Maki     │
│                     │
│  ⏱️ 4:32 remaining  │
│  ████████░░░░░░░    │ (patience bar)
│                     │
│  Tip: $25.00        │
│  ⭐⭐⭐ required     │
└─────────────────────┘
```

**Implementation**:

```javascript
const [activeOrders, setActiveOrders] = useState([]);
const [nextOrderId, setNextOrderId] = useState(1);

const createOrder = () => {
  // Select customer type based on probability
  const customerType = selectCustomerType();

  // Select recipe from their pool
  const recipe = selectRecipeFromPool(customerType.orderPool);

  const order = {
    id: nextOrderId,
    customerType: customerType,
    recipe: recipe,
    patienceRemaining: customerType.patience,
    maxPatience: customerType.patience,
    status: 'waiting', // waiting, in_progress, served, abandoned
    createdAt: Date.now(),
    tip: calculateBaseTip(recipe, customerType),
  };

  setActiveOrders([...activeOrders, order]);
  setNextOrderId(nextOrderId + 1);

  // Show notification
  showNotification(`New order: ${recipe.name} from ${customerType.emoji}`, 'info');
  playSound('order_bell.mp3');
};

// Patience countdown (every second)
useEffect(() => {
  const interval = setInterval(() => {
    setActiveOrders((orders) =>
      orders
        .map((order) => {
          if (order.status !== 'waiting') return order;

          const newPatience = order.patienceRemaining - 1;

          // Customer leaves!
          if (newPatience <= 0) {
            handleCustomerLeave(order);
            return { ...order, status: 'abandoned' };
          }

          // Warning at 30 seconds
          if (newPatience === 30) {
            showNotification(`⚠️ Order #${order.id} - Customer getting impatient!`, 'warning');
            playSound('clock_ticking.mp3');
          }

          return { ...order, patienceRemaining: newPatience };
        })
        .filter((order) => order.status !== 'abandoned')
    );
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

#### C. Order Fulfillment & Rating

```javascript
const serveOrderToCustomer = (orderId, preparedDish) => {
  const order = activeOrders.find((o) => o.id === orderId);
  if (!order) return;

  // Check if it's the correct recipe
  if (preparedDish.recipeId !== order.recipe.id) {
    handleWrongOrder(order);
    return;
  }

  // Calculate rating based on quality and timing
  const rating = calculateDishRating(preparedDish, order);

  // Calculate tip
  const patienceBonus = order.patienceRemaining / order.maxPatience;
  const tip = Math.floor(
    order.tip * rating.stars * patienceBonus * order.customerType.tipMultiplier
  );

  // Customer reaction
  const reaction = getCustomerReaction(rating.stars, order.customerType);

  // Show result
  showOrderCompleteModal({
    customerType: order.customerType,
    recipeName: order.recipe.name,
    rating: rating,
    tip: tip,
    reaction: reaction,
    xpGained: 15 + rating.stars * 5,
  });

  // Update state
  gainXP(15 + rating.stars * 5, `Served ${order.recipe.name}`);
  addCoins(tip);
  updateStats('customersServed', 1);

  if (rating.stars === 3) {
    updateStats('perfectRatings', 1);
  }

  // Remove order
  setActiveOrders((orders) => orders.filter((o) => o.id !== orderId));

  // Check for achievements
  checkAchievements();
};

const getCustomerReaction = (stars, customerType) => {
  if (stars === 3) {
    return {
      emoji: customerType.emoji === '🧐' ? '😍' : '🤩',
      text: [
        'Absolutely delicious!',
        'Perfect! Just perfect!',
        'This is amazing!',
        'You are a master chef!',
      ][Math.floor(Math.random() * 4)],
    };
  } else if (stars === 2) {
    return {
      emoji: '😐',
      text: ["It's okay...", 'Not bad.', 'Could be better.', 'Thanks, I guess.'][
        Math.floor(Math.random() * 4)
      ],
    };
  } else {
    return {
      emoji: '😞',
      text: [
        'This is not what I expected.',
        'Are you sure this is right?',
        'I guess it will do...',
        '*sighs* Thanks...',
      ][Math.floor(Math.random() * 4)],
    };
  }
};
```

#### D. Order Flow Management

**Game Modes**:

**Free Play Mode** (default)

- No orders
- Experiment and discover recipes
- Practice techniques
- Unlock ingredients

**Restaurant Mode** (unlocked at Level 2)

- Customers arrive every 30-90 seconds (random)
- Maximum 5 orders at once
- Goal: Serve as many as possible, maintain high rating
- Ends when: Player quits or 3 customers leave unhappy

**Rush Hour Challenge** (unlocked at Level 4)

- Orders arrive every 15 seconds
- 10 orders must be completed in 10 minutes
- Failure: 3+ customers leave
- Reward: 500 XP + achievement

#### E. Restaurant Reputation System

```javascript
const [reputation, setReputation] = useState({
  stars: 5.0, // Out of 5
  totalReviews: 0,
  todayCustomers: 0,
  weeklyRevenue: 0,
});

// Update after each order
const updateReputation = (orderRating, customerLeft) => {
  const reviews = reputation.totalReviews;
  const currentRating = reputation.stars;

  if (customerLeft) {
    // Customer left = 1 star automatic review
    const newRating = (currentRating * reviews + 1) / (reviews + 1);
    setReputation({
      ...reputation,
      stars: newRating,
      totalReviews: reviews + 1,
    });
  } else {
    // Weighted average
    const newRating = (currentRating * reviews + orderRating) / (reviews + 1);
    setReputation({
      ...reputation,
      stars: newRating,
      totalReviews: reviews + 1,
    });
  }
};

// Display in UI
<div className="reputation-badge">
  <div className="stars">{reputation.stars.toFixed(1)} ⭐</div>
  <div className="review-count">{reputation.totalReviews} reviews</div>
</div>;
```

**Reputation Effects**:

- **5.0 stars**: Legendary restaurant! VIP customers more frequent (+20%)
- **4.5-4.9 stars**: Excellent! Food critics visit (+10%)
- **4.0-4.4 stars**: Good restaurant, normal traffic
- **3.5-3.9 stars**: Needs improvement, fewer customers (-20%)
- **Below 3.5**: Poor reputation, must improve or restaurant closes!

### Integration Points

- **With Skill System**: Orders unlock as recipes are discovered
- **With Disasters**: Failed orders from burned food, customer complaints
- **With Graphics**: Show customer avatars, emotions, order tickets
- **With Sound**: Order bell, customer reactions, clock ticking

---

## 💥 Feature 3: Kitchen Disasters & Cleanup Mini-Games

### What It Brings to the Game

- **Realistic consequences**: Mistakes matter
- **Humor and chaos**: "Oh no, grease fire!"
- **Recovery skills**: Learn to handle pressure
- **Mini-game variety**: Different from cooking gameplay
- **Educational value**: Real food safety concepts

### Core Mechanics

#### A. Disaster Types & Triggers

**1. Grease Fire** 🔥

```javascript
const DISASTER_GREASE_FIRE = {
  name: 'Grease Fire',
  trigger: {
    condition: 'panHeat === "high" && panTimer > 120', // High heat for 2+ min
    probability: 0.3, // 30% chance when condition met
  },

  effects: {
    damagesFood: true, // Burns current pan contents
    spreadsIfIgnored: true, // Can spread to other stations
    soundEffect: 'fire_alarm.mp3',
    visualEffect: 'flame_animation',
  },

  miniGame: {
    type: 'fire_extinguisher',
    instructions: 'Aim extinguisher at base of fire!',
    controls: 'Mouse to aim, Click to spray',
    timeLimit: 15, // 15 seconds to extinguish
    failConsequence: 'Kitchen closes for 30 seconds (repairs)',
    passReward: 'XP +10, Achievement progress',
  },
};
```

**Mini-Game Implementation**:

```javascript
const FireExtinguisherGame = ({ onSuccess, onFailure }) => {
  const [aimAngle, setAimAngle] = useState(0);
  const [spraying, setSpraying] = useState(false);
  const [fireIntensity, setFireIntensity] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(15);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const angle = Math.atan2(y - 300, x - 250) * (180 / Math.PI);
    setAimAngle(angle);
  };

  const handleSpray = () => {
    setSpraying(true);

    // Check if aiming at fire base (correct angle)
    const targetAngle = -90; // Straight up
    const aimAccuracy = Math.abs(aimAngle - targetAngle);

    if (aimAccuracy < 15) {
      // Good aim! Reduce fire
      setFireIntensity((intensity) => Math.max(0, intensity - 5));
    } else {
      // Poor aim, fire spreads slightly
      setFireIntensity((intensity) => Math.min(100, intensity + 1));
    }

    setTimeout(() => setSpraying(false), 100);
  };

  useEffect(() => {
    if (fireIntensity <= 0) {
      onSuccess();
    }
  }, [fireIntensity]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          onFailure();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mini-game-overlay" onMouseMove={handleMouseMove} onClick={handleSpray}>
      <div className="timer">⏱️ {timeRemaining}s</div>
      <div className="instructions">Aim at base of fire and click!</div>

      {/* Fire animation */}
      <div className="fire" style={{ transform: `scale(${fireIntensity / 100})` }}>
        🔥
      </div>

      {/* Extinguisher */}
      <div className="extinguisher" style={{ transform: `rotate(${aimAngle}deg)` }}>
        🧯
        {spraying && (
          <div className="spray-effect" style={{ transform: `rotate(${aimAngle}deg)` }} />
        )}
      </div>

      <div className="fire-meter">
        Fire: {fireIntensity}%
        <div className="meter-bar" style={{ width: `${fireIntensity}%` }} />
      </div>
    </div>
  );
};
```

**2. Boil Over** 💧

```javascript
const DISASTER_BOIL_OVER = {
  name: 'Boil Over',
  trigger: {
    condition: 'potContents.includes("liquid") && potHeat === "high" && !watchingPot',
    probability: 0.4,
  },

  effects: {
    createsMess: true, // Water on floor and counter
    slipperyFloor: true, // Reduces movement speed 50%
    damagesFood: false, // Food is ok, just messy
    soundEffect: 'water_splash.mp3',
  },

  miniGame: {
    type: 'cleanup_spill',
    instructions: 'Wipe up the spill with your towel!',
    controls: 'Click and drag to wipe',
    timeLimit: 20,
    failConsequence: 'Slip hazard remains, 50% slower movement',
    passReward: 'Clean kitchen achievement progress',
  },
};
```

**Cleanup Mini-Game**:

```javascript
const CleanupSpillGame = ({ onSuccess }) => {
  const [cleanedAreas, setCleanedAreas] = useState([]);
  const totalAreas = 20; // 20 spots to clean

  const handleWipe = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check which area was wiped
    const areaIndex = Math.floor(x / 50) + Math.floor(y / 50) * 10;

    if (!cleanedAreas.includes(areaIndex)) {
      setCleanedAreas([...cleanedAreas, areaIndex]);
      playSound('wipe.mp3');
    }
  };

  useEffect(() => {
    if (cleanedAreas.length >= totalAreas) {
      onSuccess();
    }
  }, [cleanedAreas]);

  return (
    <div className="cleanup-game" onMouseMove={handleWipe}>
      <div className="spill-grid">
        {[...Array(totalAreas)].map((_, i) => (
          <div key={i} className={`spill-area ${cleanedAreas.includes(i) ? 'clean' : 'dirty'}`} />
        ))}
      </div>
      <div className="progress">
        Cleaned: {cleanedAreas.length}/{totalAreas}
      </div>
    </div>
  );
};
```

**3. Cross-Contamination** 🦠

```javascript
const DISASTER_CONTAMINATION = {
  name: 'Cross-Contamination',
  trigger: {
    condition:
      'cuttingBoardHistory.includes("rawMeat") && cuttingBoardItems.some(i => i.category === "vegetable")',
    probability: 1.0, // Always happens!
  },

  effects: {
    damagesFood: true, // Must throw away contaminated vegetables
    reducesRating: 2, // Drops from ⭐⭐⭐ to ⭐
    customerSick: 0.5, // 50% chance customer gets sick (auto 1 star)
    soundEffect: 'warning_buzz.mp3',
    visualEffect: 'green_contamination_particles',
  },

  prevention: {
    action: 'Wash cutting board between raw meat and vegetables',
    tutorial: 'Shows after first occurrence',
  },

  noMiniGame: true, // Instant effect, no recovery
  educationalMessage: '⚠️ Always wash cutting boards after raw meat! Food safety is important.',
};
```

**4. Ingredient Spoilage** 🪰

```javascript
const DISASTER_SPOILAGE = {
  name: 'Spoiled Ingredients',
  trigger: {
    condition: 'ingredient.category === "seafood" && ingredient.timeOnCounter > 300', // 5 min
    probability: 1.0,
  },

  effects: {
    ingredientUnusable: true,
    attractsFlies: true, // Visual flies buzzing
    smellEffect: true, // Screen tint + wavy lines
    soundEffect: 'flies_buzzing.mp3',
  },

  cleanup: {
    action: 'Drag to trash can',
    consequence: 'Lose ingredient, must get fresh one',
  },

  educationalMessage: '🐟 Seafood spoils quickly! Keep it cold or cook it fresh.',
};
```

**5. Dirty Dishes Pile-Up** 🍽️

```javascript
const DISASTER_DISH_PILEUP = {
  name: 'Dish Mountain',
  trigger: {
    condition: 'dirtyDishesCount > 10',
    probability: 1.0,
  },

  effects: {
    blocksStation: 'sink', // Can't wash ingredients
    reducesWorkspace: true, // Fewer slots on counter
    attractsPests: true, // Roaches appear after 20 dishes
    soundEffect: 'dish_clatter.mp3',
  },

  miniGame: {
    type: 'dish_washing',
    instructions: 'Scrub dishes clean!',
    controls: 'Click and hold to scrub, release to rinse',
    timeLimit: 30,
    dishCount: 'dirtyDishesCount',
  },
};
```

**Dish Washing Mini-Game**:

```javascript
const DishWashingGame = ({ dishCount, onSuccess }) => {
  const [currentDish, setCurrentDish] = useState(0);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [phase, setPhase] = useState('scrub'); // scrub | rinse

  const handleScrub = () => {
    if (phase === 'scrub') {
      setScrubProgress((p) => {
        const newProgress = p + 2;
        if (newProgress >= 100) {
          setPhase('rinse');
          playSound('water_run.mp3');
          return 100;
        }
        return newProgress;
      });
    }
  };

  const handleRinse = () => {
    if (phase === 'rinse') {
      // Dish complete!
      playSound('dish_clean.mp3');

      if (currentDish + 1 >= dishCount) {
        onSuccess();
      } else {
        setCurrentDish(currentDish + 1);
        setScrubProgress(0);
        setPhase('scrub');
      }
    }
  };

  return (
    <div className="dish-washing-game">
      <div className="progress-header">
        Dish {currentDish + 1}/{dishCount}
      </div>

      <div className="dish-visual">
        {phase === 'scrub' ? (
          <div className="dirty-dish" onMouseDown={handleScrub} onMouseMove={handleScrub}>
            🍽️
            <div className="grime" style={{ opacity: 1 - scrubProgress / 100 }} />
          </div>
        ) : (
          <div className="dish-rinse" onClick={handleRinse}>
            💧 Click to rinse!
          </div>
        )}
      </div>

      <div className="scrub-meter">
        {phase === 'scrub' ? `Scrubbing: ${scrubProgress}%` : 'Click to rinse!'}
        <div className="meter-bar" style={{ width: `${scrubProgress}%` }} />
      </div>
    </div>
  );
};
```

#### B. Food Safety Inspector

**Random Inspection Events**:

```javascript
const INSPECTOR_SYSTEM = {
  frequency: 'Every 10-15 customer orders',

  checks: [
    { name: 'Clean counters', pass: 'noActiveSpills', weight: 20 },
    { name: 'Washed cutting board', pass: 'cuttingBoardClean', weight: 25 },
    { name: 'Proper food storage', pass: 'noSpoiledIngredients', weight: 20 },
    { name: 'Clean dishes', pass: 'dirtyDishesCount < 5', weight: 15 },
    { name: 'No cross-contamination', pass: 'noContaminationEvents', weight: 20 },
  ],

  grading: {
    A: { score: 90 - 100, effect: 'Reputation +0.2, Achievement progress' },
    B: { score: 75 - 89, effect: 'Reputation +0.1' },
    C: { score: 60 - 74, effect: 'Warning issued' },
    F: { score: 0 - 59, effect: 'Restaurant closed 5 minutes, Reputation -0.5' },
  },
};

const conductInspection = () => {
  pauseGame();

  const results = INSPECTOR_SYSTEM.checks.map((check) => {
    const passed = evaluateCheck(check.pass);
    return {
      name: check.name,
      passed: passed,
      points: passed ? check.weight : 0,
    };
  });

  const totalScore = results.reduce((sum, r) => sum + r.points, 0);
  const grade = getGrade(totalScore);

  showInspectionResults({
    grade: grade,
    score: totalScore,
    results: results,
    effect: INSPECTOR_SYSTEM.grading[grade].effect,
  });

  applyInspectionEffects(grade);
};
```

#### C. Disaster Prevention Mechanics

**Warning System**:

```javascript
const checkForPotentialDisasters = () => {
  const warnings = [];

  // Check pan temperature
  if (panHeat === 'high' && panTimer > 90) {
    warnings.push({
      type: 'fire_risk',
      message: '⚠️ Pan is very hot! Reduce heat or fire risk!',
      severity: 'high',
      preventAction: 'Click pan heat to reduce',
    });
  }

  // Check pot for boil over
  if (potContents.includes('water') && potHeat === 'high') {
    warnings.push({
      type: 'boilover_risk',
      message: '⚠️ Pot may boil over! Reduce heat or watch closely.',
      severity: 'medium',
    });
  }

  // Check cutting board cleanliness
  if (cuttingBoardHistory.includes('rawMeat') && cuttingBoardItems.length === 0) {
    warnings.push({
      type: 'contamination_risk',
      message: '💧 Cutting board needs washing before next use!',
      severity: 'high',
      preventAction: 'Drag to sink to wash',
    });
  }

  // Check ingredient freshness
  const staleIngredients = checkIngredientFreshness();
  if (staleIngredients.length > 0) {
    warnings.push({
      type: 'spoilage_risk',
      message: `⚠️ ${staleIngredients[0].name} is going bad! Use it soon.`,
      severity: 'low',
    });
  }

  // Display warnings
  setActiveWarnings(warnings);
};

// Run every 5 seconds
useEffect(() => {
  const interval = setInterval(checkForPotentialDisasters, 5000);
  return () => clearInterval(interval);
}, [panHeat, potContents, cuttingBoardHistory]);
```

**Visual Warning Indicators**:

```javascript
// Pan heat indicator
<div className="pan-station">
  {panHeat === 'high' && panTimer > 90 && (
    <div className="warning-pulse">
      ⚠️ TOO HOT!
    </div>
  )}
  <div className={`heat-indicator heat-${panHeat}`}>
    🔥 {panHeat.toUpperCase()}
  </div>
</div>

// Cutting board contamination warning
<div className="cutting-board">
  {needsWashing && (
    <div className="contamination-warning">
      💧 WASH ME!
    </div>
  )}
</div>
```

### Integration Points

- **With Skill System**: Disasters less likely at higher levels (better skills)
- **With Customer System**: Disasters delay orders, upset customers
- **With Graphics**: Visual effects for fires, spills, contamination
- **With Sound**: Alarm sounds, sizzles, splashes, warning beeps

---

## 🎨 Graphics Improvement Plan

### Research Findings

Based on research of top cooking games in 2024:

**Style Inspiration**:

- [**Cooking Mama**](https://medium.com/@isabelwu2005/the-cute-aesthetics-of-labor-analyzing-cooking-mama-through-the-lens-of-gender-and-culture-2c0c61cc564f): Kawaii aesthetic, soft colors, approachable, emotionally warm
- [**Overcooked**](https://www.eneba.com/hub/games/best-cooking-games/): Cartoony, vibrant, colorful chaos that feels playful
- [**Good Pizza, Great Pizza**](https://gg.deals/blog/best-cooking-games/): Gentle art, cozy visuals, intuitive design
- [**Battle Chef Brigade**](https://www.thegamer.com/best-cooking-sim-games/): Lush art style, detailed illustrations

**Free SVG Resources**:

- [Icons8](https://icons8.com/icons/set/food-ingredients): 50+ UI design styles, PNG/SVG/GIF
- [SVG Repo](https://www.svgrepo.com/collection/food-icons/): Monocolor and multicolor icons
- [Iconscout](https://iconscout.com/icons/food): 745K+ food icons in various styles
- [Reshot](https://www.reshot.com/free-svg-icons/food/): 1061+ free food SVG icons

### Current Problems Identified

**Issues with Current Graphics**:

1. **Blob-like shapes**: Many ingredients look generic, not distinctive
2. **Unclear states**: Hard to tell raw vs cooked on some items
3. **Inconsistent style**: Some detailed, some simple
4. **Poor recognizability**: 11-year-old may not identify ingredients at a glance
5. **Lack of personality**: No "cuteness" or emotional appeal

### Recommended Graphics Style: "Kawaii Realism"

**Design Principles**:

- **Recognizable silhouettes**: Carrot looks like a carrot, even at small size
- **Gentle color palette**: Warm, inviting, not harsh
- **Subtle personality**: Slight smile curves, friendly rounded edges
- **Clear state indicators**: Obvious visual difference between raw/cooked/sliced
- **Consistent level of detail**: All ingredients have similar complexity
- **Age-appropriate**: Appeals to 11-year-olds (not too childish, not too serious)

### Specific Ingredient Redesigns

#### Before/After Examples:

**1. Carrot** 🥕

```javascript
// BEFORE (blob-like)
case 'carrot':
  return <ellipse cx="25" cy="25" rx="8" ry="20" fill="orange"/>;

// AFTER (kawaii realistic)
case 'carrot':
  if (state === 'whole') {
    return (
      <g>
        <defs>
          <linearGradient id="carrotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C42"/>
            <stop offset="50%" stopColor="#FF6B35"/>
            <stop offset="100%" stopColor="#E85D3B"/>
          </linearGradient>
        </defs>

        {/* Carrot body */}
        <path
          d="M25,10 L18,40 L25,45 L32,40 Z"
          fill="url(#carrotGrad)"
          stroke="#D64D2F"
          strokeWidth="0.5"
        />

        {/* Horizontal lines for texture */}
        {[15, 20, 25, 30, 35].map(y => (
          <line
            key={y}
            x1="20" y1={y} x2="30" y2={y}
            stroke="#D64D2F"
            strokeWidth="0.3"
            opacity="0.4"
          />
        ))}

        {/* Green leafy top */}
        <g transform="translate(25,8)">
          {[-3, 0, 3].map((x, i) => (
            <path
              key={i}
              d={`M${x},0 L${x-2},-8 L${x},-6 L${x+2},-8 Z`}
              fill="#4CAF50"
              stroke="#2E7D32"
              strokeWidth="0.3"
            />
          ))}
        </g>

        {/* Highlight shine */}
        <ellipse cx="22" cy="20" rx="2" ry="5" fill="white" opacity="0.3"/>
      </g>
    );
  }

  if (state === 'sliced') {
    return (
      <g>
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i} transform={`translate(${i * 9}, ${i * 8})`}>
            {/* Circular slice */}
            <circle cx="15" cy="15" r="6" fill="#FF6B35" stroke="#D64D2F" strokeWidth="0.4"/>

            {/* Core ring */}
            <circle cx="15" cy="15" r="2" fill="#FFB84D" opacity="0.6"/>

            {/* Radial texture lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
              const rad = angle * Math.PI / 180;
              const x2 = 15 + Math.cos(rad) * 5;
              const y2 = 15 + Math.sin(rad) * 5;
              return (
                <line
                  key={angle}
                  x1="15" y1="15"
                  x2={x2} y2={y2}
                  stroke="#D64D2F"
                  strokeWidth="0.2"
                  opacity="0.3"
                />
              );
            })}
          </g>
        ))}
      </g>
    );
  }
```

**2. Onion** 🧅

```javascript
case 'onion':
  if (state === 'whole') {
    return (
      <g>
        <defs>
          <radialGradient id="onionGrad">
            <stop offset="0%" stopColor="#FFF8E7"/>
            <stop offset="40%" stopColor="#F5E6D3"/>
            <stop offset="70%" stopColor="#E8D4B8"/>
            <stop offset="100%" stopColor="#D4B896"/>
          </radialGradient>
        </defs>

        {/* Main onion body */}
        <ellipse cx="25" cy="28" rx="14" ry="16" fill="url(#onionGrad)" stroke="#B89968" strokeWidth="0.6"/>

        {/* Onion layers (concentric curves) */}
        {[4, 8, 12].map(offset => (
          <ellipse
            key={offset}
            cx="25" cy="28"
            rx={14 - offset} ry={16 - offset}
            fill="none"
            stroke="#C9A876"
            strokeWidth="0.4"
            opacity="0.5"
          />
        ))}

        {/* Root bottom */}
        <circle cx="25" cy="42" r="2" fill="#8B7355"/>
        {[0, 120, 240].map(angle => {
          const rad = angle * Math.PI / 180;
          const x = 25 + Math.cos(rad) * 3;
          const y = 42 + Math.sin(rad) * 3;
          return (
            <line
              key={angle}
              x1="25" y1="42"
              x2={x} y2={y}
              stroke="#6B5945"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Papery skin on top */}
        <path
          d="M25,12 Q22,8 20,10 L23,15"
          fill="#E8D4B8"
          stroke="#B89968"
          strokeWidth="0.3"
          opacity="0.7"
        />

        {/* Shine highlight */}
        <ellipse cx="20" cy="22" rx="4" ry="6" fill="white" opacity="0.2"/>
      </g>
    );
  }

  if (state === 'diced') {
    return (
      <g>
        {/* 3x3 grid of onion pieces */}
        {[...Array(9)].map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = col * 12 + 8;
          const y = row * 12 + 8;
          const rotation = Math.random() * 30 - 15;

          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${rotation})`}>
              {/* Irregular square piece */}
              <path
                d="M0,0 L6,1 L7,7 L1,6 Z"
                fill="#FFF8E7"
                stroke="#D4B896"
                strokeWidth="0.4"
              />
              {/* Layer lines */}
              <path d="M1,1 L5,5" stroke="#E8D4B8" strokeWidth="0.3" opacity="0.5"/>
            </g>
          );
        })}
      </g>
    );
  }

  if (state === 'caramelized') {
    return (
      <g>
        {/* Pile of caramelized onions */}
        <ellipse cx="25" cy="30" rx="18" ry="8" fill="rgba(101,67,33,0.2)"/> {/* shadow */}

        {/* Multiple overlapping pieces */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const x = 25 + Math.cos(angle) * (6 + Math.random() * 4);
          const y = 26 + Math.sin(angle) * (4 + Math.random() * 3);

          return (
            <path
              key={i}
              d={`M${x},${y} Q${x+4},${y-2} ${x+6},${y+1} L${x+4},${y+4} Z`}
              fill={i % 2 === 0 ? '#8B6914' : '#A0791A'}
              stroke="#654321"
              strokeWidth="0.3"
              opacity="0.85"
            />
          );
        })}

        {/* Glossy caramel shine */}
        <ellipse cx="25" cy="24" rx="6" ry="3" fill="#DAA520" opacity="0.4"/>
      </g>
    );
  }
```

**3. Chicken** 🍗

```javascript
case 'chicken':
  if (state === 'raw') {
    return (
      <g>
        <defs>
          <linearGradient id="rawChickenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE5E5"/>
            <stop offset="40%" stopColor="#FFD4D4"/>
            <stop offset="100%" stopColor="#FFC4C4"/>
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.1)"/>

        {/* Chicken breast shape */}
        <path
          d="M25,10 Q35,12 38,22 Q40,32 35,38 Q28,42 25,42 Q22,42 15,38 Q10,32 12,22 Q15,12 25,10 Z"
          fill="url(#rawChickenGrad)"
          stroke="#FFB4B4"
          strokeWidth="0.8"
        />

        {/* Meat texture lines */}
        {[18, 24, 30].map(y => (
          <path
            key={y}
            d={`M15,${y} Q25,${y-2} 35,${y}`}
            stroke="#FFB4B4"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />
        ))}

        {/* Wet/raw sheen */}
        <ellipse cx="28" cy="20" rx="5" ry="3" fill="white" opacity="0.3"/>
        <ellipse cx="18" cy="28" rx="3" ry="2" fill="white" opacity="0.2"/>
      </g>
    );
  }

  if (state === 'cooked') {
    return (
      <g>
        <defs>
          <linearGradient id="cookedChickenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5E6D3"/>
            <stop offset="50%" stopColor="#E8D4B8"/>
            <stop offset="100%" stopColor="#D4B896"/>
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.15)"/>

        {/* Cooked chicken breast */}
        <path
          d="M25,10 Q35,12 38,22 Q40,32 35,38 Q28,42 25,42 Q22,42 15,38 Q10,32 12,22 Q15,12 25,10 Z"
          fill="url(#cookedChickenGrad)"
          stroke="#B89968"
          strokeWidth="0.8"
        />

        {/* Fibrous cooked texture */}
        {[16, 20, 24, 28, 32].map(y => (
          <path
            key={y}
            d={`M14,${y} L36,${y+1}`}
            stroke="#C9A876"
            strokeWidth="0.4"
            opacity="0.5"
          />
        ))}

        {/* Grill marks */}
        {[18, 28].map(x => (
          <line
            key={x}
            x1={x} y1="15"
            x2={x} y2="38"
            stroke="#8B6914"
            strokeWidth="2"
            opacity="0.3"
          />
        ))}

        {/* Juicy highlight */}
        <ellipse cx="25" cy="22" rx="4" ry="3" fill="#F5E6D3" opacity="0.5"/>
      </g>
    );
  }

  if (state === 'diced') {
    return (
      <g>
        {/* Grid of chicken cubes */}
        {[...Array(12)].map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const x = col * 10 + 6;
          const y = row * 12 + 8;
          const size = 6 + Math.random() * 2;

          return (
            <g key={i}>
              {/* Cube in isometric view */}
              <path
                d={`M${x},${y} L${x+size},${y-2} L${x+size},${y+size-2} L${x},${y+size} Z`}
                fill="#FFD4D4"
                stroke="#FFB4B4"
                strokeWidth="0.4"
              />
              <path
                d={`M${x+size},${y-2} L${x+size+2},${y} L${x+size+2},${y+size} L${x+size},${y+size-2} Z`}
                fill="#FFB4B4"
                stroke="#FFB4B4"
                strokeWidth="0.4"
              />
            </g>
          );
        })}
      </g>
    );
  }
```

### Implementation Strategy

**Phase 1: Ingredient Redesign** (Priority ingredients)

1. **Proteins**: Chicken, salmon, shrimp, egg
2. **Vegetables**: Onion, garlic, carrot, cucumber, avocado
3. **Starches**: Rice (all states), noodles

**Phase 2: State Variations**

- Ensure each state is visually distinct
- Add "kawaii" personality touches (slight smiles, friendly shapes)
- Consistent highlight/shadow treatment

**Phase 3: Animation & Effects**

- Ingredient "pop-in" when added to station
- Gentle bounce/wiggle on drag
- Sparkle effect on state transformation
- Steam rising from cooked foods

**Phase 4: UI Polish**

- Customer avatars (cute character faces)
- Station illustrations (not just rectangles)
- Background kitchen scene
- Animated flames, water, steam effects

### SVG Optimization Techniques

```javascript
// Create reusable gradient definitions
const CommonGradients = () => (
  <defs>
    {/* Meat gradients */}
    <linearGradient id="rawMeatGrad">
      <stop offset="0%" stopColor="#FFE5E5" />
      <stop offset="100%" stopColor="#FFC4C4" />
    </linearGradient>

    <linearGradient id="cookedMeatGrad">
      <stop offset="0%" stopColor="#F5E6D3" />
      <stop offset="100%" stopColor="#D4B896" />
    </linearGradient>

    {/* Vegetable gradients */}
    <linearGradient id="vegetableGrad">
      <stop offset="0%" stopColor="#90EE90" />
      <stop offset="100%" stopColor="#228B22" />
    </linearGradient>

    {/* Shine effect */}
    <radialGradient id="shine">
      <stop offset="0%" stopColor="white" stopOpacity="0.6" />
      <stop offset="100%" stopColor="white" stopOpacity="0" />
    </radialGradient>

    {/* Texture filters */}
    <filter id="organicTexture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" />
      <feDisplacementMap in="SourceGraphic" scale="2" />
    </filter>
  </defs>
);
```

---

## 📊 Integration Master Plan

### System Architecture

```javascript
// New state structure
const [gameState, setGameState] = useState({
  // Existing states
  cuttingBoardItems: [],
  potItems: [],
  panItems: [],
  // ... etc

  // NEW: Progression system
  player: {
    level: 1,
    xp: 0,
    unlockedIngredients: STARTER_INGREDIENTS,
    unlockedStations: ['cuttingBoard', 'sink'],
    discoveredRecipes: ['salmonMaki', 'friedRice'],
    achievements: [],
    stats: {
      /* ... */
    },
  },

  // NEW: Order system
  orders: {
    active: [],
    nextId: 1,
    restaurantMode: false,
    reputation: { stars: 5.0, reviews: 0 },
  },

  // NEW: Disaster system
  disasters: {
    active: [],
    warnings: [],
    cleanliness: {
      cuttingBoardClean: true,
      dirtyDishes: 0,
      activeSpills: [],
      spoiledIngredients: [],
    },
  },

  // NEW: UI state
  ui: {
    showLevelUp: false,
    showRecipeDiscovery: null,
    showOrderComplete: null,
    showMiniGame: null,
    showInspection: null,
  },
});
```

### Feature Interaction Matrix

| Feature             | Affects Progression | Affects Orders                    | Affects Disasters            |
| ------------------- | ------------------- | --------------------------------- | ---------------------------- |
| **Complete recipe** | +20 XP              | -                                 | Adds dirty dish              |
| **Serve customer**  | +15 XP              | Removes order, updates reputation | -                            |
| **Disaster occurs** | -                   | Delays current work               | Creates cleanup requirement  |
| **Level up**        | Unlocks content     | Unlocks new customer types        | Reduces disaster probability |
| **Discovery**       | +50 XP, achievement | Recipe available for orders       | -                            |
| **Perfect rating**  | +5 bonus XP         | Better reputation                 | -                            |

### Data Persistence

```javascript
// Save game state to localStorage
const saveGame = () => {
  const saveData = {
    player: gameState.player,
    orders: { reputation: gameState.orders.reputation },
    timestamp: Date.now(),
    version: '2.0.0',
  };

  localStorage.setItem('kitchenExplorer_save', JSON.stringify(saveData));
};

// Auto-save every 30 seconds
useEffect(() => {
  const interval = setInterval(saveGame, 30000);
  return () => clearInterval(interval);
}, [gameState]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('kitchenExplorer_save');
  if (saved) {
    const data = JSON.parse(saved);
    // Merge with default state
    setGameState((prev) => ({
      ...prev,
      player: data.player,
      orders: { ...prev.orders, reputation: data.orders.reputation },
    }));
  }
}, []);
```

### UI Layout Redesign

```
┌─────────────────────────────────────────────────────────────┐
│  Level 3 - Line Cook  ⭐⭐⭐⭐⭐ (5.0)  XP: ████░░ 420/600 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  ORDER #12   │  │  ORDER #13   │  │  ORDER #14   │     │
│  │  👑 VIP      │  │  😊 Regular  │  │  😰 Rush     │     │
│  │  🍣 Salmon   │  │  🍳 Fried    │  │  🍗 Ginger   │     │
│  │  ⏱️ 2:45     │  │  ⏱️ 1:20     │  │  ⏱️ 0:38     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌─ KITCHEN WORKSPACE ────────────────────────────────┐    │
│  │                                                     │    │
│  │  [Cutting Board]  [Mixing Bowl]  [Pot]  [Pan]     │    │
│  │                                                     │    │
│  │                                                     │    │
│  │  [Sink]  [Plate]                                   │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ PANTRY (Unlocked: 25/50) ────────────────────────┐    │
│  │  🐟 Seafood  🥩 Meat  🥬 Veggies  🍚 Starches      │    │
│  │                                                     │    │
│  │  [Salmon] [Chicken] [Onion] [Rice] [Egg] ...      │    │
│  │  🔒[Wagyu] 🔒[Lobster] (Unlock at Level 5)        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ⚠️ Warnings: Pan very hot! (2:15) | Cutting board dirty  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Development Roadmap

### Sprint 1: Progression System (Week 1-2)

- [ ] Implement XP and leveling system
- [ ] Create ingredient unlock logic
- [ ] Build station unlock system
- [ ] Design level-up animations
- [ ] Add achievement tracking

### Sprint 2: Graphics Overhaul (Week 3-4)

- [ ] Redesign top 20 priority ingredients (kawaii realistic style)
- [ ] Create state variation graphics
- [ ] Add animations (pop-in, bounce, sparkle)
- [ ] Design customer avatars
- [ ] Improve station visuals

### Sprint 3: Customer Orders (Week 5-6)

- [ ] Build order ticket system
- [ ] Implement customer types and AI
- [ ] Create patience countdown
- [ ] Add rating calculation
- [ ] Build reputation system

### Sprint 4: Disasters & Mini-Games (Week 7-8)

- [ ] Implement disaster triggers
- [ ] Create fire extinguisher mini-game
- [ ] Build cleanup mini-game
- [ ] Add dish washing mini-game
- [ ] Implement inspector system

### Sprint 5: Polish & Integration (Week 9-10)

- [ ] Connect all systems
- [ ] Balance difficulty and progression
- [ ] Add tutorial system
- [ ] Implement save/load
- [ ] Playtesting with target audience

---

## 🎯 Success Metrics

**Engagement**:

- Average session length: >15 minutes
- Return rate: >60% next-day return
- Achievement completion: >40% of players unlock 5+ achievements

**Learning**:

- Food safety knowledge: Post-game quiz >70% correct
- Recipe completion without hints: >50% by session 5

**Fun Factor**:

- User satisfaction: >4.5/5 stars
- Recommendation rate: >80% would recommend to friend

---

**Sources**:

- [Best Cozy Cooking Games on Steam 2024](https://cozygamereviews.com/best-cozy-cooking-games/)
- [Best Cooking Games on PC 2025](https://www.pcgamesn.com/best-cooking-games-restaurant-games-pc)
- [13 Best Cooking Games in 2025](https://www.eneba.com/hub/games/best-cooking-games/)
- [Icons8 Food Ingredients Icons](https://icons8.com/icons/set/food-ingredients)
- [SVG Repo Food Icons Collection](https://www.svgrepo.com/collection/food-icons/)
- [Iconscout Food Icons](https://iconscout.com/icons/food)
- [Cooking Mama Cute Aesthetics Analysis](https://medium.com/@isabelwu2005/the-cute-aesthetics-of-labor-analyzing-cooking-mama-through-the-lens-of-gender-and-culture-2c0c61cc564f)

This comprehensive plan transforms Kitchen Explorer from a simple prototype into a full-featured educational cooking game with depth, challenge, and lasting appeal!
