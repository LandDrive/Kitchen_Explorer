import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Input Mode Detection Hook
 *
 * Detects and tracks the current input mode (mouse, touch, pen) for hybrid devices.
 * Automatically updates when user switches between input methods.
 *
 * Features:
 * - Real-time input mode detection via Pointer Events
 * - Hybrid device detection (has both touch and fine pointer)
 * - Debounced mode switching to prevent flicker
 * - Context provider for app-wide access
 */

// Context for app-wide input mode access
const InputModeContext = createContext(null);

/**
 * Hook to detect and track input mode
 * @returns {Object} { mode, isHybridDevice, isTouchPrimary, lastInteraction }
 */
export const useInputMode = () => {
  const [state, setState] = useState(() => {
    // Initial detection based on media queries
    const hasTouch = typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const hasFinePointer = typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: fine)').matches;
    const hasCoarsePointer = typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)').matches;

    // Determine initial mode
    let initialMode = 'mouse';
    if (hasCoarsePointer && !hasFinePointer) {
      initialMode = 'touch';
    }

    return {
      mode: initialMode,           // 'mouse' | 'touch' | 'pen'
      lastInteraction: Date.now(),
      isHybridDevice: hasTouch && hasFinePointer,
      isTouchPrimary: hasCoarsePointer && !hasFinePointer,
    };
  });

  // Debounce timer ref
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Update mode with debouncing to prevent rapid switching
  const updateMode = useCallback((newMode) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setState(prev => {
        if (prev.mode !== newMode) {
          return {
            ...prev,
            mode: newMode,
            lastInteraction: Date.now(),
          };
        }
        return prev;
      });
    }, 50); // 50ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Pointer event handler - most reliable for hybrid devices
    const handlePointerEvent = (e) => {
      const pointerType = e.pointerType;
      if (pointerType === 'mouse' || pointerType === 'touch' || pointerType === 'pen') {
        updateMode(pointerType);
      }
    };

    // Add listeners for pointer events
    document.addEventListener('pointerdown', handlePointerEvent, { passive: true });
    document.addEventListener('pointermove', handlePointerEvent, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('pointerdown', handlePointerEvent);
      document.removeEventListener('pointermove', handlePointerEvent);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [updateMode, debounceTimer]);

  // Listen for media query changes (e.g., external mouse connected)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');

    const handleMediaChange = () => {
      const hasFine = finePointerQuery.matches;
      const hasCoarse = coarsePointerQuery.matches;

      setState(prev => ({
        ...prev,
        isHybridDevice: hasCoarse && hasFine,
        isTouchPrimary: hasCoarse && !hasFine,
      }));
    };

    finePointerQuery.addEventListener('change', handleMediaChange);
    coarsePointerQuery.addEventListener('change', handleMediaChange);

    return () => {
      finePointerQuery.removeEventListener('change', handleMediaChange);
      coarsePointerQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return state;
};

/**
 * Input Mode Provider - wraps app for context access
 */
export const InputModeProvider = ({ children }) => {
  const inputMode = useInputMode();

  return (
    <InputModeContext.Provider value={inputMode}>
      {children}
    </InputModeContext.Provider>
  );
};

/**
 * Hook to access input mode from context
 */
export const useInputModeContext = () => {
  const context = useContext(InputModeContext);
  if (!context) {
    // Fallback if not in provider - use hook directly
    return useInputMode();
  }
  return context;
};

/**
 * Utility to check if touch mode is active
 */
export const isTouchMode = (mode) => mode === 'touch';

/**
 * Utility to check if pen/stylus mode is active
 */
export const isPenMode = (mode) => mode === 'pen';

/**
 * Utility to check if any pointer mode (not mouse)
 */
export const isDirectPointer = (mode) => mode === 'touch' || mode === 'pen';

export default useInputMode;
