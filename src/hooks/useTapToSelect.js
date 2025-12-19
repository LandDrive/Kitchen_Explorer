import { useState, useCallback, useEffect } from 'react';

/**
 * Tap-to-Select Hook
 *
 * Provides an alternative interaction mode where users tap to select an item,
 * then tap a destination to place it. This is more accessible and easier for
 * touch users who struggle with drag-and-drop.
 *
 * Flow:
 * 1. User taps an ingredient → Item is selected (highlighted)
 * 2. User taps a station → Item is placed at that station
 * 3. User taps elsewhere → Selection is cancelled
 *
 * Features:
 * - Automatic mode activation for touch input
 * - Visual selection state
 * - Hint message display
 * - Keyboard support (Escape to cancel)
 * - Haptic feedback integration
 */

/**
 * Main tap-to-select hook
 * @param {Object} options Configuration options
 * @param {Function} options.onPlace Called when item is placed (item, dropZone, source)
 * @param {Function} options.onSelect Called when item is selected (item, source)
 * @param {Function} options.onCancel Called when selection is cancelled
 * @param {boolean} options.enableHaptics Enable haptic feedback (default: true)
 * @param {number} options.hintDuration How long to show hint (ms, default: 3000)
 * @returns {Object} Selection state and handlers
 */
export const useTapToSelect = ({
  onPlace,
  onSelect,
  onCancel,
  enableHaptics = true,
  hintDuration = 3000,
} = {}) => {
  // Selection state
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');

  /**
   * Trigger haptic feedback
   */
  const hapticFeedback = useCallback((pattern) => {
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [enableHaptics]);

  /**
   * Select an item (first tap)
   */
  const selectItem = useCallback((item, source) => {
    hapticFeedback(15); // Selection feedback

    setSelectedItem(item);
    setSelectedSource(source);

    // Show hint
    const itemName = item.type || 'item';
    setHintMessage(`Tap a station to place ${itemName}`);
    setShowHint(true);

    if (onSelect) {
      onSelect(item, source);
    }

    // Auto-hide hint after duration
    setTimeout(() => {
      setShowHint(false);
    }, hintDuration);
  }, [hapticFeedback, onSelect, hintDuration]);

  /**
   * Place selected item at destination (second tap)
   */
  const placeItem = useCallback((dropZone) => {
    if (!selectedItem) return false;

    hapticFeedback(20); // Success feedback

    if (onPlace) {
      onPlace(selectedItem, dropZone, selectedSource);
    }

    // Clear selection
    setSelectedItem(null);
    setSelectedSource(null);
    setShowHint(false);

    return true;
  }, [selectedItem, selectedSource, hapticFeedback, onPlace]);

  /**
   * Cancel current selection
   */
  const cancelSelection = useCallback((reason = 'manual') => {
    if (!selectedItem) return;

    hapticFeedback([10, 30]); // Cancel feedback

    if (onCancel) {
      onCancel(selectedItem, reason);
    }

    setSelectedItem(null);
    setSelectedSource(null);
    setShowHint(false);
  }, [selectedItem, hapticFeedback, onCancel]);

  /**
   * Check if an item is currently selected
   */
  const isSelected = useCallback((item) => {
    if (!selectedItem || !item) return false;
    return selectedItem.id === item.id ||
      (selectedItem.type === item.type && selectedItem.state === item.state);
  }, [selectedItem]);

  /**
   * Handle tap on any element - determines if it's select, place, or cancel
   */
  const handleTap = useCallback((e, item, source, dropZone) => {
    // If we have a selected item
    if (selectedItem) {
      // If tapping on a drop zone, place the item
      if (dropZone) {
        placeItem(dropZone);
        return 'placed';
      }
      // If tapping on another item, select it instead
      if (item) {
        selectItem(item, source);
        return 'reselected';
      }
      // Otherwise cancel selection
      cancelSelection('tap-elsewhere');
      return 'cancelled';
    }

    // No item selected - select this item if provided
    if (item) {
      selectItem(item, source);
      return 'selected';
    }

    return 'none';
  }, [selectedItem, selectItem, placeItem, cancelSelection]);

  // Keyboard support - Escape to cancel
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cancelSelection('escape');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, cancelSelection]);

  // Clear selection after timeout (optional safety)
  useEffect(() => {
    if (!selectedItem) return;

    // Auto-cancel after 30 seconds of no action
    const timeout = setTimeout(() => {
      cancelSelection('timeout');
    }, 30000);

    return () => clearTimeout(timeout);
  }, [selectedItem, cancelSelection]);

  return {
    // State
    selectedItem,
    selectedSource,
    hasSelection: !!selectedItem,
    showHint,
    hintMessage,

    // Methods
    selectItem,
    placeItem,
    cancelSelection,
    handleTap,
    isSelected,
  };
};

/**
 * Hook for drop zone handling in tap-to-select mode
 * Use this on station components
 */
export const useTapDropZone = (dropZoneId, tapToSelect) => {
  const handleTap = useCallback((e) => {
    if (tapToSelect.hasSelection) {
      e.stopPropagation();
      tapToSelect.placeItem(dropZoneId);
      return true;
    }
    return false;
  }, [dropZoneId, tapToSelect]);

  return {
    onClick: handleTap,
    isDropTarget: tapToSelect.hasSelection,
  };
};

export default useTapToSelect;
