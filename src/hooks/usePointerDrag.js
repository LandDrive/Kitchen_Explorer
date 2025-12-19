import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Unified Pointer Drag Hook
 *
 * Handles drag-and-drop for mouse, touch, and pen input using Pointer Events API.
 * Provides consistent behavior across all input types on hybrid devices.
 *
 * Features:
 * - Unified handling for mouse, touch, and pen
 * - Pointer capture for reliable drag tracking
 * - Movement threshold to distinguish tap from drag
 * - Haptic feedback for touch interactions
 * - Drop zone detection via elementFromPoint
 * - Cancel gesture support (drag up to cancel)
 */

const DRAG_THRESHOLD = 8; // Pixels of movement before drag starts
const CANCEL_THRESHOLD = 100; // Pixels above start to cancel

/**
 * Main pointer drag hook
 * @param {Object} options Configuration options
 * @param {Function} options.onDragStart Called when drag starts (after threshold)
 * @param {Function} options.onDragMove Called during drag movement
 * @param {Function} options.onDragEnd Called when drag ends on valid drop zone
 * @param {Function} options.onDragCancel Called when drag is cancelled
 * @param {Function} options.findDropZone Custom drop zone finder (optional)
 * @param {boolean} options.enableHaptics Enable haptic feedback (default: true)
 * @returns {Object} { dragState, handlers, previewPosition, isDragging }
 */
