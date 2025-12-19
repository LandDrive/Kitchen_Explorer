#!/usr/bin/env python3
"""
Add UI components for progression, orders, and disasters to Kitchen Explorer
"""

import re

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def add_ui_components():
    source_file = 'C:/Dev/Kitchen_Explorer/src/CookingGame.jsx'
    content = read_file(source_file)

    # Find the main return statement and add UI components
    # Look for the title "Kitchen Explorer"
    title_pos = content.find('Kitchen Explorer</h1>')

    if title_pos == -1:
        print("Could not find title element")
        return {}

    # Find the div that contains the header bar
    container_start = content.rfind('<div className="px-4 py-2 flex', 0, title_pos)

    # Insert XP Bar and Restaurant Mode Toggle after title container
    ui_components = '''

      {/* XP Bar and Player Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4 shadow-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-white font-bold text-lg">
            {CHEF_LEVELS.find(l => l.level === playerProfile.level)?.name} - Level {playerProfile.level}
          </div>
          <div className="text-white text-sm">
            {playerProfile.xp} / {CHEF_LEVELS.find(l => l.level === playerProfile.level + 1)?.xpRequired || '∞'} XP
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-gray-900"
            style={{
              width: `${((playerProfile.xp / (CHEF_LEVELS.find(l => l.level === playerProfile.level + 1)?.xpRequired || 100)) * 100)}%`
            }}
          >
            {Math.floor((playerProfile.xp / (CHEF_LEVELS.find(l => l.level === playerProfile.level + 1)?.xpRequired || 100)) * 100)}%
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-white text-sm">
          <span>🍽️ Recipes: {playerProfile.stats.recipesCompleted}</span>
          <span>👥 Served: {playerProfile.stats.customersServed}</span>
          <span>⭐ Rep: {reputation.toFixed(1)}/5.0</span>
        </div>
      </div>

      {/* Restaurant Mode Toggle */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setRestaurantMode(!restaurantMode)}
          className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${
            restaurantMode
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {restaurantMode ? '🔴 Close Restaurant' : '🟢 Open Restaurant'}
        </button>
        {restaurantMode && (
          <button
            onClick={createOrder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            + New Customer
          </button>
        )}
      </div>

      {/* Active Orders Row */}
      {restaurantMode && activeOrders.length > 0 && (
        <div className="mb-4">
          <h3 className="text-white font-bold mb-2">📋 Active Orders</h3>
          <div className="flex gap-3 overflow-x-auto">
            {activeOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-3 shadow-md min-w-[200px] border-2 border-gray-300"
                style={{
                  borderColor: order.timeRemaining < 30 ? '#EF4444' : order.timeRemaining < 60 ? '#F59E0B' : '#10B981'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-2xl">{order.customer.emoji}</div>
                    <div className="text-xs text-gray-600">{order.customer.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{RECIPES[order.recipe].emoji}</div>
                    <div className="text-xs font-semibold text-gray-700">{order.recipeName}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-1">Time left:</div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(order.timeRemaining / order.maxTime) * 100}%`,
                      backgroundColor: order.timeRemaining < 30 ? '#EF4444' : order.timeRemaining < 60 ? '#F59E0B' : '#10B981'
                    }}
                  />
                </div>
                <div className="text-xs text-center mt-1 font-semibold">
                  {Math.floor(order.timeRemaining / 60)}:{(order.timeRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Banners */}
      {warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {warnings.slice(-3).map(warning => (
            <div
              key={warning.id}
              className={`p-3 rounded-lg font-semibold ${
                warning.type === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-500 text-gray-900'
              }`}
            >
              ⚠️ {warning.message}
            </div>
          ))}
        </div>
      )}

      {/* Level Up Modal */}
      {showLevelUp && levelUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md shadow-2xl">
            <h2 className="text-4xl font-bold text-center mb-4 text-purple-600">
              🎉 Level Up! 🎉
            </h2>
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{playerProfile.level}</div>
              <div className="text-2xl font-bold text-gray-800">{levelUpData.levelName}</div>
            </div>
            {levelUpData.unlocks.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">New Ingredients Unlocked:</h3>
                <div className="flex flex-wrap gap-2">
                  {levelUpData.unlocks.map(ingredient => (
                    <div key={ingredient} className="bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
                      {INGREDIENTS[ingredient]?.name || ingredient}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setShowLevelUp(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
            >
              Continue Cooking!
            </button>
          </div>
        </div>
      )}

      {/* Disaster Mini-Game Overlay */}
      {activeDisaster && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg shadow-2xl text-center">
            <div className="text-6xl mb-4 animate-bounce">{activeDisaster.emoji}</div>
            <h2 className="text-3xl font-bold text-red-600 mb-2">{activeDisaster.name}</h2>
            <p className="text-lg mb-4">{activeDisaster.message}</p>
            <div className="text-2xl font-bold mb-6">Time: {activeDisaster.timeLeft}s</div>
            {activeDisaster.minigame === 'extinguish' && (
              <button
                onClick={() => {
                  setPanHeat(false);
                  setPanItems([]);
                  setActiveDisaster(null);
                  setPlayerProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, disastersHandled: prev.stats.disastersHandled + 1 }
                  }));
                  showNotification('Fire extinguished!', 'success');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-xl"
              >
                🧯 Use Fire Extinguisher
              </button>
            )}
            {activeDisaster.minigame === 'turnoff' && (
              <button
                onClick={() => {
                  setPotHeat(false);
                  setActiveDisaster(null);
                  setPlayerProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, disastersHandled: prev.stats.disastersHandled + 1 }
                  }));
                  showNotification('Heat turned off!', 'success');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl"
              >
                🔥 Turn Off Heat
              </button>
            )}
            {activeDisaster.minigame === 'remove' && (
              <button
                onClick={() => {
                  setPanItems([]);
                  setActiveDisaster(null);
                  setPlayerProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, disastersHandled: prev.stats.disastersHandled + 1 }
                  }));
                  showNotification('Food removed from heat!', 'success');
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg font-bold text-xl"
              >
                🍳 Remove from Heat
              </button>
            )}
          </div>
        </div>
      )}

'''

    # Find the closing div of the title container and insert after it
    insert_pos = content.find('</div>', container_start) + len('</div>')

    # Insert the UI components
    content = content[:insert_pos] + ui_components + content[insert_pos:]

    # Now update the checkRecipeCompletion to award XP
    # Find the checkRecipeCompletion function
    check_recipe_pos = content.find('const checkRecipeCompletion')

    if check_recipe_pos > 0:
        # Find the part where it sets completedDishes
        completed_dishes_line = content.find('setCompletedDishes(prev => [...prev, recipeKey]);', check_recipe_pos)

        if completed_dishes_line > 0:
            # Add XP gain and stat update after setCompletedDishes
            xp_addition = '''

        // Award XP for completing recipe
        const xpReward = RECIPES[recipeKey].xpReward || 25;
        gainXP(xpReward, `Completed ${recipeName}`);
        setPlayerProfile(prev => ({
          ...prev,
          stats: { ...prev.stats, recipesCompleted: prev.stats.recipesCompleted + 1 }
        }));
        '''

            # Find the end of the setCompletedDishes line
            insert_at = content.find(';', completed_dishes_line) + 1
            content = content[:insert_at] + xp_addition + content[insert_at:]

    # Also update the plate rendering to check orders when dish is placed
    # Find where plateItems are rendered and add order checking
    plate_items_render = content.find('className="flex flex-wrap gap-2 justify-center">', content.find('Plate'))

    if plate_items_render > 0:
        # Find useEffect for plateItems and add order checking
        # We'll add it to the existing useEffect or create a new one

        # Add useEffect for checking orders when plate changes
        plate_check_effect = '''

  // Check for order matches when plate changes
  useEffect(() => {
    if (restaurantMode && plateItems.length > 0) {
      checkOrderMatch(plateItems);
    }
  }, [plateItems, restaurantMode, checkOrderMatch]);

'''

        # Find a good place to insert this - after other useEffects
        last_useeffect = content.rfind('}, [', 0, content.find('return ('))
        if last_useeffect > 0:
            insert_at = content.find(']);', last_useeffect) + 3
            content = content[:insert_at] + plate_check_effect + content[insert_at:]

    # Write the enhanced file
    write_file(source_file, content)

    return {
        'enhanced_size': len(content)
    }

if __name__ == '__main__':
    stats = add_ui_components()
    print("UI Components Added!")
    print(f"Final file size: {stats['enhanced_size']:,} chars")
