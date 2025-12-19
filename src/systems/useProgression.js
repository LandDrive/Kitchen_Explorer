import { useState, useCallback, useEffect } from 'react';
import { CHEF_LEVELS, STARTER_INGREDIENTS, INGREDIENT_UNLOCKS } from '../data/gameData';

/**
 * useProgression - Custom hook for managing player progression
 *
 * Handles:
 * - XP tracking and level-ups
 * - Ingredient unlocking based on level
 * - Player profile persistence (localStorage)
 * - Level-up celebrations
 *
 * @returns {Object} Progression state and methods
 */
export function useProgression() {
  // Player profile state
  const [playerProfile, setPlayerProfile] = useState({
    level: 1,
    xp: 0,
    totalXP: 0,
    unlockedIngredients: [...STARTER_INGREDIENTS],
    discoveredRecipes: [],
    stats: {
      recipesCompleted: 0,
      customersServed: 0,
      disastersHandled: 0,
      perfectDishes: 0,
    },
  });

  // Level-up modal state
  const [levelUpData, setLevelUpData] = useState(null);

  // Load saved profile on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kitchenExplorerProfile');
      if (saved) {
        const loadedProfile = JSON.parse(saved);
        // Merge saved unlocked ingredients with current STARTER_INGREDIENTS
        // This ensures new starter ingredients are always available even in saved games
        const savedUnlocked = loadedProfile.unlockedIngredients || [];
        const mergedUnlocked = [...new Set([...STARTER_INGREDIENTS, ...savedUnlocked])];

        setPlayerProfile((prev) => ({
          ...prev,
          ...loadedProfile,
          // Ensure arrays exist and merge with current starters
          unlockedIngredients: mergedUnlocked,
          discoveredRecipes: loadedProfile.discoveredRecipes || [],
          stats: loadedProfile.stats || prev.stats,
        }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }, []);

  // Auto-save profile every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem('kitchenExplorerProfile', JSON.stringify(playerProfile));
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [playerProfile]);

  /**
   * Award XP and handle level-ups
   * @param {number} amount - XP to award
   * @param {string} reason - Why XP was awarded (for notifications)
   * @returns {Object} Result with newLevel and notification message
   */
  const gainXP = useCallback((amount, reason) => {
    const result = { leveledUp: false, newLevel: null, message: `+${amount} XP - ${reason}` };

    setPlayerProfile((prev) => {
      const newTotalXP = prev.totalXP + amount;
      let currentLevel = prev.level;
      let currentXP = prev.xp + amount;
      let newUnlocks = [...prev.unlockedIngredients];

      // Check for level-up
      const nextLevelData = CHEF_LEVELS.find((l) => l.level === currentLevel + 1);
      if (nextLevelData && newTotalXP >= nextLevelData.xpRequired) {
        // Level up!
        currentLevel += 1;
        currentXP = newTotalXP - nextLevelData.xpRequired;

        // Unlock ingredients for this level
        const ingredientUnlocks = INGREDIENT_UNLOCKS[currentLevel] || [];
        newUnlocks = [...new Set([...newUnlocks, ...ingredientUnlocks])];

        // Set level-up data for modal
        setLevelUpData({
          newLevel: currentLevel,
          title: CHEF_LEVELS.find((l) => l.level === currentLevel)?.title || 'Chef',
          message: nextLevelData.unlocksMessage,
          unlockedIngredients: ingredientUnlocks,
        });

        result.leveledUp = true;
        result.newLevel = currentLevel;
        result.message = `Level Up! You are now a ${CHEF_LEVELS.find((l) => l.level === currentLevel)?.title}!`;
      }

      return {
        ...prev,
        level: currentLevel,
        xp: currentXP,
        totalXP: newTotalXP,
        unlockedIngredients: newUnlocks,
      };
    });

    return result;
  }, []);

  /**
   * Mark a recipe as discovered
   * @param {string} recipeId - Recipe identifier
   * @returns {boolean} True if newly discovered
   */
  const discoverRecipe = useCallback((recipeId) => {
    let isNew = false;

    setPlayerProfile((prev) => {
      if (!prev.discoveredRecipes.includes(recipeId)) {
        isNew = true;
        return {
          ...prev,
          discoveredRecipes: [...prev.discoveredRecipes, recipeId],
        };
      }
      return prev;
    });

    return isNew;
  }, []);

  /**
   * Update player statistics
   * @param {string} stat - Stat name
   * @param {number} increment - Amount to increment (default 1)
   */
  const updateStat = useCallback((stat, increment = 1) => {
    setPlayerProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: (prev.stats[stat] || 0) + increment,
      },
    }));
  }, []);

  /**
   * Get current chef level data
   * @returns {Object} Current level information
   */
  const getCurrentLevelData = useCallback(() => {
    return CHEF_LEVELS.find((l) => l.level === playerProfile.level) || CHEF_LEVELS[0];
  }, [playerProfile.level]);

  /**
   * Get next level data
   * @returns {Object|null} Next level information or null if at max level
   */
  const getNextLevelData = useCallback(() => {
    return CHEF_LEVELS.find((l) => l.level === playerProfile.level + 1) || null;
  }, [playerProfile.level]);

  /**
   * Calculate XP progress to next level
   * @returns {number} Percentage (0-100)
   */
  const getXPProgress = useCallback(() => {
    const currentLevelData = getCurrentLevelData();
    const nextLevelData = getNextLevelData();

    if (!nextLevelData) {
      return 100;
    } // Max level

    const xpForCurrentLevel = currentLevelData.xpRequired;
    const xpForNextLevel = nextLevelData.xpRequired;
    const xpRange = xpForNextLevel - xpForCurrentLevel;
    const xpIntoLevel = playerProfile.totalXP - xpForCurrentLevel;

    return Math.min(100, Math.max(0, (xpIntoLevel / xpRange) * 100));
  }, [playerProfile.totalXP, getCurrentLevelData, getNextLevelData]);

  /**
   * Close the level-up modal
   */
  const closeLevelUpModal = useCallback(() => {
    setLevelUpData(null);
  }, []);

  /**
   * Check if an ingredient is unlocked
   * @param {string} ingredientId - Ingredient identifier
   * @returns {boolean} True if unlocked
   */
  const isIngredientUnlocked = useCallback(
    (ingredientId) => {
      return playerProfile.unlockedIngredients.includes(ingredientId);
    },
    [playerProfile.unlockedIngredients]
  );

  /**
   * Reset profile (for testing or new game)
   */
  const resetProfile = useCallback(() => {
    const newProfile = {
      level: 1,
      xp: 0,
      totalXP: 0,
      unlockedIngredients: [...STARTER_INGREDIENTS],
      discoveredRecipes: [],
      stats: {
        recipesCompleted: 0,
        customersServed: 0,
        disastersHandled: 0,
        perfectDishes: 0,
      },
    };

    setPlayerProfile(newProfile);
    localStorage.setItem('kitchenExplorerProfile', JSON.stringify(newProfile));
  }, []);

  return {
    // State
    playerProfile,
    levelUpData,

    // Methods
    gainXP,
    discoverRecipe,
    updateStat,
    isIngredientUnlocked,
    closeLevelUpModal,
    resetProfile,

    // Computed values
    currentLevel: getCurrentLevelData(),
    nextLevel: getNextLevelData(),
    xpProgress: getXPProgress(),
  };
}
