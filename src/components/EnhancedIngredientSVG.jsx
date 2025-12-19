import React from 'react';
import { INGREDIENTS } from '../data/gameData';

/**
 * EnhancedIngredientSVG - Improved graphics component with kawaii-realistic style
 *
 * Features detailed SVG rendering for key ingredients with multiple states
 * Falls back to simple circles with emoji for other ingredients
 */
export const EnhancedIngredientSVG = ({ type, state, size = 50 }) => {
  const ingredient = INGREDIENTS[type];
  if (!ingredient) {
    return null;
  }

  const renderIngredient = () => {
    switch (type) {
      // Enhanced salmon with realistic details
      case 'salmon':
        if (state === 'raw') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <defs>
                <linearGradient id="salmonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff8a80', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#ff6e6e', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ff5252', stopOpacity: 1 }} />
                </linearGradient>
                <filter id="salmonTexture">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
                  <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.05 0" />
                </filter>
              </defs>
              <rect
                x="10"
                y="15"
                width="30"
                height="20"
                rx="3"
                fill="url(#salmonGradient)"
                filter="url(#salmonTexture)"
              />
              <path
                d="M15 20 Q20 18 25 20 T35 20"
                stroke="#ff9999"
                strokeWidth="0.5"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M15 25 Q20 23 25 25 T35 25"
                stroke="#ff9999"
                strokeWidth="0.5"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M15 30 Q20 28 25 30 T35 30"
                stroke="#ff9999"
                strokeWidth="0.5"
                fill="none"
                opacity="0.6"
              />
              <ellipse cx="18" cy="22" rx="1" ry="0.5" fill="white" opacity="0.7" />
            </svg>
          );
        } else if (state === 'sliced') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <ellipse cx="25" cy="25" rx="12" ry="8" fill="#ff8a80" />
              <ellipse cx="25" cy="25" rx="10" ry="6" fill="#ff6e6e" />
              <ellipse cx="25" cy="25" rx="8" ry="4" fill="#ff5252" />
              <circle cx="22" cy="23" r="1" fill="white" opacity="0.8" />
            </svg>
          );
        } else if (state === 'cooked') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <rect x="10" y="15" width="30" height="20" rx="3" fill="#ffb6b3" />
              <path d="M12 20 L38 20" stroke="#ffc7c5" strokeWidth="1" />
              <path d="M12 25 L38 25" stroke="#ffc7c5" strokeWidth="1" />
              <path d="M12 30 L38 30" stroke="#ffc7c5" strokeWidth="1" />
            </svg>
          );
        }
        break;

      // Enhanced chicken with realistic texture
      case 'chicken':
        if (state === 'raw') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <defs>
                <radialGradient id="chickenRaw">
                  <stop offset="0%" style={{ stopColor: '#ffd4d4', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ffb3b3', stopOpacity: 1 }} />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="25" rx="15" ry="12" fill="url(#chickenRaw)" />
              <path d="M15 20 Q25 22 35 20" stroke="#ffcccc" strokeWidth="1" fill="none" />
              <path d="M15 30 Q25 28 35 30" stroke="#ffcccc" strokeWidth="1" fill="none" />
              <circle cx="20" cy="23" r="0.8" fill="white" opacity="0.6" />
            </svg>
          );
        } else if (state === 'diced') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <rect x="15" y="15" width="8" height="8" rx="1" fill="#ffb3b3" />
              <rect x="27" y="15" width="8" height="8" rx="1" fill="#ffcccc" />
              <rect x="15" y="27" width="8" height="8" rx="1" fill="#ffd4d4" />
              <rect x="27" y="27" width="8" height="8" rx="1" fill="#ffb3b3" />
            </svg>
          );
        } else if (state === 'cooked') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <defs>
                <radialGradient id="chickenCooked">
                  <stop offset="0%" style={{ stopColor: '#f5deb3', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#daa520', stopOpacity: 1 }} />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="25" rx="15" ry="12" fill="url(#chickenCooked)" />
              <path d="M12 22 Q25 20 38 22" stroke="#cd9a3f" strokeWidth="0.8" fill="none" />
              <path d="M12 28 Q25 30 38 28" stroke="#cd9a3f" strokeWidth="0.8" fill="none" />
              <ellipse cx="20" cy="22" rx="1.5" ry="1" fill="#fff" opacity="0.4" />
            </svg>
          );
        }
        break;

      // Enhanced carrot with kawaii details
      case 'carrot':
        if (state === 'whole') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <defs>
                <linearGradient id="carrotGradient" x1="30%" y1="0%" x2="70%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff9933', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ff6600', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Greens */}
              <path d="M20 12 Q18 8 20 5" stroke="#4CAF50" strokeWidth="2" fill="none" />
              <path d="M25 10 Q25 6 27 4" stroke="#66BB6A" strokeWidth="2" fill="none" />
              <path d="M30 12 Q32 8 30 5" stroke="#4CAF50" strokeWidth="2" fill="none" />
              {/* Carrot body */}
              <path d="M20 15 Q25 15 30 15 L28 40 Q25 42 22 40 Z" fill="url(#carrotGradient)" />
              {/* Texture lines */}
              <path d="M22 20 Q23 20 24 20" stroke="#ff8800" strokeWidth="0.5" opacity="0.6" />
              <path d="M23 25 Q24 25 25 25" stroke="#ff8800" strokeWidth="0.5" opacity="0.6" />
              <path d="M24 30 Q25 30 26 30" stroke="#ff8800" strokeWidth="0.5" opacity="0.6" />
              {/* Kawaii face */}
              <circle cx="23" cy="22" r="1.5" fill="#000" opacity="0.8" />
              <circle cx="27" cy="22" r="1.5" fill="#000" opacity="0.8" />
              <path
                d="M23 27 Q25 28 27 27"
                stroke="#000"
                strokeWidth="0.8"
                fill="none"
                opacity="0.6"
              />
            </svg>
          );
        } else if (state === 'sliced') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="12" fill="#ff9933" />
              <circle cx="25" cy="25" r="9" fill="#ffaa55" />
              <circle cx="25" cy="25" r="3" fill="#ff8800" />
              <path d="M25 16 L25 34" stroke="#ff7700" strokeWidth="0.5" />
              <path d="M16 25 L34 25" stroke="#ff7700" strokeWidth="0.5" />
            </svg>
          );
        } else if (state === 'diced') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <rect x="16" y="16" width="6" height="6" rx="1" fill="#ff9933" />
              <rect x="28" y="16" width="6" height="6" rx="1" fill="#ffaa55" />
              <rect x="16" y="28" width="6" height="6" rx="1" fill="#ff8800" />
              <rect x="28" y="28" width="6" height="6" rx="1" fill="#ff9933" />
              <circle cx="25" cy="25" r="2" fill="#ffaa55" />
            </svg>
          );
        }
        break;

      // Enhanced egg with yolk detail
      case 'egg':
        if (state === 'raw') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <defs>
                <radialGradient id="eggShell">
                  <stop offset="0%" style={{ stopColor: '#fff8e1', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ffe0b2', stopOpacity: 1 }} />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="27" rx="13" ry="16" fill="url(#eggShell)" />
              <ellipse cx="23" cy="24" rx="2" ry="1.5" fill="#fff" opacity="0.7" />
            </svg>
          );
        } else if (state === 'beaten') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="14" fill="#ffeb3b" opacity="0.7" />
              <circle cx="20" cy="20" r="3" fill="#ffd54f" />
              <circle cx="30" cy="23" r="2.5" fill="#ffecb3" />
              <circle cx="23" cy="30" r="2" fill="#fff9c4" />
            </svg>
          );
        } else if (state === 'cooked') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <ellipse cx="25" cy="27" rx="14" ry="10" fill="#fff" />
              <circle cx="25" cy="25" r="6" fill="#ffeb3b" />
              <circle cx="25" cy="25" r="4" fill="#ffc107" />
              <ellipse cx="23" cy="23" rx="1.5" ry="1" fill="#fff" opacity="0.6" />
            </svg>
          );
        }
        break;

      // Enhanced rice with multiple states
      case 'rice':
        if (state === 'dry') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              {Array.from({ length: 25 }).map((_, i) => (
                <ellipse
                  key={i}
                  cx={15 + (i % 5) * 5 + Math.random() * 3}
                  cy={15 + Math.floor(i / 5) * 5 + Math.random() * 3}
                  rx="1.5"
                  ry="0.8"
                  fill="#fff8e1"
                  transform={`rotate(${Math.random() * 360} ${15 + (i % 5) * 5} ${15 + Math.floor(i / 5) * 5})`}
                />
              ))}
            </svg>
          );
        } else if (state === 'cooked' || state === 'seasoned') {
          return (
            <svg width={size} height={size} viewBox="0 0 50 50">
              <ellipse cx="25" cy="28" rx="16" ry="13" fill="#fff" />
              <ellipse cx="25" cy="24" rx="14" ry="10" fill="#f5f5f5" />
              <ellipse cx="25" cy="20" rx="11" ry="7" fill="#fff" />
              {state === 'seasoned' && (
                <>
                  <circle cx="20" cy="22" r="0.5" fill="#000" opacity="0.3" />
                  <circle cx="28" cy="24" r="0.5" fill="#000" opacity="0.3" />
                  <circle cx="24" cy="26" r="0.5" fill="#4CAF50" opacity="0.5" />
                </>
              )}
            </svg>
          );
        }
        break;

      // Default fallback for all other ingredients
      default:
        const category = ingredient.category;
        const colors = {
          seafood: '#4DD0E1',
          meat: '#EF5350',
          vegetable: '#66BB6A',
          starch: '#FFF59D',
          dairy: '#FFE082',
          sauce: '#8D6E63',
          spice: '#FF7043',
          wrapper: '#FFECB3',
          protein: '#AED581',
        };

        const categoryColor = colors[category] || '#BDBDBD';

        return (
          <svg width={size} height={size} viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="18" fill={categoryColor} opacity="0.9" />
            <circle cx="25" cy="25" r="15" fill={categoryColor} opacity="0.7" />
            <text x="25" y="32" textAnchor="middle" fontSize="20" fill="#000" opacity="0.6">
              {ingredient.name.charAt(0)}
            </text>
          </svg>
        );
    }

    // Fallback if no state matches
    return (
      <svg width={size} height={size} viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="#e0e0e0" />
        <text x="25" y="32" textAnchor="middle" fontSize="16">
          ?
        </text>
      </svg>
    );
  };

  return (
    <div style={{ display: 'inline-block', width: size, height: size }}>{renderIngredient()}</div>
  );
};

export default EnhancedIngredientSVG;