export const usePointerDrag = ({
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  findDropZone,
  enableHaptics = true,
} = {}) => {
  // Drag state
  const [dragState, setDragState] = useState({
    active: false,
    item: null,
    source: null,
    pointerId: null,
    pointerType: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    hasMoved: false, // True after threshold exceeded
    currentDropZone: null,
  });

  // Refs for performance (avoid re-renders during move)
  const positionRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);
  const rafRef = useRef(null);

  // Preview position state (for rendering drag preview)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  /**
   * Trigger haptic feedback
   */
  const hapticFeedback = useCallback((pattern) => {
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [enableHaptics]);

  /**
   * Find drop zone at given coordinates
   */
  const findDropZoneAt = useCallback((x, y) => {
    if (findDropZone) {
      return findDropZone(x, y);
    }

    // Default implementation using elementFromPoint
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    // Traverse up to find drop zone
    let current = element;
    while (current && current !== document.body) {
      const dropZone = current.getAttribute('data-drop-zone');
      if (dropZone) {
        return {
          id: dropZone,
          element: current,
        };
      }
      current = current.parentElement;
    }

    return null;
  }, [findDropZone]);

  /**
   * Handle pointer down - start potential drag
   */
  const handlePointerDown = useCallback((e, item, source) => {
    // Only handle primary button for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Capture pointer for reliable tracking
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
        elementRef.current = e.target;
      } catch (err) {
        // Pointer capture may fail in some cases, continue anyway
      }
    }

    // Initial haptic feedback for touch
    if (e.pointerType === 'touch') {
      hapticFeedback(10);
    }

    const startPos = { x: e.clientX, y: e.clientY };
    positionRef.current = startPos;

    setDragState({
      active: true,
      item,
      source,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      startPosition: startPos,
      currentPosition: startPos,
      hasMoved: false,
      currentDropZone: null,
    });

    setPreviewPosition(startPos);
  }, [hapticFeedback]);

  /**
   * Handle pointer move - track drag
   */
  const handlePointerMove = useCallback((e) => {
    if (!dragState.active || dragState.pointerId !== e.pointerId) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    positionRef.current = currentPos;

    // Calculate movement
    const deltaX = Math.abs(currentPos.x - dragState.startPosition.x);
    const deltaY = Math.abs(currentPos.y - dragState.startPosition.y);
    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check if movement threshold exceeded
    if (!dragState.hasMoved && totalMovement > DRAG_THRESHOLD) {
      // Drag has started
      hapticFeedback(15);

      setDragState(prev => ({
        ...prev,
        hasMoved: true,
      }));

      if (onDragStart) {
        onDragStart(e, dragState.item, dragState.source);
      }
    }

    // Update preview position (throttled via RAF)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setPreviewPosition(currentPos);

      // Find current drop zone
      const dropZone = findDropZoneAt(currentPos.x, currentPos.y);

      setDragState(prev => ({
        ...prev,
        currentPosition: currentPos,
        currentDropZone: dropZone?.id || null,
      }));

      if (onDragMove && dragState.hasMoved) {
        onDragMove(e, currentPos, dropZone);
      }
    });
  }, [dragState, hapticFeedback, onDragStart, onDragMove, findDropZoneAt]);

  /**
   * Handle pointer up - end drag
   */
  const handlePointerUp = useCallback((e) => {
    if (!dragState.active) return;
    if (dragState.pointerId !== e.pointerId) return;

    // Release pointer capture
    if (elementRef.current && elementRef.current.releasePointerCapture) {
      try {
        elementRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
        // May already be released
      }
    }

    // Cancel RAF if pending
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const endPos = { x: e.clientX, y: e.clientY };

    // Check for cancel gesture (dragged significantly up from start)
    const draggedUp = dragState.startPosition.y - endPos.y;
    if (draggedUp > CANCEL_THRESHOLD && dragState.hasMoved) {
      hapticFeedback([10, 50, 10]); // Error pattern
      if (onDragCancel) {
        onDragCancel(dragState.item, 'gesture');
      }
      setDragState({
        active: false,
        item: null,
        source: null,
        pointerId: null,
        pointerType: null,
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        hasMoved: false,
        currentDropZone: null,
      });
      return;
    }

    // Find drop zone
    const dropZone = findDropZoneAt(endPos.x, endPos.y);

    if (dropZone && dragState.hasMoved) {
      // Successful drop
      hapticFeedback(20);
      if (onDragEnd) {
        onDragEnd(dragState.item, dropZone.id, dragState.source);
      }
    } else if (dragState.hasMoved) {
      // Drag ended but not on valid zone
      hapticFeedback([10, 50, 10]); // Error pattern
      if (onDragCancel) {
        onDragCancel(dragState.item, 'invalid');
      }
    }
    // If !hasMoved, it was a tap, not a drag - don't call any callbacks

    // Reset state
    setDragState({
      active: false,
      item: null,
      source: null,
      pointerId: null,
      pointerType: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      hasMoved: false,
      currentDropZone: null,
    });
  }, [dragState, hapticFeedback, onDragEnd, onDragCancel, findDropZoneAt]);

  /**
   * Handle pointer cancel - abort drag
   */
  const handlePointerCancel = useCallback((e) => {
    if (!dragState.active) return;

    // Cancel RAF if pending
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (dragState.hasMoved && onDragCancel) {
      onDragCancel(dragState.item, 'cancelled');
    }

    // Reset state
    setDragState({
      active: false,
      item: null,
      source: null,
      pointerId: null,
      pointerType: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      hasMoved: false,
      currentDropZone: null,
    });
  }, [dragState, onDragCancel]);

  /**
   * Cancel drag programmatically
   */
  const cancelDrag = useCallback(() => {
    if (dragState.active && onDragCancel) {
      onDragCancel(dragState.item, 'programmatic');
    }

    setDragState({
      active: false,
      item: null,
      source: null,
      pointerId: null,
      pointerType: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      hasMoved: false,
      currentDropZone: null,
    });
  }, [dragState, onDragCancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Global pointer move/up handlers when drag is active
  useEffect(() => {
    if (!dragState.active) return;

    const handleGlobalMove = (e) => handlePointerMove(e);
    const handleGlobalUp = (e) => handlePointerUp(e);
    const handleGlobalCancel = (e) => handlePointerCancel(e);

    document.addEventListener('pointermove', handleGlobalMove, { passive: true });
    document.addEventListener('pointerup', handleGlobalUp);
    document.addEventListener('pointercancel', handleGlobalCancel);

    return () => {
      document.removeEventListener('pointermove', handleGlobalMove);
      document.removeEventListener('pointerup', handleGlobalUp);
      document.removeEventListener('pointercancel', handleGlobalCancel);
    };
  }, [dragState.active, handlePointerMove, handlePointerUp, handlePointerCancel]);

  return {
    dragState,
    previewPosition,
    isDragging: dragState.active && dragState.hasMoved,
    isPotentialDrag: dragState.active && !dragState.hasMoved,
    currentDropZone: dragState.currentDropZone,
    handlers: {
      onPointerDown: handlePointerDown,
    },
    cancelDrag,
  };
};

export default usePointerDrag;
