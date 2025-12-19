import React from 'react';

/**
 * SelectionIndicator Component
 *
 * Visual overlay showing that an item is selected in tap-to-select mode.
 * Displays a pulsing border/glow effect around the selected item.
 */

export const SelectionIndicator = ({
  visible = false,
  size = 'normal', // 'small' | 'normal' | 'large'
  color = 'amber', // 'amber' | 'green' | 'blue'
  className = '',
  children,
}) => {
  if (!visible) return children || null;

  const sizeStyles = {
    small: 'inset-[-2px] rounded-lg border-2',
    normal: 'inset-[-4px] rounded-xl border-3',
    large: 'inset-[-6px] rounded-2xl border-4',
  };

  const colorStyles = {
    amber: {
      border: 'border-amber-400',
      shadow: '0 0 12px rgba(245, 158, 11, 0.5)',
      glow: 'rgba(245, 158, 11, 0.3)',
    },
    green: {
      border: 'border-green-400',
      shadow: '0 0 12px rgba(34, 197, 94, 0.5)',
      glow: 'rgba(34, 197, 94, 0.3)',
    },
    blue: {
      border: 'border-blue-400',
      shadow: '0 0 12px rgba(59, 130, 246, 0.5)',
      glow: 'rgba(59, 130, 246, 0.3)',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.normal;
  const currentColor = colorStyles[color] || colorStyles.amber;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className={`absolute ${currentSize} ${currentColor.border} pointer-events-none`}
        style={{
          boxShadow: currentColor.shadow,
          animation: 'selection-pulse 1.5s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes selection-pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: ${currentColor.shadow};
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 20px ${currentColor.glow};
          }
        }
      `}</style>
    </div>
  );
};

/**
 * SelectionBadge Component
 *
 * Small badge showing item is selected, positioned at corner
 */
export const SelectionBadge = ({
  visible = false,
  position = 'top-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}) => {
  if (!visible) return null;

  const positionStyles = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  return (
    <div
      className={`absolute ${positionStyles[position]} w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg z-10`}
      style={{
        animation: 'badge-bounce 1s ease-in-out infinite',
      }}
    >
      <span className="text-white text-xs font-bold">✓</span>
      <style>{`
        @keyframes badge-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

/**
 * TapHint Component
 *
 * Floating hint message showing user what to do next
 */
export const TapHint = ({
  visible = false,
  message = 'Tap a station to place item',
  position = 'center', // 'center' | 'top' | 'bottom'
}) => {
  if (!visible) return null;

  const positionStyles = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-20 left-1/2 -translate-x-1/2',
    bottom: 'bottom-24 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`fixed ${positionStyles[position]} z-50 pointer-events-none`}
      style={{
        animation: 'hint-fade-in 0.3s ease-out',
      }}
    >
      <div className="bg-black/85 text-white px-6 py-3 rounded-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👆</span>
          <span className="text-base font-medium">{message}</span>
        </div>
      </div>
      <style>{`
        @keyframes hint-fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * DropZoneHighlight Component
 *
 * Visual indicator for valid drop zones when item is selected
 */
export const DropZoneHighlight = ({
  active = false,
  isOver = false,
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {active && (
        <div
          className={`absolute inset-0 pointer-events-none rounded-lg transition-all duration-200 ${
            isOver
              ? 'bg-green-500/20 ring-4 ring-green-400'
              : 'bg-green-500/5 ring-2 ring-green-400/50 ring-dashed'
          }`}
          style={{
            animation: isOver ? 'drop-ready 0.8s ease-in-out infinite' : 'none',
          }}
        />
      )}
      <style>{`
        @keyframes drop-ready {
          0%, 100% { background-color: rgba(34, 197, 94, 0.2); }
          50% { background-color: rgba(34, 197, 94, 0.35); }
        }
      `}</style>
    </div>
  );
};

export default SelectionIndicator;
