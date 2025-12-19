import { useState, useCallback, useEffect, useRef } from 'react';
import { CUSTOMER_TYPES, RECIPES } from '../data/gameData';

/**
 * useCustomerOrders - Custom hook for managing restaurant mode and customer orders
 *
 * Handles:
 * - Restaurant open/close state
 * - Customer order generation
 * - Order timers and patience tracking
 * - Order completion and tips
 * - Reputation system
 *
 * @param {Object} playerProfile - Player progression data (for level-based customer unlocks)
 * @param {Function} onOrderComplete - Callback when order is successfully completed
 * @param {Function} onOrderFailed - Callback when order times out
 * @returns {Object} Restaurant state and methods
 */
export function useCustomerOrders(playerProfile, onOrderComplete, onOrderFailed) {
  const [restaurantMode, setRestaurantMode] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [reputation, setReputation] = useState(5.0); // Out of 5 stars
  const nextOrderIdRef = useRef(1);

  /**
   * Toggle restaurant open/closed
   */
  const toggleRestaurant = useCallback(() => {
    setRestaurantMode((prev) => !prev);
  }, []);

  /**
   * Get available customer types based on player level
   */
  const getAvailableCustomerTypes = useCallback(() => {
    return Object.entries(CUSTOMER_TYPES).filter(([_, customer]) => {
      return !customer.unlockLevel || playerProfile.level >= customer.unlockLevel;
    });
  }, [playerProfile.level]);

  /**
   * Select a random customer type based on probabilities
   */
  const selectRandomCustomer = useCallback(() => {
    const availableCustomers = getAvailableCustomerTypes();
    const totalProbability = availableCustomers.reduce((sum, [_, c]) => sum + c.probability, 0);
    let random = Math.random() * totalProbability;

    for (const [type, customer] of availableCustomers) {
      random -= customer.probability;
      if (random <= 0) {
        return { type, ...customer };
      }
    }

    // Fallback to regular customer
    return { type: 'regular', ...CUSTOMER_TYPES.regular };
  }, [getAvailableCustomerTypes]);

  /**
   * Select a recipe for the customer
   */
  const selectRecipeForCustomer = useCallback((customer) => {
    const availableRecipes = Object.keys(RECIPES);

    // If customer has preferred dishes
    if (customer.preferredDishes && customer.preferredDishes.length > 0) {
      const validPreferred = customer.preferredDishes.filter((r) => availableRecipes.includes(r));
      if (validPreferred.length > 0) {
        return validPreferred[Math.floor(Math.random() * validPreferred.length)];
      }
    }

    // Otherwise random recipe
    return availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
  }, []);

  /**
   * Create a new customer order
   */
  const createOrder = useCallback(() => {
    if (activeOrders.length >= 3) {
      return;
    } // Max 3 concurrent orders

    const customer = selectRandomCustomer();
    const recipeId = selectRecipeForCustomer(customer);
    const recipe = RECIPES[recipeId];

    // Scale patience based on player level (more time at lower levels)
    // Level 1-2: 2x patience, Level 3-4: 1.5x patience, Level 5+: 1x patience
    let patienceMultiplier = 1.0;
    if (playerProfile.level <= 2) {
      patienceMultiplier = 2.0;
    } else if (playerProfile.level <= 4) {
      patienceMultiplier = 1.5;
    }

    const scaledPatience = Math.floor(customer.patience * patienceMultiplier);

    const newOrder = {
      id: nextOrderIdRef.current++,
      customer,
      recipeId,
      recipe,
      patienceRemaining: scaledPatience,
      patienceTotal: scaledPatience,
      createdAt: Date.now(),
    };

    setActiveOrders((prev) => [...prev, newOrder]);

    return newOrder;
  }, [activeOrders.length, selectRandomCustomer, selectRecipeForCustomer, playerProfile.level]);

  /**
   * Complete an order (called when player serves matching dish)
   */
  const completeOrder = useCallback(
    (orderId, speedBonus = 1.0) => {
      const order = activeOrders.find((o) => o.id === orderId);
      if (!order) {
        return null;
      }

      // Calculate tip and XP
      const baseXP = order.recipe.xpReward || 20;
      const tipMultiplier = order.customer.tipMultiplier || 1.0;
      const totalXP = Math.floor(baseXP * tipMultiplier * speedBonus);

      // Improve reputation for good service
      if (speedBonus > 0.8) {
        setReputation((prev) => Math.min(5.0, prev + 0.1));
      }

      // Remove order
      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));

      // Callback with order completion data
      if (onOrderComplete) {
        onOrderComplete({
          order,
          xp: totalXP,
          tip: tipMultiplier,
          speedBonus,
          message: `${order.customer.name} ${order.customer.emoji} loved the ${order.recipe.name}!`,
        });
      }

      return { xp: totalXP, tip: tipMultiplier };
    },
    [activeOrders, onOrderComplete]
  );

  /**
   * Fail an order (customer leaves unhappy)
   */
  const failOrder = useCallback(
    (orderId) => {
      const order = activeOrders.find((o) => o.id === orderId);
      if (!order) {
        return;
      }

      // Decrease reputation
      const reputationLoss = order.customer.forgiving ? 0.05 : 0.15;
      setReputation((prev) => Math.max(0, prev - reputationLoss));

      // Remove order
      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));

      // Callback
      if (onOrderFailed) {
        onOrderFailed({
          order,
          message: `${order.customer.name} ${order.customer.emoji} left unhappy...`,
        });
      }
    },
    [activeOrders, onOrderFailed]
  );

  /**
   * Check if a completed dish matches any active orders
   */
  const checkForMatchingOrder = useCallback(
    (recipeId) => {
      const matchingOrder = activeOrders.find((o) => o.recipeId === recipeId);

      if (matchingOrder) {
        // Calculate speed bonus based on time remaining
        const timeUsed = matchingOrder.patienceTotal - matchingOrder.patienceRemaining;
        const speedRatio = 1 - timeUsed / matchingOrder.patienceTotal;
        const speedBonus = Math.max(0.5, speedRatio); // 0.5x to 1.0x multiplier

        const result = completeOrder(matchingOrder.id, speedBonus);

        // Return both the result and the order information
        return {
          ...result,
          order: matchingOrder,
        };
      }

      return null;
    },
    [activeOrders, completeOrder]
  );

  /**
   * Manual order creation (for "New Customer" button)
   */
  const spawnCustomer = useCallback(() => {
    return createOrder();
  }, [createOrder]);

  // Timer: Decrease patience for all active orders every second
  useEffect(() => {
    if (!restaurantMode || activeOrders.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setActiveOrders((prev) => {
        const updated = prev.map((order) => ({
          ...order,
          patienceRemaining: order.patienceRemaining - 1,
        }));

        // Check for expired orders
        const expired = updated.filter((o) => o.patienceRemaining <= 0);
        expired.forEach((order) => failOrder(order.id));

        // Return only non-expired orders
        return updated.filter((o) => o.patienceRemaining > 0);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restaurantMode, activeOrders.length, failOrder]);

  // Auto-spawn customers when restaurant is open
  useEffect(() => {
    if (!restaurantMode) {
      return;
    }

    const spawnInterval = setInterval(() => {
      if (activeOrders.length < 3 && Math.random() > 0.3) {
        // 70% chance to spawn customer every 15 seconds
        createOrder();
      }
    }, 15000);

    return () => clearInterval(spawnInterval);
  }, [restaurantMode, activeOrders.length, createOrder]);

  /**
   * Get patience percentage for an order
   */
  const getPatiencePercent = useCallback((order) => {
    return (order.patienceRemaining / order.patienceTotal) * 100;
  }, []);

  /**
   * Get patience status color
   */
  const getPatienceColor = useCallback(
    (order) => {
      const percent = getPatiencePercent(order);
      if (percent > 60) {
        return 'green';
      }
      if (percent > 30) {
        return 'yellow';
      }
      return 'red';
    },
    [getPatiencePercent]
  );

  /**
   * Clear all orders (for closing restaurant)
   */
  const clearAllOrders = useCallback(() => {
    setActiveOrders([]);
  }, []);

  return {
    // State
    restaurantMode,
    activeOrders,
    reputation,

    // Methods
    toggleRestaurant,
    createOrder,
    completeOrder,
    failOrder,
    checkForMatchingOrder,
    spawnCustomer,
    clearAllOrders,

    // Utility
    getPatiencePercent,
    getPatienceColor,
  };
}
