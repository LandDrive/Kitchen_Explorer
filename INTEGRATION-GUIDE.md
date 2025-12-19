# Integration Guide - Phase 6

## Changes to CookingGame.jsx

### 1. Add Imports (top of file)

```javascript
import { useProgression } from './systems/useProgression';
import { useCustomerOrders } from './systems/useCustomerOrders';
import { useDisasters } from './systems/useDisasters';
```

### 2. Initialize Hooks (inside component, before other useState calls)

```javascript
// Progression system
const {
  playerProfile,
  levelUpData,
  gainXP,
  discoverRecipe,
  updateStat,
  isIngredientUnlocked,
  closeLevelUpModal,
  currentLevel,
  nextLevel,
  xpProgress,
} = useProgression();

// Customer orders system
const {
  restaurantMode,
  activeOrders,
  reputation,
  toggleRestaurant,
  checkForMatchingOrder,
  spawnCustomer,
  getPatiencePercent,
  getPatienceColor,
} = useCustomerOrders(
  playerProfile,
  // onOrderComplete callback
  ({ xp, message }) => {
    gainXP(xp, 'Customer order');
    updateStat('customersServed');
    showNotification(message, 'success');
  },
  // onOrderFailed callback
  ({ message }) => {
    showNotification(message, 'error');
  }
);

// Disaster system
const {
  activeDisaster,
  warnings,
  panTimer,
  potTimer,
  resolveDisaster,
  updatePanTimer,
  updatePotTimer,
  getWarningColor,
} = useDisasters(
  // onDisasterSuccess callback
  ({ xp, message }) => {
    gainXP(xp, 'Disaster handled');
    updateStat('disastersHandled');
    showNotification(message, 'success');
  },
  // onDisasterFailure callback
  ({ message }) => {
    showNotification(message, 'error');
  }
);
```

### 3. Update Recipe Completion Logic

Find the `checkRecipe` function and add:

```javascript
// After successful recipe detection, add:
gainXP(recipe.xpReward || 20, `Made ${recipe.name}`);

const isNew = discoverRecipe(recipeId);
if (isNew) {
  gainXP(10, `Discovered ${recipe.name}!`);
  showNotification(`New recipe discovered: ${recipe.name}! +10 XP`, 'success');
}

updateStat('recipesCompleted');

// Check for matching customer order
const orderResult = checkForMatchingOrder(recipeId);
```

### 4. Update Pan/Pot Heat Tracking

Add useEffect to track heating:

```javascript
useEffect(() => {
  updatePanTimer(panHeat);
}, [panHeat, updatePanTimer]);

useEffect(() => {
  updatePotTimer(potBoiling);
}, [potBoiling, updatePotTimer]);
```

### 5. Filter Pantry by Unlocked Ingredients

Update pantry rendering:

```javascript
{Object.entries(INGREDIENT_CATEGORIES).map(([catKey, category]) => (
  <div key={catKey}>
    <div>{category.icon} {category.name}</div>
    {category.items
      .filter(item => isIngredientUnlocked(item))  // ADD THIS LINE
      .map(item => (
        // ... ingredient rendering
      ))}
  </div>
))}
```

### 6. Add UI Components at Top of Return Statement

