import React from 'react';
import { createPortal } from 'react-dom';

/**
 * EnhancedDragPreview Component
 *
 * Floating preview of dragged item, rendered in a portal for smooth performance.
 * Adapts appearance based on input type (larger for touch, smaller for mouse).
 *
 * Features:
 * - Portal rendering for z-index isolation
 * - GPU-accelerated positioning
 * - Input-type-aware sizing
 * - Drop shadow for "lifted" appearance
 * - Rotation for visual interest
 */

export const EnhancedDragPreview = ({
  visible = false,
  position = { x: 0, y: 0 },
  inputMode = 'mouse', // 'mouse' | 'touch' | 'pen'
  children,
  size = 60, // Base size in pixels
}) => {
  if (!visible) return null;

  // Adjust size and offset based on input mode
  const isTouch = inputMode === 'touch';
  const adjustedSize = isTouch ? size * 1.3 : size * 1.1;
  const offsetY = isTouch ? -adjustedSize * 0.8 : -adjustedSize * 0.5;

  const previewStyle = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    transform: `translate(-50%, ${offsetY}px) rotate(${isTouch ? 5 : 3}deg)`,
    width: adjustedSize,
    height: adjustedSize,
    pointerEvents: 'none',
    zIndex: 9999,
    willChange: 'transform, left, top',
    filter: `drop-shadow(0 ${isTouch ? 12 : 8}px ${isTouch ? 20 : 12}px rgba(0, 0, 0, ${isTouch ? 0.35 : 0.25}))`,
    transition: 'width 0.1s ease, height 0.1s ease',
  };

  return createPortal(
    <div style={previewStyle}>
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>,
    document.body
  );
};

/**
 * DragPreviewContent Component
 *
 * Wrapper for drag preview content with consistent styling
 */
export const DragPreviewContent = ({
  type = 'ingredient', // 'ingredient' | 'mixed' | 'roll' | 'dish'
  children,
  className = '',
}) => {
  const typeStyles = {
    ingredient: 'bg-white/90 rounded-xl p-2',
    mixed: 'bg-amber-50/90 rounded-full p-2',
    roll: 'bg-transparent',
    dish: 'bg-transparent',
  };

  return (
    <div className={`${typeStyles[type]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * CancelZone Component
 *
 * Visual indicator for drag cancel area
 */
export const CancelZone = ({
  visible = false,
  message = '🚫 Drop here to cancel',
}) => {
  if (!visible) return null;

  return createPortal(
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998]"
      style={{
        animation: 'cancel-zone-appear 0.2s ease-out',
      }}
    >
      <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-2xl">
        <span className="text-sm font-semibold">{message}</span>
      </div>
      <style>{`
        @keyframes cancel-zone-appear {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

/**
 * DropTargetOverlay Component
 *
 * Shows which drop zone the item will land on
 */
export const DropTargetOverlay = ({
  dropZone = null, // { id, element } or null
  isValid = false,
}) => {
  if (!dropZone || !dropZone.element) return null;

  const rect = dropZone.element.getBoundingClientRect();

  return createPortal(
    <div
      className={`fixed pointer-events-none z-[9997] rounded-xl transition-all duration-150 ${
        isValid
          ? 'ring-4 ring-green-400 bg-green-400/20'
          : 'ring-2 ring-gray-400 bg-gray-400/10'
      }`}
      style={{
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    />,
    document.body
  );
};

export default EnhancedDragPreview;
