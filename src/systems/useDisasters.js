import { useState, useCallback, useEffect, useRef } from 'react';
import { DISASTER_TYPES } from '../data/gameData';

/**
 * useDisasters - Custom hook for managing kitchen disasters and mini-games
 *
 * Handles:
 * - Disaster triggering based on cooking conditions
 * - Disaster countdown timers
 * - Mini-game interactions
 * - Success/failure outcomes
 * - Warning notifications
 *
 * @param {Function} onDisasterSuccess - Callback when disaster is successfully handled
 * @param {Function} onDisasterFailure - Callback when disaster fails
 * @returns {Object} Disaster state and methods
 */
export function useDisasters(onDisasterSuccess, onDisasterFailure) {
  const [activeDisaster, setActiveDisaster] = useState(null);
  const [warnings, setWarnings] = useState([]); // Array of warning messages
  const [panTimer, setPanTimer] = useState(0); // Track how long pan has been on heat
  const [potTimer, setPotTimer] = useState(0); // Track how long pot has been boiling

  const warningIdRef = useRef(0);

  /**
   * Add a warning notification
   */
  const addWarning = useCallback((message, severity = 'medium') => {
    const warning = {
      id: warningIdRef.current++,
      message,
      severity, // low, medium, high
      timestamp: Date.now(),
    };

    setWarnings((prev) => [...prev, warning].slice(-3)); // Keep last 3 warnings

    // Auto-remove warning after 5 seconds
    setTimeout(() => {
      setWarnings((prev) => prev.filter((w) => w.id !== warning.id));
    }, 5000);

    return warning;
  }, []);

  /**
   * Trigger a disaster
   */
  const triggerDisaster = useCallback(
    (disasterType) => {
      if (activeDisaster) {
        return;
      } // Only one disaster at a time

      const disaster = DISASTER_TYPES[disasterType];
      if (!disaster) {
        return;
      }

      const newDisaster = {
        type: disasterType,
        ...disaster,
        timeRemaining: disaster.responseTime,
        startTime: Date.now(),
      };

      setActiveDisaster(newDisaster);

      return newDisaster;
    },
    [activeDisaster]
  );

  /**
   * Resolve disaster (player clicked action button in time)
   */
  const resolveDisaster = useCallback(() => {
    if (!activeDisaster) {
      return;
    }

    // Success!
    if (onDisasterSuccess) {
      onDisasterSuccess({
        disaster: activeDisaster,
        xp: activeDisaster.xpReward || 10,
        message: activeDisaster.successMessage,
      });
    }

    setActiveDisaster(null);
    setPanTimer(0); // Reset timers
    setPotTimer(0);
  }, [activeDisaster, onDisasterSuccess]);

  /**
   * Disaster timeout (player didn't respond in time)
   */
  const failDisaster = useCallback(() => {
    if (!activeDisaster) {
      return;
    }

    // Failure!
    if (onDisasterFailure) {
      onDisasterFailure({
        disaster: activeDisaster,
        message: activeDisaster.failureMessage,
      });
    }

    setActiveDisaster(null);
    setPanTimer(0);
    setPotTimer(0);
  }, [activeDisaster, onDisasterFailure]);

  /**
   * Update pan heat timer
   */
  const updatePanTimer = useCallback((isHeating) => {
    if (isHeating) {
      setPanTimer((prev) => prev + 1);
    } else {
      setPanTimer(0);
    }
  }, []);

  /**
   * Update pot heat timer
   */
  const updatePotTimer = useCallback((isBoiling) => {
    if (isBoiling) {
      setPotTimer((prev) => prev + 1);
    } else {
      setPotTimer(0);
    }
  }, []);

  /**
   * Check for disaster conditions and trigger if met
   */
  const checkDisasterConditions = useCallback(() => {
    if (activeDisaster) {
      return;
    } // Don't trigger if one is already active

    // Pan fire condition
    if (panTimer > 30 && Math.random() < 0.3) {
      addWarning(DISASTER_TYPES.fire.warningMessage, 'high');
      setTimeout(() => {
        triggerDisaster('fire');
      }, 2000); // 2 second warning before disaster
      return;
    }

    // Pot overflow condition
    if (potTimer > 45 && Math.random() < 0.3) {
      addWarning(DISASTER_TYPES.overflow.warningMessage, 'high');
      setTimeout(() => {
        triggerDisaster('overflow');
      }, 2000);
      return;
    }

    // Warning for high pan timer
    if (panTimer > 20 && panTimer % 10 === 0) {
      addWarning('The pan is getting very hot!', 'medium');
    }

    // Warning for high pot timer
    if (potTimer > 30 && potTimer % 15 === 0) {
      addWarning('The pot is boiling vigorously!', 'medium');
    }
  }, [panTimer, potTimer, activeDisaster, addWarning, triggerDisaster]);

  // Disaster countdown timer
  useEffect(() => {
    if (!activeDisaster) {
      return;
    }

    const countdownTimer = setInterval(() => {
      setActiveDisaster((prev) => {
        if (!prev) {
          return null;
        }

        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          // Time's up! Disaster failed
          failDisaster();
          return null;
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [activeDisaster, failDisaster]);

  // Periodic disaster condition check
  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkDisasterConditions();
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [checkDisasterConditions]);

  /**
   * Clear a specific warning
   */
  const dismissWarning = useCallback((warningId) => {
    setWarnings((prev) => prev.filter((w) => w.id !== warningId));
  }, []);

  /**
   * Clear all warnings
   */
  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  /**
   * Get warning color based on severity
   */
  const getWarningColor = useCallback((severity) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'yellow';
      default:
        return 'gray';
    }
  }, []);

  /**
   * Reset all disaster state (for clearing kitchen)
   */
  const resetDisasterState = useCallback(() => {
    setActiveDisaster(null);
    setWarnings([]);
    setPanTimer(0);
    setPotTimer(0);
  }, []);

  return {
    // State
    activeDisaster,
    warnings,
    panTimer,
    potTimer,

    // Methods
    triggerDisaster,
    resolveDisaster,
    failDisaster,
    updatePanTimer,
    updatePotTimer,
    addWarning,
    dismissWarning,
    clearWarnings,
    resetDisasterState,

    // Utility
    getWarningColor,
  };
}