```jsx
{
  /* XP Progress Bar */
}
<div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-2 z-50">
  <div className="flex items-center justify-between max-w-4xl mx-auto">
    <div className="flex items-center gap-4">
      <span className="font-bold">{currentLevel.title}</span>
      <span>Level {playerProfile.level}</span>
    </div>
    <div className="flex-1 mx-4">
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
      <div className="text-xs text-center mt-1">
        {playerProfile.xp} / {nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 'MAX'} XP
      </div>
    </div>
    <div className="flex gap-4 text-sm">
      <span>🍽️ {playerProfile.stats.recipesCompleted}</span>
      <span>👥 {playerProfile.stats.customersServed}</span>
      <span>⭐ {reputation.toFixed(1)}</span>
    </div>
  </div>
</div>;

{
  /* Restaurant Mode Toggle */
}
<button
  onClick={toggleRestaurant}
  className={`fixed top-20 right-4 px-4 py-2 rounded-lg font-bold z-40 ${
    restaurantMode ? 'bg-red-500' : 'bg-green-500'
  } text-white`}
>
  {restaurantMode ? 'Close Restaurant' : 'Open Restaurant'}
</button>;

{
  /* Active Orders Display */
}
{
  restaurantMode && activeOrders.length > 0 && (
    <div className="fixed top-32 left-0 right-0 bg-white shadow-lg p-4 z-40">
      <div className="flex gap-4 overflow-x-auto max-w-4xl mx-auto">
        {activeOrders.map((order) => {
          const patiencePercent = getPatiencePercent(order);
          const color = getPatienceColor(order);
          return (
            <div
              key={order.id}
              className="min-w-[200px] border-2 rounded-lg p-3"
              style={{ borderColor: order.customer.color }}
            >
              <div className="font-bold">
                {order.customer.emoji} {order.customer.name}
              </div>
              <div className="text-sm">
                {order.recipe.emoji} {order.recipe.name}
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all`}
                    style={{
                      width: `${patiencePercent}%`,
                      backgroundColor:
                        color === 'green' ? '#4CAF50' : color === 'yellow' ? '#FFC107' : '#F44336',
                    }}
                  />
                </div>
                <div className="text-xs text-center mt-1">
                  {Math.floor(order.patienceRemaining)}s
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {activeOrders.length < 3 && (
        <button
          onClick={spawnCustomer}
          className="mt-2 mx-auto block px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          + New Customer
        </button>
      )}
    </div>
  );
}

{
  /* Warning Banners */
}
{
  warnings.length > 0 && (
    <div className="fixed top-64 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-2xl mx-auto space-y-2">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className="px-4 py-2 rounded-lg text-white text-center font-bold"
            style={{ backgroundColor: getWarningColor(warning.severity) }}
          >
            ⚠️ {warning.message}
          </div>
        ))}
      </div>
    </div>
  );
}

{
  /* Level Up Modal */
}
{
  levelUpData && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
        <div className="text-2xl text-yellow-600 mb-4">Level {levelUpData.newLevel}</div>
        <div className="text-xl font-bold mb-2">{levelUpData.title}</div>
        <p className="mb-4">{levelUpData.message}</p>
        {levelUpData.unlockedIngredients && levelUpData.unlockedIngredients.length > 0 && (
          <div className="mb-4">
            <div className="font-bold">New Ingredients Unlocked:</div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {levelUpData.unlockedIngredients.map((ing) => (
                <span key={ing} className="px-2 py-1 bg-green-100 rounded text-sm">
                  {INGREDIENTS[ing]?.name || ing}
                </span>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={closeLevelUpModal}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

{
  /* Disaster Mini-Game Overlay */
}
{
  activeDisaster && (
    <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">{activeDisaster.emoji}</div>
        <h2 className="text-3xl font-bold mb-2 text-red-600">{activeDisaster.name}!</h2>
        <div className="text-5xl font-bold text-red-600 mb-4">{activeDisaster.timeRemaining}s</div>
        <button
          onClick={resolveDisaster}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg font-bold text-xl hover:bg-blue-600"
        >
          {activeDisaster.actionButton}
        </button>
      </div>
    </div>
  );
}
```

## Testing Checklist

- [ ] Game loads without errors
- [ ] XP bar displays at top
- [ ] Complete recipe → XP increases → progress bar fills
- [ ] Reach 100 XP → Level up modal appears
- [ ] New ingredients appear in pantry after level up
- [ ] Toggle restaurant mode → Orders appear
- [ ] Complete matching dish → Order completes, XP awarded
- [ ] Let order timeout → Reputation decreases
- [ ] Leave pan on heat 30s → Warning appears → Fire disaster triggers
- [ ] Click disaster button → Disaster resolves, XP awarded
- [ ] Reload page → Progress persists

## Files Modified

1. `src/CookingGame.jsx` - Main integration
2. All hooks working together seamlessly

## Expected Behavior

- Level 1: Start with 14 ingredients
- Level 2 @ 100 XP: Unlock 5 more ingredients
- Level 3 @ 300 XP: Unlock 7 more ingredients + Food Critics
- Level 4 @ 600 XP: Unlock 6 more ingredients
- Level 5 @ 1000 XP: Unlock 5 more + VIP customers
- Level 6 @ 1500 XP: Master Chef!

Each recipe: 20-30 XP
Customer orders: +15-150 XP (with tips/bonuses)
Disasters handled: +10-15 XP
Recipe discovery: +10 XP bonus
