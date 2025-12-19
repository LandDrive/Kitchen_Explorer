import React, { useState, useRef, useCallback, useEffect } from 'react';
import { INGREDIENTS, INGREDIENT_CATEGORIES, RECIPES } from './data/gameData';
import { useProgression } from './systems/useProgression';
import { useCustomerOrders } from './systems/useCustomerOrders';
import { useDisasters } from './systems/useDisasters';
import { EnhancedIngredientSVG } from './components/EnhancedIngredientSVG';

// Touch support imports
import { useInputMode, isTouchMode } from './hooks/useInputMode.jsx';
import { useTapToSelect } from './hooks/useTapToSelect';
import { SelectionIndicator, TapHint, DropZoneHighlight } from './components/touch/SelectionIndicator';
import { EnhancedDragPreview, CancelZone } from './components/touch/DragPreview';
import './styles/touch.css';

// Ultra-realistic SVG ingredient renderer
const IngredientSVG = ({ type, state, size = 50 }) => {
  const ingredient = INGREDIENTS[type];
  if (!ingredient) {
    return null;
  }

  const renderIngredient = () => {
    switch (type) {
      case 'salmon':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="salmonSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB5A7" />
                  <stop offset="30%" stopColor="#FA8072" />
                  <stop offset="70%" stopColor="#F07060" />
                  <stop offset="100%" stopColor="#E76F51" />
                </linearGradient>
                <filter id="salmonTexture" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.04"
                    numOctaves="3"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="1.5"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 2}, ${i * 11})`}>
                  <ellipse
                    cx="24"
                    cy="12"
                    rx="15"
                    ry="5.5"
                    fill="url(#salmonSliceGrad)"
                    stroke="#CD5C5C"
                    strokeWidth="0.4"
                    filter="url(#salmonTexture)"
                  />
                  {/* Fat marbling lines */}
                  <path
                    d={`M10,${10} Q17,${8} 24,${10} T38,${10}`}
                    stroke="#FFE4E0"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.85"
                  />
                  <path
                    d={`M12,${12} Q20,${10} 28,${12} T36,${11}`}
                    stroke="#FFD8D0"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.65"
                  />
                  <path
                    d={`M14,${14} Q22,${13} 30,${14}`}
                    stroke="#FFE8E4"
                    strokeWidth="0.8"
                    fill="none"
                    opacity="0.45"
                  />
                  {/* Highlight */}
                  <ellipse cx="30" cy="9" rx="3" ry="1.5" fill="#FFE8E4" opacity="0.5" />
                  {/* Subtle shadow */}
                  <ellipse cx="24" cy="16" rx="12" ry="2" fill="#C05040" opacity="0.15" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="salmonCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8A090" />
                  <stop offset="40%" stopColor="#D07060" />
                  <stop offset="100%" stopColor="#A04030" />
                </linearGradient>
                <filter id="cookedFilter">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.08"
                    numOctaves="4"
                    result="noise"
                  />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                </filter>
              </defs>
              <ellipse cx="25" cy="28" rx="18" ry="4" fill="rgba(0,0,0,0.15)" />
              <ellipse
                cx="25"
                cy="25"
                rx="19"
                ry="12"
                fill="url(#salmonCookedGrad)"
                stroke="#8B4513"
                strokeWidth="0.8"
              />
              {/* Cooked flaky texture */}
              <path
                d="M8,22 Q16,18 25,22 T42,20"
                stroke="#C8907A"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M10,26 Q18,23 26,26 T40,24"
                stroke="#B8806A"
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
              />
              <path
                d="M12,29 Q20,27 28,29"
                stroke="#A87060"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
              {/* Grill marks */}
              <path
                d="M12,20 L18,28"
                stroke="#704030"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
              />
              <path
                d="M22,18 L28,30"
                stroke="#704030"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
              />
              <path
                d="M32,20 L38,28"
                stroke="#704030"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
              />
              {/* Highlight from oil */}
              <ellipse cx="18" cy="22" rx="4" ry="2" fill="#E8B0A0" opacity="0.4" />
            </g>
          );
        }
        // Raw salmon
        return (
          <g>
            <defs>
              <linearGradient id="salmonRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB5A7" />
                <stop offset="25%" stopColor="#FA8072" />
                <stop offset="50%" stopColor="#F57060" />
                <stop offset="75%" stopColor="#F07060" />
                <stop offset="100%" stopColor="#E76F51" />
              </linearGradient>
              <filter id="rawSalmonFilter">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.02"
                  numOctaves="3"
                  result="noise"
                />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
              </filter>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="18" ry="5" fill="rgba(0,0,0,0.12)" />
            {/* Main fillet */}
            <ellipse
              cx="25"
              cy="25"
              rx="20"
              ry="14"
              fill="url(#salmonRawGrad)"
              stroke="#E76F51"
              strokeWidth="0.8"
            />
            {/* Fat marbling - multiple layers */}
            <path
              d="M6,20 Q15,12 25,18 T44,16"
              stroke="#FFE4E0"
              strokeWidth="3"
              fill="none"
              opacity="0.75"
            />
            <path
              d="M8,24 Q18,18 28,24 T42,22"
              stroke="#FFD8D0"
              strokeWidth="2.2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M10,28 Q20,24 30,28 T40,26"
              stroke="#FFE0D8"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M14,32 Q24,30 34,32"
              stroke="#FFD4CC"
              strokeWidth="1"
              fill="none"
              opacity="0.35"
            />
            {/* Shiny wet highlights */}
            <ellipse cx="34" cy="18" rx="5" ry="3" fill="#FFE8E4" opacity="0.55" />
            <ellipse cx="16" cy="28" rx="3" ry="2" fill="#FFE0DC" opacity="0.4" />
            <ellipse cx="28" cy="22" rx="2" ry="1" fill="#FFF" opacity="0.3" />
            {/* Skin edge hint */}
            <path
              d="M6,26 Q10,38 20,38 Q30,38 44,28"
              stroke="#A05040"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          </g>
        );

      case 'chicken':
        if (state === 'diced') {
          return (
            <g>
              <defs>
                <linearGradient id="chickenDiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF5EB" />
                  <stop offset="50%" stopColor="#FFE8D6" />
                  <stop offset="100%" stopColor="#DDBEA9" />
                </linearGradient>
              </defs>
              {[
                [10, 10],
                [22, 8],
                [34, 12],
                [8, 24],
                [20, 22],
                [32, 26],
                [14, 36],
                [26, 34],
              ].map(([x, y], i) => (
                <g key={i}>
                  {/* Shadow */}
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width="10"
                    height="10"
                    rx="1.5"
                    fill="rgba(0,0,0,0.1)"
                  />
                  {/* Cube */}
                  <rect
                    x={x}
                    y={y}
                    width="10"
                    height="10"
                    rx="1.5"
                    fill="url(#chickenDiceGrad)"
                    stroke="#C9A889"
                    strokeWidth="0.4"
                  />
                  {/* Muscle fiber texture */}
                  <path
                    d={`M${x + 2},${y + 2} L${x + 8},${y + 2}`}
                    stroke="#E8D4C4"
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                  <path
                    d={`M${x + 2},${y + 5} L${x + 8},${y + 5}`}
                    stroke="#E8D4C4"
                    strokeWidth="0.4"
                    opacity="0.5"
                  />
                  <path
                    d={`M${x + 2},${y + 8} L${x + 8},${y + 8}`}
                    stroke="#E8D4C4"
                    strokeWidth="0.3"
                    opacity="0.4"
                  />
                  {/* Highlight */}
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width="4"
                    height="3"
                    rx="1"
                    fill="#FFF8F4"
                    opacity="0.6"
                  />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="chickenCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E6C9A8" />
                  <stop offset="30%" stopColor="#D4A574" />
                  <stop offset="70%" stopColor="#C49464" />
                  <stop offset="100%" stopColor="#A07850" />
                </linearGradient>
                <filter id="chickenCookedTexture">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" />
                  <feDisplacementMap in="SourceGraphic" scale="1.5" />
                </filter>
              </defs>
              <ellipse cx="25" cy="38" rx="16" ry="4" fill="rgba(0,0,0,0.12)" />
              <ellipse
                cx="25"
                cy="25"
                rx="18"
                ry="14"
                fill="url(#chickenCookedGrad)"
                stroke="#8B7355"
                strokeWidth="0.8"
              />
              {/* Golden brown spots */}
              <ellipse cx="16" cy="20" rx="6" ry="5" fill="#B8895C" opacity="0.5" />
              <ellipse cx="34" cy="28" rx="7" ry="5" fill="#A87850" opacity="0.45" />
              <ellipse cx="22" cy="30" rx="5" ry="4" fill="#9A7040" opacity="0.35" />
              {/* Crispy bits */}
              <path
                d="M10,18 Q16,12 26,16"
                stroke="#907040"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M30,20 Q38,24 36,32"
                stroke="#806838"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
              {/* Oily highlight */}
              <ellipse cx="20" cy="22" rx="4" ry="2.5" fill="#D4B898" opacity="0.5" />
              <ellipse cx="30" cy="26" rx="3" ry="2" fill="#C4A888" opacity="0.4" />
            </g>
          );
        }
        // Raw chicken
        return (
          <g>
            <defs>
              <linearGradient id="chickenRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8F4" />
                <stop offset="30%" stopColor="#FFE8DC" />
                <stop offset="70%" stopColor="#FFDAB9" />
                <stop offset="100%" stopColor="#ECC9A8" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="38" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
            <ellipse
              cx="25"
              cy="25"
              rx="18"
              ry="14"
              fill="url(#chickenRawGrad)"
              stroke="#DEB887"
              strokeWidth="0.8"
            />
            {/* Muscle texture */}
            <ellipse cx="17" cy="20" rx="7" ry="6" fill="#FFF5EB" opacity="0.5" />
            <ellipse cx="34" cy="28" rx="8" ry="6" fill="#FFF0E5" opacity="0.45" />
            <path
              d="M10,18 Q18,12 28,16"
              stroke="#F0D8C8"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M12,26 Q22,22 32,26"
              stroke="#E8D0C0"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            {/* Fat spots */}
            <ellipse cx="14" cy="30" rx="3" ry="2.5" fill="#FFF8F0" opacity="0.5" />
            <ellipse cx="36" cy="22" rx="2.5" ry="2" fill="#FFFAF5" opacity="0.4" />
            {/* Wet highlight */}
            <ellipse cx="22" cy="18" rx="5" ry="3" fill="#FFF" opacity="0.35" />
          </g>
        );

      case 'shrimp':
        if (state === 'peeled') {
          return (
            <g>
              <defs>
                <linearGradient id="shrimpPeeledGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE8E8" />
                  <stop offset="50%" stopColor="#FFD0D0" />
                  <stop offset="100%" stopColor="#FFB8C0" />
                </linearGradient>
              </defs>
              <ellipse cx="22" cy="42" rx="10" ry="3" fill="rgba(0,0,0,0.08)" />
              <path
                d="M15,38 Q8,28 14,16 Q22,8 30,12 Q38,18 36,28 Q32,40 24,40 Z"
                fill="url(#shrimpPeeledGrad)"
                stroke="#FF9AAB"
                strokeWidth="0.8"
              />
              {/* Segment lines */}
              <path
                d="M16,34 Q14,30 16,26"
                stroke="#FFC0C8"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M18,30 Q16,26 18,22"
                stroke="#FFB8C0"
                strokeWidth="1.2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M20,26 Q18,22 20,18"
                stroke="#FFC0C8"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
              {/* Vein line */}
              <path
                d="M18,36 Q16,28 20,18 Q24,12 28,14"
                stroke="#E89098"
                strokeWidth="0.8"
                fill="none"
                opacity="0.4"
                strokeDasharray="2,1"
              />
              {/* Highlight */}
              <path
                d="M20,20 Q24,16 28,18"
                stroke="#FFF"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              {/* Eye */}
              <circle cx="30" cy="13" r="2.5" fill="#1A1A1A" />
              <circle cx="31" cy="12" r="1" fill="#444" />
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="shrimpCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF9080" />
                  <stop offset="50%" stopColor="#FF6B5B" />
                  <stop offset="100%" stopColor="#E84A3A" />
                </linearGradient>
              </defs>
              <ellipse cx="24" cy="42" rx="12" ry="3" fill="rgba(0,0,0,0.1)" />
              <path
                d="M14,38 Q4,26 14,10 Q24,2 36,10 Q44,22 36,34 Q28,46 18,42 Z"
                fill="url(#shrimpCookedGrad)"
                stroke="#C83020"
                strokeWidth="0.8"
              />
              {/* Curled tight segments */}
              <path
                d="M16,36 Q12,30 16,24"
                stroke="#FFA090"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M20,32 Q16,26 20,20"
                stroke="#FF9080"
                strokeWidth="1.5"
                fill="none"
                opacity="0.45"
              />
              <path
                d="M24,28 Q20,22 24,16"
                stroke="#FFA090"
                strokeWidth="1.2"
                fill="none"
                opacity="0.4"
              />
              {/* Bright orange highlights */}
              <ellipse cx="28" cy="18" rx="4" ry="3" fill="#FFA080" opacity="0.5" />
              <ellipse cx="20" cy="28" rx="3" ry="2" fill="#FF9070" opacity="0.4" />
              {/* Eye */}
              <circle cx="34" cy="12" r="2.5" fill="#1A1A1A" />
              <circle cx="35" cy="11" r="1" fill="#444" />
            </g>
          );
        }
        // Raw shrimp with shell
        return (
          <g>
            <defs>
              <linearGradient id="shrimpShellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8E0E0" />
                <stop offset="30%" stopColor="#D8D0D0" />
                <stop offset="70%" stopColor="#C8BFC0" />
                <stop offset="100%" stopColor="#B8B0B0" />
              </linearGradient>
            </defs>
            <ellipse cx="22" cy="44" rx="12" ry="3" fill="rgba(0,0,0,0.08)" />
            <path
              d="M10,40 Q2,28 10,14 Q20,4 34,10 Q44,18 42,32 Q36,46 24,44 Z"
              fill="url(#shrimpShellGrad)"
              stroke="#A09898"
              strokeWidth="0.8"
            />
            {/* Shell segments */}
            <path
              d="M12,38 Q8,32 12,26"
              stroke="#C8C0C0"
              strokeWidth="2.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M16,34 Q12,28 16,22"
              stroke="#D0C8C8"
              strokeWidth="2"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M20,30 Q16,24 20,18"
              stroke="#C8C0C0"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M24,26 Q20,20 24,14"
              stroke="#D0C8C8"
              strokeWidth="1.2"
              fill="none"
              opacity="0.45"
            />
            {/* Shell texture dots */}
            {[
              [14, 32],
              [18, 26],
              [22, 20],
              [26, 16],
              [30, 14],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1" fill="#B8B0A8" opacity="0.3" />
            ))}
            {/* Pink undertone showing through */}
            <ellipse cx="20" cy="28" rx="8" ry="10" fill="#FFD8D8" opacity="0.2" />
            {/* Eye */}
            <circle cx="36" cy="12" r="2.5" fill="#1A1A1A" />
            <circle cx="37" cy="11" r="1" fill="#444" />
            {/* Antennae */}
            <path
              d="M40,10 Q46,6 48,2"
              stroke="#C0B8B8"
              strokeWidth="1"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M40,12 Q48,10 50,8"
              stroke="#C0B8B8"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
            />
            {/* Legs hint */}
            <path
              d="M16,40 L14,44 M20,42 L19,46 M24,42 L24,46"
              stroke="#B0A8A8"
              strokeWidth="0.8"
              opacity="0.5"
            />
          </g>
        );

      case 'rice':
        if (state === 'cooked' || state === 'seasoned') {
          const tint = state === 'seasoned' ? '#FFF8DC' : '#FFFEFA';
          return (
            <g>
              <defs>
                <radialGradient id="riceCookedGrad" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor={tint} />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="38" rx="16" ry="4" fill="rgba(0,0,0,0.08)" />
              <ellipse
                cx="25"
                cy="28"
                rx="18"
                ry="14"
                fill="url(#riceCookedGrad)"
                stroke="#E8E4D9"
                strokeWidth="0.8"
              />
              {/* Individual rice grains */}
              {[
                [14, 20],
                [22, 18],
                [30, 20],
                [18, 26],
                [26, 24],
                [34, 26],
                [12, 30],
                [20, 32],
                [28, 30],
                [36, 28],
                [16, 36],
                [24, 38],
                [32, 36],
              ].map(([x, y], i) => (
                <g key={i}>
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="3.5"
                    ry="1.8"
                    fill="#FFFEF8"
                    stroke="#EEE"
                    strokeWidth="0.2"
                    transform={`rotate(${-15 + (i % 5) * 8}, ${x}, ${y})`}
                  />
                  <ellipse
                    cx={x - 0.5}
                    cy={y - 0.5}
                    rx="1.5"
                    ry="0.8"
                    fill="#FFF"
                    opacity="0.6"
                    transform={`rotate(${-15 + (i % 5) * 8}, ${x}, ${y})`}
                  />
                </g>
              ))}
              {state === 'seasoned' && (
                <>
                  <ellipse cx="25" cy="28" rx="16" ry="12" fill="#FFE4B5" opacity="0.2" />
                  {/* Sesame seeds */}
                  <ellipse
                    cx="18"
                    cy="24"
                    rx="1.5"
                    ry="1"
                    fill="#F5E6D3"
                    transform="rotate(20, 18, 24)"
                  />
                  <ellipse
                    cx="32"
                    cy="28"
                    rx="1.5"
                    ry="1"
                    fill="#2A2A2A"
                    transform="rotate(-15, 32, 28)"
                  />
                </>
              )}
            </g>
          );
        }
        if (state === 'washed') {
          // Washed rice - wet, glistening appearance
          return (
            <g>
              <defs>
                <radialGradient id="riceWashedGrad" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#F8F8F5" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="38" rx="14" ry="4" fill="rgba(0,0,0,0.08)" />
              <ellipse
                cx="25"
                cy="32"
                rx="15"
                ry="11"
                fill="url(#riceWashedGrad)"
                stroke="#E0E0D8"
                strokeWidth="0.8"
              />
              {/* Wet rice grains clumped together */}
              {[
                [18, 26],
                [28, 24],
                [22, 30],
                [32, 28],
                [14, 32],
                [26, 34],
              ].map(([x, y], i) => (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx="3"
                  ry="4.5"
                  fill="#FFFEF8"
                  stroke="#E8E8E0"
                  strokeWidth="0.3"
                  opacity="0.9"
                  transform={`rotate(${-10 + i * 8}, ${x}, ${y})`}
                />
              ))}
              {/* Water droplets/sheen */}
              <ellipse cx="20" cy="26" rx="4" ry="2" fill="rgba(135,206,250,0.3)" />
              <ellipse cx="30" cy="30" rx="3" ry="1.5" fill="rgba(135,206,250,0.25)" />
              <circle cx="16" cy="30" r="1.5" fill="rgba(200,230,255,0.4)" />
            </g>
          );
        }
        // Dry rice
        return (
          <g>
            <defs>
              <linearGradient id="riceDryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFEF8" />
                <stop offset="100%" stopColor="#F5F0E0" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="38" rx="14" ry="4" fill="rgba(0,0,0,0.06)" />
            <ellipse
              cx="25"
              cy="34"
              rx="14"
              ry="10"
              fill="#F0EBE0"
              stroke="#E0D8C8"
              strokeWidth="0.8"
            />
            <ellipse cx="25" cy="28" rx="12" ry="8" fill="url(#riceDryGrad)" />
            {/* Loose grains */}
            {[
              [18, 22],
              [28, 24],
              [22, 28],
              [32, 26],
              [14, 30],
              [26, 32],
            ].map(([x, y], i) => (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx="2.5"
                ry="4"
                fill="#FFFEF5"
                stroke="#E8E0D8"
                strokeWidth="0.2"
                opacity="0.85"
                transform={`rotate(${-20 + i * 12}, ${x}, ${y})`}
              />
            ))}
            {/* Scattered grains */}
            <ellipse
              cx="8"
              cy="36"
              rx="2"
              ry="3.5"
              fill="#FFFEF5"
              opacity="0.6"
              transform="rotate(45, 8, 36)"
            />
            <ellipse
              cx="42"
              cy="34"
              rx="2"
              ry="3.5"
              fill="#FFFEF5"
              opacity="0.5"
              transform="rotate(-30, 42, 34)"
            />
          </g>
        );

      case 'nori':
        return (
          <g>
            <defs>
              <linearGradient id="noriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1B4D3E" />
                <stop offset="30%" stopColor="#0D3328" />
                <stop offset="70%" stopColor="#1A4538" />
                <stop offset="100%" stopColor="#0A2A20" />
              </linearGradient>
              <filter id="noriTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="4" />
                <feDisplacementMap in="SourceGraphic" scale="1" />
              </filter>
            </defs>
            <rect
              x="5"
              y="12"
              width="40"
              height="26"
              rx="1"
              fill="url(#noriGrad)"
              stroke="#0A2A20"
              strokeWidth="0.8"
            />
            {/* Texture lines */}
            {[14, 20, 26, 32].map((y, i) => (
              <line
                key={i}
                x1="7"
                y1={y}
                x2="43"
                y2={y}
                stroke="#2D5A4A"
                strokeWidth="0.4"
                opacity="0.3"
              />
            ))}
            {[12, 22, 32].map((x, i) => (
              <line
                key={i}
                x1={x}
                y1="14"
                x2={x}
                y2="36"
                stroke="#2D6A52"
                strokeWidth="0.3"
                opacity="0.25"
              />
            ))}
            {/* Slight sheen */}
            <rect x="6" y="13" width="12" height="6" rx="0.5" fill="#3D7A62" opacity="0.2" />
            {/* Crispy edge */}
            <path
              d="M5,12 Q7,11 10,12 Q15,13 20,12 Q30,11 40,12 Q43,13 45,12"
              stroke="#2A5A4A"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
          </g>
        );

      case 'flour':
        return (
          <g>
            <defs>
              <radialGradient id="flourGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#FAFAF8" />
                <stop offset="100%" stopColor="#F0EDE8" />
              </radialGradient>
              <filter id="flourFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" />
                <feDisplacementMap in="SourceGraphic" scale="0.5" />
              </filter>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="38" rx="18" ry="5" fill="rgba(0,0,0,0.06)" />
            {/* Main pile */}
            <ellipse
              cx="25"
              cy="32"
              rx="18"
              ry="12"
              fill="url(#flourGrad)"
              stroke="#E8E0D0"
              strokeWidth="0.5"
            />
            <ellipse cx="25" cy="26" rx="15" ry="8" fill="#FFFEFA" />
            <ellipse cx="25" cy="22" rx="11" ry="5" fill="#FFF" />
            {/* Peak highlight */}
            <ellipse cx="22" cy="20" rx="5" ry="3" fill="#FFF" opacity="0.9" />
            {/* Dust particles */}
            {[
              [6, 18],
              [42, 16],
              [10, 38],
              [40, 36],
              [4, 28],
              [46, 30],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={1 + (i % 2) * 0.5}
                fill="#FFF"
                opacity={0.3 + (i % 3) * 0.1}
              />
            ))}
            {/* Scattered flour */}
            <ellipse cx="8" cy="34" rx="3" ry="1.5" fill="#FAFAF8" opacity="0.5" />
            <ellipse cx="42" cy="32" rx="2.5" ry="1.2" fill="#FAFAF8" opacity="0.4" />
          </g>
        );

      case 'avocado':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <radialGradient id="avoSliceOuter" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#6B8E23" />
                  <stop offset="100%" stopColor="#4A6A1A" />
                </radialGradient>
                <radialGradient id="avoSliceInner" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#C5E1A5" />
                  <stop offset="40%" stopColor="#9ACD32" />
                  <stop offset="80%" stopColor="#7CB342" />
                  <stop offset="100%" stopColor="#558B2F" />
                </radialGradient>
                <radialGradient id="avoPitGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#C9A66B" />
                  <stop offset="50%" stopColor="#8B6914" />
                  <stop offset="100%" stopColor="#5D4E37" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
              {/* Skin */}
              <ellipse
                cx="25"
                cy="25"
                rx="18"
                ry="14"
                fill="url(#avoSliceOuter)"
                stroke="#3D5C02"
                strokeWidth="1"
              />
              {/* Flesh */}
              <ellipse cx="25" cy="25" rx="15" ry="11" fill="url(#avoSliceInner)" />
              {/* Pit */}
              <ellipse
                cx="25"
                cy="25"
                rx="7"
                ry="5.5"
                fill="url(#avoPitGrad)"
                stroke="#4A3520"
                strokeWidth="0.5"
              />
              {/* Pit highlight */}
              <ellipse cx="22" cy="22" rx="2.5" ry="2" fill="#D4B896" opacity="0.5" />
              {/* Flesh highlight */}
              <ellipse cx="18" cy="20" rx="4" ry="2.5" fill="#D4E8A0" opacity="0.5" />
              <ellipse cx="34" cy="28" rx="3" ry="2" fill="#C8E090" opacity="0.4" />
            </g>
          );
        }
        // Whole avocado
        return (
          <g>
            <defs>
              <linearGradient id="avoWholeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4A6A1A" />
                <stop offset="30%" stopColor="#3D5C10" />
                <stop offset="70%" stopColor="#2D4A08" />
                <stop offset="100%" stopColor="#1A3500" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.1)" />
            <ellipse
              cx="25"
              cy="26"
              rx="13"
              ry="18"
              fill="url(#avoWholeGrad)"
              stroke="#1A2A00"
              strokeWidth="0.8"
            />
            {/* Texture bumps */}
            {[
              [18, 18],
              [32, 20],
              [16, 28],
              [34, 30],
              [20, 36],
              [30, 38],
            ].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="2" ry="1.5" fill="#5A7A2A" opacity="0.3" />
            ))}
            {/* Highlight */}
            <ellipse cx="20" cy="18" rx="5" ry="8" fill="#5A8A2A" opacity="0.35" />
            <ellipse cx="18" cy="14" rx="2" ry="3" fill="#6A9A3A" opacity="0.4" />
            {/* Stem */}
            <ellipse cx="25" cy="8" rx="3" ry="2" fill="#4A3A20" />
            <path d="M25,6 L25,2" stroke="#5A4A30" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'cucumber':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <radialGradient id="cucSliceGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F0FFF0" />
                  <stop offset="30%" stopColor="#E8F8E8" />
                  <stop offset="60%" stopColor="#98FB98" />
                  <stop offset="85%" stopColor="#66CC66" />
                  <stop offset="100%" stopColor="#4AA04A" />
                </radialGradient>
              </defs>
              {[12, 25, 38].map((x, i) => (
                <g key={i}>
                  <ellipse cx={x} cy="28" rx="9" ry="3" fill="rgba(0,0,0,0.08)" />
                  {/* Skin ring */}
                  <circle cx={x} cy="25" r="9" fill="#4AA04A" stroke="#3A8A3A" strokeWidth="0.5" />
                  {/* Flesh */}
                  <circle cx={x} cy="25" r="7.5" fill="url(#cucSliceGrad)" />
                  {/* Seed pattern */}
                  <circle cx={x} cy="25" r="2" fill="#A8D8A8" opacity="0.6" />
                  {[0, 60, 120, 180, 240, 300].map((angle, j) => (
                    <ellipse
                      key={j}
                      cx={x + Math.cos((angle * Math.PI) / 180) * 4.5}
                      cy={25 + Math.sin((angle * Math.PI) / 180) * 4.5}
                      rx="1.2"
                      ry="0.6"
                      fill="#C8E8C8"
                      opacity="0.7"
                      transform={`rotate(${angle + 90}, ${x + Math.cos((angle * Math.PI) / 180) * 4.5}, ${25 + Math.sin((angle * Math.PI) / 180) * 4.5})`}
                    />
                  ))}
                  {/* Wet highlight */}
                  <ellipse cx={x - 2} cy="22" rx="2" ry="1.5" fill="#FFF" opacity="0.4" />
                </g>
              ))}
            </g>
          );
        }
        // Whole cucumber
        return (
          <g>
            <defs>
              <linearGradient id="cucWholeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5AA05A" />
                <stop offset="20%" stopColor="#6AB86A" />
                <stop offset="50%" stopColor="#78C878" />
                <stop offset="80%" stopColor="#6AB86A" />
                <stop offset="100%" stopColor="#5AA05A" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="44" rx="7" ry="2" fill="rgba(0,0,0,0.08)" />
            <ellipse
              cx="25"
              cy="25"
              rx="8"
              ry="20"
              fill="url(#cucWholeGrad)"
              stroke="#4A904A"
              strokeWidth="0.8"
            />
            {/* Bumpy texture */}
            {[
              [22, 12],
              [28, 18],
              [22, 24],
              [28, 30],
              [22, 36],
            ].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="1.5" ry="2" fill="#88D888" opacity="0.4" />
            ))}
            {/* Highlight streak */}
            <ellipse cx="25" cy="25" rx="3" ry="16" fill="#98E898" opacity="0.35" />
            {/* Stem end */}
            <ellipse
              cx="25"
              cy="6"
              rx="5"
              ry="2.5"
              fill="#5AA05A"
              stroke="#4A904A"
              strokeWidth="0.5"
            />
            <path d="M24,4 L24,1 M26,4 L27,2" stroke="#3A7A3A" strokeWidth="1" />
            {/* Blossom end */}
            <ellipse cx="25" cy="45" rx="3" ry="1.5" fill="#4A904A" />
          </g>
        );

      case 'onion':
        if (state === 'diced') {
          return (
            <g>
              <defs>
                <linearGradient id="onionDiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFAF5" />
                  <stop offset="50%" stopColor="#F5EDE5" />
                  <stop offset="100%" stopColor="#E8DDD0" />
                </linearGradient>
              </defs>
              {[
                [8, 10],
                [18, 8],
                [28, 12],
                [38, 10],
                [6, 22],
                [16, 20],
                [26, 24],
                [36, 22],
                [12, 34],
                [22, 32],
                [32, 36],
              ].map(([x, y], i) => (
                <g key={i}>
                  <rect
                    x={x + 0.5}
                    y={y + 0.5}
                    width="8"
                    height="8"
                    rx="1"
                    fill="rgba(0,0,0,0.06)"
                  />
                  <rect
                    x={x}
                    y={y}
                    width="8"
                    height="8"
                    rx="1"
                    fill="url(#onionDiceGrad)"
                    stroke="#D4C8B8"
                    strokeWidth="0.3"
                  />
                  {/* Layer rings */}
                  <path
                    d={`M${x + 2},${y + 2} Q${x + 4},${y + 4} ${x + 6},${y + 2}`}
                    stroke="#E8DDD0"
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.7"
                  />
                  <path
                    d={`M${x + 2},${y + 5} Q${x + 4},${y + 6} ${x + 6},${y + 5}`}
                    stroke="#E8DDD0"
                    strokeWidth="0.4"
                    fill="none"
                    opacity="0.5"
                  />
                  {/* Translucent highlight */}
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width="3"
                    height="2"
                    rx="0.5"
                    fill="#FFF"
                    opacity="0.4"
                  />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'caramelized') {
          return (
            <g>
              <defs>
                <linearGradient id="onionCaramelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4A050" />
                  <stop offset="30%" stopColor="#C08830" />
                  <stop offset="70%" stopColor="#A07020" />
                  <stop offset="100%" stopColor="#806010" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="38" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
              <ellipse
                cx="25"
                cy="25"
                rx="18"
                ry="13"
                fill="url(#onionCaramelGrad)"
                stroke="#604810"
                strokeWidth="0.8"
              />
              {/* Caramelized strands */}
              <path
                d="M8,20 Q16,14 26,20 Q36,26 42,20"
                stroke="#D4A860"
                strokeWidth="3"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M10,26 Q20,32 30,26 Q38,20 44,26"
                stroke="#C49850"
                strokeWidth="2.5"
                fill="none"
                opacity="0.45"
              />
              <path
                d="M12,32 Q22,36 32,32"
                stroke="#B48840"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              {/* Glossy spots */}
              <ellipse cx="18" cy="22" rx="4" ry="2.5" fill="#E4B870" opacity="0.4" />
              <ellipse cx="32" cy="28" rx="3" ry="2" fill="#D4A860" opacity="0.35" />
              {/* Dark caramelized bits */}
              <ellipse cx="14" cy="28" rx="2" ry="1.5" fill="#705010" opacity="0.3" />
              <ellipse cx="36" cy="22" rx="2.5" ry="1.5" fill="#604008" opacity="0.25" />
            </g>
          );
        }
        // Whole onion
        return (
          <g>
            <defs>
              <radialGradient id="onionWholeGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFF8F0" />
                <stop offset="40%" stopColor="#F5E8D8" />
                <stop offset="70%" stopColor="#E8D4C0" />
                <stop offset="100%" stopColor="#D4C0A8" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="42" rx="14" ry="4" fill="rgba(0,0,0,0.08)" />
            <circle
              cx="25"
              cy="26"
              r="16"
              fill="url(#onionWholeGrad)"
              stroke="#C4A888"
              strokeWidth="0.8"
            />
            {/* Layer rings */}
            {[14, 11, 8, 5].map((r, i) => (
              <circle
                key={i}
                cx="25"
                cy="26"
                r={r}
                fill="none"
                stroke="#E0D0C0"
                strokeWidth="0.6"
                opacity={0.7 - i * 0.12}
              />
            ))}
            <circle cx="25" cy="26" r="3" fill="#FFF0E8" />
            {/* Papery skin texture */}
            <path
              d="M12,20 Q18,18 24,20"
              stroke="#D4C0A8"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M26,32 Q32,34 38,32"
              stroke="#C4B098"
              strokeWidth="0.5"
              fill="none"
              opacity="0.35"
            />
            {/* Root base */}
            <ellipse cx="25" cy="42" rx="4" ry="2" fill="#A08868" />
            {/* Green shoot */}
            <path d="M25,10 L25,4" stroke="#7AC07A" strokeWidth="3" strokeLinecap="round" />
            <path d="M23,6 Q25,3 27,6" stroke="#6AB06A" strokeWidth="2" fill="none" />
          </g>
        );

      case 'garlic':
        if (state === 'minced') {
          return (
            <g>
              {[
                [10, 12],
                [20, 10],
                [30, 14],
                [40, 12],
                [8, 24],
                [18, 22],
                [28, 26],
                [38, 24],
                [14, 36],
                [24, 34],
                [34, 38],
              ].map(([x, y], i) => (
                <g key={i}>
                  <ellipse cx={x + 0.5} cy={y + 0.5} rx="3.5" ry="3" fill="rgba(0,0,0,0.06)" />
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="3.5"
                    ry="3"
                    fill="#FFFCF8"
                    stroke="#E8E0D8"
                    strokeWidth="0.3"
                  />
                  {/* Garlic cell texture */}
                  <ellipse cx={x - 0.8} cy={y - 0.8} rx="1.5" ry="1.2" fill="#FFF" opacity="0.6" />
                  <path
                    d={`M${x - 1},${y + 1} L${x + 1},${y + 1}`}
                    stroke="#F0E8E0"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                </g>
              ))}
              {/* Juice drops */}
              <circle cx="15" cy="28" r="1" fill="#F8F4F0" opacity="0.4" />
              <circle cx="35" cy="20" r="0.8" fill="#F8F4F0" opacity="0.35" />
            </g>
          );
        }
        if (state === 'fried') {
          return (
            <g>
              <defs>
                <radialGradient id="friedGarlicGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#F5D860" />
                  <stop offset="50%" stopColor="#D4A840" />
                  <stop offset="100%" stopColor="#A08020" />
                </radialGradient>
              </defs>
              {[
                [12, 14],
                [22, 12],
                [32, 16],
                [10, 26],
                [20, 24],
                [30, 28],
                [40, 26],
                [16, 38],
                [26, 36],
              ].map(([x, y], i) => (
                <g key={i}>
                  <ellipse cx={x + 0.5} cy={y + 0.5} rx="4" ry="3" fill="rgba(0,0,0,0.1)" />
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="4"
                    ry="3"
                    fill="url(#friedGarlicGrad)"
                    stroke="#907010"
                    strokeWidth="0.4"
                  />
                  {/* Crispy highlight */}
                  <ellipse cx={x - 1} cy={y - 1} rx="1.5" ry="1" fill="#FFE870" opacity="0.5" />
                  {/* Crispy edge */}
                  <path
                    d={`M${x - 3},${y} Q${x},${y - 2} ${x + 3},${y}`}
                    stroke="#B08830"
                    strokeWidth="0.4"
                    fill="none"
                    opacity="0.4"
                  />
                </g>
              ))}
            </g>
          );
        }
        // Whole garlic bulb
        return (
          <g>
            <defs>
              <radialGradient id="garlicBulbGrad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#FAF8F5" />
                <stop offset="100%" stopColor="#F0EDE8" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="42" rx="12" ry="3" fill="rgba(0,0,0,0.08)" />
            {/* Bulb body */}
            <ellipse
              cx="25"
              cy="32"
              rx="14"
              ry="12"
              fill="url(#garlicBulbGrad)"
              stroke="#E0D8D0"
              strokeWidth="0.8"
            />
            {/* Top taper */}
            <path
              d="M14,24 Q25,10 36,24"
              fill="url(#garlicBulbGrad)"
              stroke="#E0D8D0"
              strokeWidth="0.8"
            />
            {/* Clove divisions */}
            <ellipse cx="18" cy="32" rx="5" ry="8" fill="none" stroke="#E8E0D8" strokeWidth="0.5" />
            <ellipse cx="32" cy="32" rx="5" ry="8" fill="none" stroke="#E8E0D8" strokeWidth="0.5" />
            <ellipse cx="25" cy="34" rx="4" ry="6" fill="none" stroke="#E8E0D8" strokeWidth="0.5" />
            {/* Papery texture */}
            <path
              d="M16,26 Q20,24 24,26"
              stroke="#E0D8D0"
              strokeWidth="0.4"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M26,28 Q30,26 34,28"
              stroke="#E0D8D0"
              strokeWidth="0.4"
              fill="none"
              opacity="0.45"
            />
            {/* Stem */}
            <ellipse cx="25" cy="12" rx="2" ry="1.5" fill="#D8D0C8" />
            <path d="M25,11 L25,5" stroke="#90B880" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24,6 Q25,4 26,6" stroke="#80A870" strokeWidth="1" fill="none" />
            {/* Root plate */}
            <ellipse cx="25" cy="44" rx="6" ry="2" fill="#C8C0B8" />
            <path
              d="M22,45 L21,48 M25,45 L25,49 M28,45 L29,48"
              stroke="#A8A098"
              strokeWidth="0.8"
            />
          </g>
        );

      case 'ginger':
        if (state === 'minced') {
          return (
            <g>
              {[
                [8, 12],
                [18, 10],
                [28, 14],
                [12, 24],
                [22, 22],
                [32, 26],
                [16, 36],
                [26, 34],
                [36, 32],
              ].map(([x, y], i) => (
                <g key={i}>
                  <rect
                    x={x + 0.5}
                    y={y + 0.5}
                    width="7"
                    height="6"
                    rx="1"
                    fill="rgba(0,0,0,0.08)"
                  />
                  <rect
                    x={x}
                    y={y}
                    width="7"
                    height="6"
                    rx="1"
                    fill="#E8CFA0"
                    stroke="#C4A878"
                    strokeWidth="0.4"
                  />
                  {/* Fibrous texture */}
                  <line
                    x1={x + 1}
                    y1={y + 1}
                    x2={x + 1}
                    y2={y + 5}
                    stroke="#D4BF90"
                    strokeWidth="0.3"
                    opacity="0.6"
                  />
                  <line
                    x1={x + 3.5}
                    y1={y + 1}
                    x2={x + 3.5}
                    y2={y + 5}
                    stroke="#D4BF90"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                  <line
                    x1={x + 6}
                    y1={y + 1}
                    x2={x + 6}
                    y2={y + 5}
                    stroke="#D4BF90"
                    strokeWidth="0.3"
                    opacity="0.4"
                  />
                  {/* Wet highlight */}
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width="2.5"
                    height="2"
                    rx="0.5"
                    fill="#F8E8C0"
                    opacity="0.5"
                  />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'peeled') {
          // Peeled ginger - lighter interior visible
          return (
            <g>
              <defs>
                <linearGradient id="peeledGingerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5E6C8" />
                  <stop offset="50%" stopColor="#E8D4A8" />
                  <stop offset="100%" stopColor="#DCC890" />
                </linearGradient>
                <linearGradient id="peeledGingerHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8E8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FFF8E8" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Shadow */}
              <ellipse cx="26" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.12)" />
              {/* Main ginger body - peeled, lighter color */}
              <path
                d="M10 25 Q8 18 15 14 Q22 10 28 14 Q34 10 40 16 Q44 22 40 28 Q42 34 36 38 Q30 42 24 40 Q18 42 12 36 Q8 32 10 25Z"
                fill="url(#peeledGingerGrad)"
                stroke="#C9B87A"
                strokeWidth="0.8"
              />
              {/* Fibrous interior texture */}
              <path
                d="M14 22 Q16 26 14 32"
                stroke="#D4C498"
                strokeWidth="0.5"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M20 18 Q22 25 20 32"
                stroke="#D4C498"
                strokeWidth="0.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M28 16 Q30 24 28 34"
                stroke="#D4C498"
                strokeWidth="0.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M35 20 Q36 26 34 32"
                stroke="#D4C498"
                strokeWidth="0.5"
                fill="none"
                opacity="0.4"
              />
              {/* Wet/fresh highlights */}
              <ellipse cx="18" cy="20" rx="4" ry="3" fill="url(#peeledGingerHighlight)" />
              <ellipse cx="32" cy="22" rx="3" ry="2.5" fill="url(#peeledGingerHighlight)" />
              {/* Exposed node bumps */}
              <ellipse cx="24" cy="18" rx="3" ry="2" fill="#EAD9A8" opacity="0.6" />
              <ellipse cx="36" cy="26" rx="2.5" ry="2" fill="#EAD9A8" opacity="0.5" />
              {/* Juicy interior spots */}
              <circle cx="20" cy="28" r="1.5" fill="#F8EED8" opacity="0.5" />
              <circle cx="30" cy="30" r="1.2" fill="#F8EED8" opacity="0.4" />
            </g>
          );
        }
        // Whole ginger root
        return (
          <g>
            <defs>
              <linearGradient id="gingerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0D8A0" />
                <stop offset="30%" stopColor="#E0C890" />
                <stop offset="70%" stopColor="#D0B480" />
                <stop offset="100%" stopColor="#B89860" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="42" rx="14" ry="3" fill="rgba(0,0,0,0.08)" />
            {/* Main root body - irregular shape */}
            <path
              d="M12,34 Q6,28 10,20 Q14,12 24,14 Q34,12 38,18 Q44,26 40,34 Q36,42 26,40 Q16,42 12,34 Z"
              fill="url(#gingerGrad)"
              stroke="#A08050"
              strokeWidth="0.8"
            />
            {/* Knobby protrusions */}
            <path
              d="M36,16 Q42,10 40,4"
              fill="url(#gingerGrad)"
              stroke="#A08050"
              strokeWidth="0.8"
            />
            <path d="M8,24 Q2,22 0,18" fill="url(#gingerGrad)" stroke="#A08050" strokeWidth="0.6" />
            {/* Skin texture rings */}
            <path
              d="M14,22 Q18,20 22,22"
              stroke="#C4A070"
              strokeWidth="0.6"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M24,28 Q30,26 36,28"
              stroke="#C4A070"
              strokeWidth="0.5"
              fill="none"
              opacity="0.45"
            />
            <path
              d="M18,34 Q24,32 30,34"
              stroke="#C4A070"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
            {/* Highlight */}
            <ellipse cx="22" cy="24" rx="6" ry="4" fill="#F8E8C0" opacity="0.35" />
            <ellipse cx="34" cy="22" rx="3" ry="2" fill="#F0E0B0" opacity="0.3" />
            {/* Cut spot showing inside */}
            <ellipse
              cx="10"
              cy="28"
              rx="3"
              ry="4"
              fill="#F8E8B0"
              stroke="#B89860"
              strokeWidth="0.4"
            />
          </g>
        );

      case 'egg':
        if (state === 'boiled') {
          return (
            <g>
              <defs>
                <radialGradient id="boiledWhiteGrad" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFEFA" />
                  <stop offset="50%" stopColor="#F8F4ED" />
                  <stop offset="100%" stopColor="#E8E4DC" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="42" rx="10" ry="3" fill="rgba(0,0,0,0.08)" />
              {/* Sliced hard boiled egg showing white and yolk */}
              <ellipse
                cx="25"
                cy="25"
                rx="12"
                ry="16"
                fill="url(#boiledWhiteGrad)"
                stroke="#D8D0C0"
                strokeWidth="0.8"
              />
              {/* Yolk center - round and firm */}
              <ellipse
                cx="25"
                cy="25"
                rx="6"
                ry="7"
                fill="#FFD54F"
                stroke="#F0C020"
                strokeWidth="0.5"
              />
              {/* Yolk highlight */}
              <ellipse cx="23" cy="23" rx="2" ry="2.5" fill="#FFE080" opacity="0.6" />
              {/* White texture lines */}
              <path d="M15,20 Q18,18 21,20" stroke="#F0ECE4" strokeWidth="0.4" opacity="0.5" />
              <path d="M29,30 Q32,28 35,30" stroke="#F0ECE4" strokeWidth="0.4" opacity="0.5" />
              {/* Shell edge hint */}
              <ellipse cx="20" cy="15" rx="4" ry="6" fill="#FFF" opacity="0.4" />
            </g>
          );
        }
        if (state === 'beaten') {
          return (
            <g>
              <defs>
                <radialGradient id="beatenEggGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFE880" />
                  <stop offset="50%" stopColor="#FFD740" />
                  <stop offset="100%" stopColor="#F0C020" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="38" rx="17" ry="4" fill="rgba(0,0,0,0.08)" />
              <ellipse
                cx="25"
                cy="26"
                rx="18"
                ry="14"
                fill="url(#beatenEggGrad)"
                stroke="#E0B020"
                strokeWidth="0.8"
              />
              {/* Whisked texture - foam lines */}
              <path
                d="M10,22 Q18,18 26,22 T42,20"
                stroke="#FFE860"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M12,28 Q20,24 28,28 T40,26"
                stroke="#FFF080"
                strokeWidth="1.5"
                fill="none"
                opacity="0.45"
              />
              {/* Air bubbles */}
              <circle cx="16" cy="24" r="2" fill="#FFF080" opacity="0.4" />
              <circle cx="32" cy="22" r="1.5" fill="#FFE870" opacity="0.35" />
              <circle cx="24" cy="30" r="1.8" fill="#FFF080" opacity="0.3" />
              {/* Shiny surface */}
              <ellipse cx="20" cy="20" rx="5" ry="3" fill="#FFEC80" opacity="0.5" />
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="friedWhiteGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="80%" stopColor="#FAF8F5" />
                  <stop offset="100%" stopColor="#F0EDE8" />
                </radialGradient>
                <radialGradient id="friedYolkGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="50%" stopColor="#FFB300" />
                  <stop offset="100%" stopColor="#E69500" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="18" ry="4" fill="rgba(0,0,0,0.1)" />
              {/* Irregular white shape */}
              <path
                d="M6,25 Q4,18 12,14 Q22,10 32,14 Q42,18 44,26 Q46,36 38,40 Q26,44 14,40 Q6,36 6,25 Z"
                fill="url(#friedWhiteGrad)"
                stroke="#E0DCD5"
                strokeWidth="0.8"
              />
              {/* Crispy brown edges */}
              <path
                d="M8,32 Q6,28 8,24"
                stroke="#D4C8B8"
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
              />
              <path
                d="M38,20 Q42,24 40,30"
                stroke="#D4C8B8"
                strokeWidth="1.2"
                fill="none"
                opacity="0.35"
              />
              {/* Yolk */}
              <ellipse
                cx="25"
                cy="25"
                rx="9"
                ry="7"
                fill="url(#friedYolkGrad)"
                stroke="#D49000"
                strokeWidth="0.5"
              />
              {/* Yolk highlight */}
              <ellipse cx="22" cy="22" rx="3" ry="2" fill="#FFE880" opacity="0.6" />
              {/* White texture */}
              <ellipse cx="14" cy="20" rx="4" ry="3" fill="#FFF" opacity="0.4" />
              <ellipse cx="36" cy="30" rx="3" ry="2" fill="#FFF" opacity="0.35" />
            </g>
          );
        }
        // Raw egg in shell
        return (
          <g>
            <defs>
              <radialGradient id="eggShellGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFDF8" />
                <stop offset="50%" stopColor="#F5EDE0" />
                <stop offset="100%" stopColor="#E8DFD0" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="44" rx="9" ry="3" fill="rgba(0,0,0,0.08)" />
            <ellipse
              cx="25"
              cy="25"
              rx="11"
              ry="17"
              fill="url(#eggShellGrad)"
              stroke="#DDD5C8"
              strokeWidth="0.8"
            />
            {/* Shell texture - subtle speckles */}
            {[
              [20, 16],
              [30, 20],
              [18, 28],
              [32, 32],
              [22, 38],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={0.8 + (i % 2) * 0.3}
                fill="#D8D0C0"
                opacity={0.2 + (i % 3) * 0.1}
              />
            ))}
            {/* Highlight */}
            <ellipse cx="21" cy="18" rx="5" ry="8" fill="#FFFDF8" opacity="0.5" />
            <ellipse cx="19" cy="14" rx="2" ry="3" fill="#FFF" opacity="0.6" />
            {/* Subtle shadow on shell */}
            <path
              d="M14,30 Q18,38 25,42 Q32,38 36,30"
              stroke="#D0C8B8"
              strokeWidth="0.5"
              fill="none"
              opacity="0.3"
            />
          </g>
        );

      case 'cheese':
        if (state === 'shredded') {
          return (
            <g>
              <defs>
                <linearGradient id="shreddedCheeseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE4A0" />
                  <stop offset="50%" stopColor="#FFD470" />
                  <stop offset="100%" stopColor="#F0C050" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="16" ry="4" fill="rgba(0,0,0,0.08)" />
              {/* Pile of shredded cheese strands */}
              {[
                [12, 20],
                [18, 18],
                [24, 16],
                [30, 18],
                [36, 20],
                [15, 26],
                [22, 24],
                [28, 26],
                [34, 28],
                [18, 32],
                [26, 30],
                [32, 34],
              ].map(([x, y], i) => (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width="2.5"
                    height="8"
                    rx="1"
                    fill="url(#shreddedCheeseGrad)"
                    stroke="#E0B040"
                    strokeWidth="0.3"
                    opacity={0.8 + (i % 3) * 0.1}
                  />
                  <rect
                    x={x + 0.3}
                    y={y + 1}
                    width="1.8"
                    height="1.5"
                    rx="0.5"
                    fill="#FFF0C0"
                    opacity="0.4"
                  />
                </g>
              ))}
              {/* Some scattered strands for realism */}
              <rect x="16" y="35" width="2" height="6" rx="1" fill="#FFE090" opacity="0.7" />
              <rect x="28" y="36" width="2" height="5" rx="1" fill="#FFD880" opacity="0.6" />
            </g>
          );
        }
        // Block cheese
        return (
          <g>
            <defs>
              <linearGradient id="cheeseBlockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE8A0" />
                <stop offset="30%" stopColor="#FFD060" />
                <stop offset="70%" stopColor="#F0C050" />
                <stop offset="100%" stopColor="#E0B040" />
              </linearGradient>
            </defs>
            <rect x="26" y="38" width="18" height="6" rx="1" fill="rgba(0,0,0,0.08)" />
            {/* 3D cheese block */}
            <path
              d="M10,18 L10,32 L38,32 L38,18 Z"
              fill="url(#cheeseBlockGrad)"
              stroke="#D0A030"
              strokeWidth="0.8"
            />
            <path
              d="M10,18 L16,12 L44,12 L38,18 Z"
              fill="#FFF0B0"
              stroke="#D0A030"
              strokeWidth="0.8"
            />
            <path
              d="M38,18 L44,12 L44,26 L38,32 Z"
              fill="#E8C060"
              stroke="#D0A030"
              strokeWidth="0.8"
            />
            {/* Holes in cheese */}
            <ellipse cx="20" cy="24" rx="2.5" ry="2" fill="#D0A030" opacity="0.3" />
            <ellipse cx="28" cy="22" rx="3" ry="2.5" fill="#D0A030" opacity="0.25" />
            <ellipse cx="30" cy="28" rx="2" ry="1.5" fill="#D0A030" opacity="0.3" />
            {/* Highlight */}
            <rect x="12" y="20" width="8" height="4" rx="1" fill="#FFFC00" opacity="0.3" />
          </g>
        );

      case 'butter':
        if (state === 'melted') {
          return (
            <g>
              <defs>
                <radialGradient id="meltedButterGrad" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFF8A0" />
                  <stop offset="50%" stopColor="#FFE870" />
                  <stop offset="100%" stopColor="#F0D050" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="42" rx="18" ry="4" fill="rgba(0,0,0,0.08)" />
              {/* Puddle of melted butter */}
              <ellipse
                cx="25"
                cy="28"
                rx="19"
                ry="12"
                fill="url(#meltedButterGrad)"
                stroke="#E0C840"
                strokeWidth="0.6"
                opacity="0.9"
              />
              {/* Shiny liquid surface */}
              <ellipse cx="25" cy="26" rx="16" ry="9" fill="#FFFC80" opacity="0.4" />
              <ellipse cx="20" cy="23" rx="6" ry="4" fill="#FFFCA0" opacity="0.6" />
              <ellipse cx="30" cy="28" rx="4" ry="3" fill="#FFF8B0" opacity="0.5" />
              {/* Liquid highlights */}
              <path
                d="M10,26 Q15,24 20,26"
                stroke="#FFFCC0"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M28,24 Q33,22 38,24"
                stroke="#FFF8B0"
                strokeWidth="1.2"
                fill="none"
                opacity="0.4"
              />
            </g>
          );
        }
        // Solid butter stick
        return (
          <g>
            <defs>
              <linearGradient id="butterStickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF4A0" />
                <stop offset="30%" stopColor="#FFE870" />
                <stop offset="70%" stopColor="#F0D860" />
                <stop offset="100%" stopColor="#E0C850" />
              </linearGradient>
            </defs>
            <rect x="26" y="36" width="22" height="6" rx="1" fill="rgba(0,0,0,0.08)" />
            {/* Butter stick with wrapper partially peeled */}
            <rect
              x="12"
              y="16"
              width="26"
              height="18"
              rx="2"
              fill="url(#butterStickGrad)"
              stroke="#D0B840"
              strokeWidth="0.8"
            />
            {/* Wrapper edge */}
            <path
              d="M12,16 L12,20 L8,22 L8,14 L12,16"
              fill="#E8E4D0"
              stroke="#C0B8A0"
              strokeWidth="0.6"
            />
            <path
              d="M38,16 L38,24 L42,26 L42,14 L38,16"
              fill="#D8D4C0"
              stroke="#C0B8A0"
              strokeWidth="0.6"
            />
            {/* Butter texture */}
            <rect x="14" y="18" width="22" height="1" fill="#FFE890" opacity="0.5" />
            <rect x="14" y="24" width="22" height="1" fill="#FFE890" opacity="0.4" />
            {/* Highlight */}
            <rect x="14" y="18" width="10" height="6" rx="1" fill="#FFF8C0" opacity="0.5" />
          </g>
        );

      case 'bacon':
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="cookedBaconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C08860" />
                  <stop offset="30%" stopColor="#A86840" />
                  <stop offset="70%" stopColor="#904830" />
                  <stop offset="100%" stopColor="#783020" />
                </linearGradient>
              </defs>
              {/* Crispy bacon strips stacked */}
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(0, ${i * 10})`}>
                  <ellipse cx="26" cy={38 - i * 2} rx="16" ry="2" fill="rgba(0,0,0,0.1)" />
                  {/* Wavy crispy bacon strip */}
                  <path
                    d="M8,22 Q12,18 16,20 Q20,22 24,20 Q28,18 32,20 Q36,22 40,20 L40,26 Q36,28 32,26 Q28,24 24,26 Q20,28 16,26 Q12,24 8,26 Z"
                    fill="url(#cookedBaconGrad)"
                    stroke="#603010"
                    strokeWidth="0.8"
                  />
                  {/* Fat streaks */}
                  <path
                    d="M10,23 Q14,21 18,23 Q22,25 26,23"
                    stroke="#F0D8C0"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M28,22 Q32,20 36,22"
                    stroke="#F0D8C0"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.5"
                  />
                  {/* Crispy texture */}
                  <path d="M12,20 Q16,19 20,20" stroke="#603010" strokeWidth="0.5" opacity="0.4" />
                  <path d="M28,25 Q32,26 36,25" stroke="#603010" strokeWidth="0.5" opacity="0.3" />
                  {/* Shiny cooked surface */}
                  <ellipse cx="18" cy="22" rx="3" ry="1.5" fill="#B07850" opacity="0.4" />
                </g>
              ))}
            </g>
          );
        }
        // Raw bacon
        return (
          <g>
            <defs>
              <linearGradient id="rawBaconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0C8B0" />
                <stop offset="30%" stopColor="#E0A890" />
                <stop offset="70%" stopColor="#D09070" />
                <stop offset="100%" stopColor="#C08060" />
              </linearGradient>
            </defs>
            {/* Raw bacon strips */}
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(0, ${i * 12})`}>
                <ellipse cx="25" cy={36 - i * 2} rx="18" ry="2.5" fill="rgba(0,0,0,0.08)" />
                {/* Slightly wavy raw strip */}
                <path
                  d="M6,18 Q10,16 14,18 Q18,20 22,18 Q26,16 30,18 Q34,20 38,18 Q42,16 44,18 L44,26 Q42,28 38,26 Q34,24 30,26 Q26,28 22,26 Q18,24 14,26 Q10,28 6,26 Z"
                  fill="url(#rawBaconGrad)"
                  stroke="#B07050"
                  strokeWidth="0.8"
                />
                {/* Fat streaks - white/cream colored */}
                <path
                  d="M8,21 Q12,19 16,21 Q20,23 24,21 Q28,19 32,21 Q36,23 40,21"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.8"
                />
                <path
                  d="M10,23 Q14,21 18,23 Q22,25 26,23 Q30,21 34,23"
                  stroke="#FFF8F0"
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.7"
                />
                {/* Meat texture */}
                <path d="M8,19 Q12,18 16,19" stroke="#D89880" strokeWidth="0.4" opacity="0.4" />
                <path d="M28,24 Q32,23 36,24" stroke="#E0A090" strokeWidth="0.4" opacity="0.3" />
                {/* Moist raw surface */}
                <ellipse cx="20" cy="20" rx="4" ry="2" fill="#FFF" opacity="0.3" />
              </g>
            ))}
          </g>
        );

      case 'soySauce':
        return (
          <g>
            <defs>
              <linearGradient id="soySauceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2A1810" />
                <stop offset="30%" stopColor="#4A3020" />
                <stop offset="70%" stopColor="#4A3020" />
                <stop offset="100%" stopColor="#2A1810" />
              </linearGradient>
              <linearGradient id="soyLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3A2818" />
                <stop offset="100%" stopColor="#1A0808" />
              </linearGradient>
            </defs>
            <rect x="17" y="44" width="16" height="2" rx="1" fill="rgba(0,0,0,0.1)" />
            {/* Bottle body */}
            <rect
              x="16"
              y="12"
              width="18"
              height="34"
              rx="3"
              fill="url(#soySauceGrad)"
              stroke="#1A1008"
              strokeWidth="0.8"
            />
            {/* Liquid inside */}
            <rect
              x="18"
              y="16"
              width="14"
              height="26"
              rx="1"
              fill="url(#soyLiquidGrad)"
              opacity="0.8"
            />
            {/* Cap */}
            <rect x="18" y="6" width="14" height="8" rx="2" fill="#0A0505" />
            <rect x="20" y="8" width="10" height="4" rx="1" fill="#1A1010" />
            {/* Label area */}
            <rect x="18" y="24" width="14" height="14" rx="1" fill="#F5E8D0" opacity="0.15" />
            {/* Characters on label */}
            <text
              x="25"
              y="34"
              fontSize="6"
              fill="#A08060"
              textAnchor="middle"
              opacity="0.4"
              fontFamily="serif"
            >
              醬油
            </text>
            {/* Bottle highlight */}
            <rect x="18" y="14" width="3" height="20" rx="1" fill="#5A4A38" opacity="0.3" />
          </g>
        );

      case 'vinegar':
        return (
          <g>
            <defs>
              <linearGradient id="vinegarBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8E4D8" />
                <stop offset="30%" stopColor="#F8F5F0" />
                <stop offset="70%" stopColor="#F8F5F0" />
                <stop offset="100%" stopColor="#E8E4D8" />
              </linearGradient>
              <linearGradient id="vinegarLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFEF8" />
                <stop offset="100%" stopColor="#F5F0E8" />
              </linearGradient>
            </defs>
            <rect x="15" y="44" width="20" height="2" rx="1" fill="rgba(0,0,0,0.08)" />
            {/* Bottle body */}
            <rect
              x="14"
              y="14"
              width="22"
              height="32"
              rx="2"
              fill="url(#vinegarBottleGrad)"
              stroke="#C8C4B8"
              strokeWidth="0.8"
            />
            {/* Liquid */}
            <rect
              x="16"
              y="18"
              width="18"
              height="24"
              rx="1"
              fill="url(#vinegarLiquidGrad)"
              opacity="0.6"
            />
            {/* Cap */}
            <rect x="16" y="6" width="18" height="10" rx="2" fill="#B0A898" />
            <rect x="18" y="8" width="14" height="6" rx="1" fill="#A09888" />
            {/* Glass reflection */}
            <rect x="16" y="16" width="4" height="22" rx="1" fill="#FFF" opacity="0.25" />
            {/* Label */}
            <rect x="17" y="26" width="16" height="12" rx="1" fill="#FFF" opacity="0.2" />
            <text x="25" y="34" fontSize="5" fill="#8A8070" textAnchor="middle" opacity="0.5">
              酢
            </text>
          </g>
        );

      case 'coconutMilk':
        return (
          <g>
            <defs>
              <radialGradient id="coconutMilkGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#FAF8F5" />
                <stop offset="100%" stopColor="#F0EDE8" />
              </radialGradient>
            </defs>
            {/* Bowl shadow */}
            <ellipse cx="25" cy="40" rx="17" ry="4" fill="rgba(0,0,0,0.08)" />
            {/* Bowl exterior */}
            <ellipse
              cx="25"
              cy="32"
              rx="17"
              ry="12"
              fill="#E0DCD5"
              stroke="#C8C4BC"
              strokeWidth="0.8"
            />
            {/* Bowl interior */}
            <ellipse cx="25" cy="30" rx="14" ry="9" fill="#D8D4CC" />
            {/* Milk surface */}
            <ellipse cx="25" cy="26" rx="14" ry="8" fill="url(#coconutMilkGrad)" />
            {/* Cream layer on top */}
            <ellipse cx="25" cy="24" rx="11" ry="5" fill="#FFF" opacity="0.7" />
            {/* Thick cream spots */}
            <ellipse cx="20" cy="22" rx="4" ry="2" fill="#FFF" opacity="0.8" />
            <ellipse cx="32" cy="26" rx="3" ry="1.5" fill="#FFFEF8" opacity="0.6" />
            {/* Bowl rim highlight */}
            <ellipse cx="25" cy="20" rx="14" ry="2" fill="none" stroke="#F0ECE5" strokeWidth="1" />
            <ellipse cx="18" cy="20" rx="4" ry="1" fill="#FFF" opacity="0.4" />
          </g>
        );

      case 'carrot':
        if (state === 'whole') {
          return (
            <g>
              <defs>
                <linearGradient id="carrotGrad" x1="30%" y1="0%" x2="70%" y2="100%">
                  <stop offset="0%" stopColor="#FF9933" />
                  <stop offset="100%" stopColor="#FF6600" />
                </linearGradient>
              </defs>
              {/* Greens */}
              <path d="M20 12 Q18 8 20 5" stroke="#4CAF50" strokeWidth="2" fill="none" />
              <path d="M25 10 Q25 6 27 4" stroke="#66BB6A" strokeWidth="2" fill="none" />
              <path d="M30 12 Q32 8 30 5" stroke="#4CAF50" strokeWidth="2" fill="none" />
              {/* Carrot body */}
              <path d="M20 15 Q25 15 30 15 L28 40 Q25 42 22 40 Z" fill="url(#carrotGrad)" />
              <path d="M22 20 Q23 20 24 20" stroke="#ff8800" strokeWidth="0.5" opacity="0.6" />
              <path d="M23 25 Q24 25 25 25" stroke="#ff8800" strokeWidth="0.5" opacity="0.6" />
              <path d="M24 30 Q25 30 26 30" stroke="#ff8800" strokeWidth="0.5" opacity="0.6" />
            </g>
          );
        }
        if (state === 'sliced') {
          return (
            <g>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 2}, ${i * 11})`}>
                  <circle cx="25" cy="25" r="10" fill="#ff9933" />
                  <circle cx="25" cy="25" r="7" fill="#ffaa55" />
                  <circle cx="25" cy="25" r="2" fill="#ff8800" />
                </g>
              ))}
            </g>
          );
        }
        return (
          <g>
            <rect x="16" y="16" width="6" height="6" rx="1" fill="#ff9933" />
            <rect x="28" y="16" width="6" height="6" rx="1" fill="#ffaa55" />
            <rect x="16" y="28" width="6" height="6" rx="1" fill="#ff8800" />
            <rect x="28" y="28" width="6" height="6" rx="1" fill="#ff9933" />
          </g>
        );

      case 'tomato':
        if (state === 'whole') {
          return (
            <g>
              <defs>
                <radialGradient id="tomatoGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FF6B6B" />
                  <stop offset="100%" stopColor="#D63031" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="42" rx="12" ry="4" fill="rgba(0,0,0,0.1)" />
              <circle cx="25" cy="28" r="14" fill="url(#tomatoGrad)" />
              <path
                d="M20 15 Q22 12 25 13 Q28 12 30 15"
                fill="#4CAF50"
                stroke="#388E3C"
                strokeWidth="0.5"
              />
              <ellipse cx="19" cy="22" rx="4" ry="3" fill="#FFF" opacity="0.3" />
            </g>
          );
        }
        return (
          <g>
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x={15 + (i % 2) * 12}
                y={18 + Math.floor(i / 2) * 12}
                width="8"
                height="8"
                rx="2"
                fill={i % 2 === 0 ? '#FF6B6B' : '#D63031'}
              />
            ))}
          </g>
        );

      case 'tuna':
        if (state === 'raw') {
          return (
            <g>
              <defs>
                <linearGradient id="tunaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C94A53" />
                  <stop offset="100%" stopColor="#A62F38" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="18" ry="5" fill="rgba(0,0,0,0.12)" />
              <ellipse
                cx="25"
                cy="25"
                rx="20"
                ry="14"
                fill="url(#tunaGrad)"
                stroke="#8B2832"
                strokeWidth="0.8"
              />
              <path
                d="M6 20 Q15 12 25 18 T44 16"
                stroke="#D85F68"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <ellipse cx="34" cy="18" rx="5" ry="3" fill="#E87882" opacity="0.4" />
            </g>
          );
        }
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="tunaSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D85F68" />
                  <stop offset="100%" stopColor="#C94A53" />
                </linearGradient>
              </defs>
              {/* Tuna slices */}
              <ellipse cx="25" cy="38" rx="12" ry="3" fill="rgba(0,0,0,0.1)" />
              <ellipse
                cx="15"
                cy="25"
                rx="10"
                ry="8"
                fill="url(#tunaSliceGrad)"
                stroke="#A62F38"
                strokeWidth="0.6"
              />
              <path
                d="M8 23 Q15 20 22 23"
                stroke="#E87882"
                strokeWidth="1.2"
                fill="none"
                opacity="0.6"
              />
              <ellipse
                cx="32"
                cy="28"
                rx="9"
                ry="7"
                fill="url(#tunaSliceGrad)"
                stroke="#A62F38"
                strokeWidth="0.6"
              />
              <path
                d="M26 26 Q32 24 38 26"
                stroke="#E87882"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
              <circle cx="18" cy="25" r="1.5" fill="#B83F48" opacity="0.5" />
              <circle cx="34" cy="28" r="1.2" fill="#B83F48" opacity="0.5" />
            </g>
          );
        }
        if (state === 'diced') {
          return (
            <g>
              <defs>
                <linearGradient id="tunaDiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D85F68" />
                  <stop offset="100%" stopColor="#C94A53" />
                </linearGradient>
              </defs>
              {/* Diced tuna cubes */}
              <rect
                x="12"
                y="18"
                width="6"
                height="6"
                rx="1"
                fill="url(#tunaDiceGrad)"
                stroke="#A62F38"
                strokeWidth="0.5"
              />
              <rect
                x="20"
                y="16"
                width="7"
                height="7"
                rx="1"
                fill="url(#tunaDiceGrad)"
                stroke="#A62F38"
                strokeWidth="0.5"
              />
              <rect
                x="29"
                y="19"
                width="6"
                height="6"
                rx="1"
                fill="url(#tunaDiceGrad)"
                stroke="#A62F38"
                strokeWidth="0.5"
              />
              <rect
                x="15"
                y="27"
                width="6"
                height="6"
                rx="1"
                fill="url(#tunaDiceGrad)"
                stroke="#A62F38"
                strokeWidth="0.5"
              />
              <rect
                x="24"
                y="26"
                width="7"
                height="7"
                rx="1"
                fill="url(#tunaDiceGrad)"
                stroke="#A62F38"
                strokeWidth="0.5"
              />
              <rect
                x="32"
                y="28"
                width="5"
                height="5"
                rx="1"
                fill="url(#tunaDiceGrad)"
                stroke="#A62F38"
                strokeWidth="0.5"
              />
              {/* Highlights on cubes */}
              <rect x="21" y="17" width="3" height="2" fill="#E87882" opacity="0.5" />
              <rect x="25" y="27" width="3" height="2" fill="#E87882" opacity="0.5" />
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <ellipse
                cx="25"
                cy="25"
                rx="16"
                ry="12"
                fill="#C97676"
                stroke="#A65858"
                strokeWidth="0.8"
              />
              <path d="M12 22 Q25 20 38 22" stroke="#B86868" strokeWidth="1" fill="none" />
            </g>
          );
        }
        // Default raw
        return (
          <g>
            <ellipse
              cx="25"
              cy="25"
              rx="18"
              ry="12"
              fill="#C94A53"
              stroke="#A62F38"
              strokeWidth="0.8"
            />
          </g>
        );

      case 'wagyu':
        // Premium wagyu with extensive marbling
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="wagyuSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E06070" />
                  <stop offset="50%" stopColor="#D04858" />
                  <stop offset="100%" stopColor="#C04048" />
                </linearGradient>
              </defs>
              {/* Multiple thin slices */}
              {[[10, 14], [24, 10], [38, 16], [14, 30], [28, 26], [22, 42]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="10" ry="5" fill="url(#wagyuSliceGrad)" stroke="#A03040" strokeWidth="0.4" />
                  {/* Extensive marbling - wagyu signature */}
                  <path d={`M-8,0 Q-4,-2 0,0 Q4,2 8,0`} stroke="#FFF" strokeWidth="2" fill="none" opacity="0.75" />
                  <path d={`M-6,-2 Q-2,-3 2,-2 Q6,-1 7,-2`} stroke="#FFE8E8" strokeWidth="1.5" fill="none" opacity="0.6" />
                  <path d={`M-7,2 Q-3,1 1,2 Q5,3 8,2`} stroke="#FFE0E0" strokeWidth="1.2" fill="none" opacity="0.55" />
                  <ellipse cx="-3" cy="-1" rx="2" ry="1" fill="#FFF" opacity="0.4" />
                  <ellipse cx="4" cy="1" rx="1.5" ry="0.8" fill="#FFE8E8" opacity="0.35" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="wagyuCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A07060" />
                  <stop offset="50%" stopColor="#8B5A4A" />
                  <stop offset="100%" stopColor="#6B4A3A" />
                </linearGradient>
              </defs>
              {/* Cooked wagyu - still shows marbling */}
              {[[10, 14], [24, 10], [38, 16], [14, 30], [28, 26], [22, 42]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="10" ry="5" fill="url(#wagyuCookedGrad)" stroke="#504030" strokeWidth="0.5" />
                  <path d={`M-7,0 Q-3,-1 1,0 Q5,1 8,0`} stroke="#C0A090" strokeWidth="1.5" fill="none" opacity="0.5" />
                  <path d={`M-5,-2 Q0,-2 5,-1`} stroke="#B09080" strokeWidth="1" fill="none" opacity="0.4" />
                </g>
              ))}
              {/* Rendered fat sheen */}
              <ellipse cx="24" cy="12" rx="4" ry="2" fill="#FFF8E0" opacity="0.3" />
            </g>
          );
        }
        // Raw wagyu - premium with lots of marbling
        return (
          <g>
            <defs>
              <radialGradient id="wagyuRawGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E86878" />
                <stop offset="50%" stopColor="#D04858" />
                <stop offset="100%" stopColor="#B83848" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="17" ry="5" fill="rgba(0,0,0,0.12)" />
            <ellipse cx="25" cy="25" rx="18" ry="14" fill="url(#wagyuRawGrad)" stroke="#902838" strokeWidth="0.5" />
            {/* Extensive marbling - wagyu signature */}
            <path d="M10,20 Q16,17 22,20 Q28,23 34,20 Q38,18 40,20" stroke="#FFF" strokeWidth="3" fill="none" opacity="0.8" />
            <path d="M8,25 Q15,22 22,25 Q29,28 36,25" stroke="#FFE8E8" strokeWidth="2.5" fill="none" opacity="0.7" />
            <path d="M12,30 Q18,27 24,30 Q30,33 36,30" stroke="#FFE0E0" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M14,35 Q22,32 30,35" stroke="#FFD8D8" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Fat pockets */}
            <ellipse cx="18" cy="22" rx="4" ry="2.5" fill="#FFF" opacity="0.5" />
            <ellipse cx="32" cy="26" rx="3" ry="2" fill="#FFE8E8" opacity="0.45" />
            <ellipse cx="24" cy="32" rx="3.5" ry="2" fill="#FFF" opacity="0.4" />
            {/* Highlight */}
            <ellipse cx="20" cy="18" rx="4" ry="2" fill="#FF8090" opacity="0.3" />
          </g>
        );

      case 'steak':
        // Regular steak cut
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="steakSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D85060" />
                  <stop offset="50%" stopColor="#C04050" />
                  <stop offset="100%" stopColor="#A83040" />
                </linearGradient>
              </defs>
              {/* Sliced steak pieces */}
              {[[10, 14], [26, 10], [40, 16], [14, 30], [30, 28], [22, 42]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="9" ry="5" fill="url(#steakSliceGrad)" stroke="#803030" strokeWidth="0.4" />
                  {/* Light marbling */}
                  <path d={`M-6,0 Q-2,-1 2,0 Q6,1 7,0`} stroke="#FFE8E8" strokeWidth="1.5" fill="none" opacity="0.5" />
                  <ellipse cx="-2" cy="-1" rx="1.5" ry="0.8" fill="#FFD8D8" opacity="0.35" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="steakCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5A40" />
                  <stop offset="50%" stopColor="#704830" />
                  <stop offset="100%" stopColor="#5A3828" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
              <ellipse cx="25" cy="25" rx="17" ry="13" fill="url(#steakCookedGrad)" stroke="#402818" strokeWidth="0.6" />
              {/* Grill marks */}
              <path d="M12,20 L38,20" stroke="#3A2010" strokeWidth="2" opacity="0.5" />
              <path d="M12,26 L38,26" stroke="#3A2010" strokeWidth="2" opacity="0.5" />
              <path d="M12,32 L38,32" stroke="#3A2010" strokeWidth="2" opacity="0.5" />
              {/* Slight char */}
              <ellipse cx="15" cy="22" rx="3" ry="2" fill="#2A1808" opacity="0.3" />
              <ellipse cx="35" cy="28" rx="2.5" ry="1.5" fill="#2A1808" opacity="0.25" />
            </g>
          );
        }
        // Raw steak
        return (
          <g>
            <defs>
              <radialGradient id="steakRawGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E05060" />
                <stop offset="50%" stopColor="#C84050" />
                <stop offset="100%" stopColor="#A83040" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="16" ry="5" fill="rgba(0,0,0,0.12)" />
            <ellipse cx="25" cy="25" rx="17" ry="13" fill="url(#steakRawGrad)" stroke="#802830" strokeWidth="0.5" />
            {/* Moderate marbling */}
            <path d="M12,22 Q18,20 25,22 Q32,24 38,22" stroke="#FFE8E8" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M15,28 Q22,26 30,28" stroke="#FFD8D8" strokeWidth="1.5" fill="none" opacity="0.5" />
            <ellipse cx="20" cy="24" rx="3" ry="1.8" fill="#FFF" opacity="0.35" />
            {/* Fat cap on edge */}
            <path d="M10,20 Q8,25 10,30" stroke="#FFF8F0" strokeWidth="3" fill="none" opacity="0.6" />
            {/* Highlight */}
            <ellipse cx="22" cy="19" rx="4" ry="2" fill="#F06878" opacity="0.3" />
          </g>
        );

      case 'groundBeef':
        // Ground/minced beef
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="groundBeefCookedGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#8B6050" />
                  <stop offset="60%" stopColor="#704838" />
                  <stop offset="100%" stopColor="#5A3828" />
                </radialGradient>
              </defs>
              {/* Cooked ground beef - browned crumbles */}
              <ellipse cx="25" cy="38" rx="16" ry="6" fill="rgba(0,0,0,0.1)" />
              <ellipse cx="25" cy="30" rx="16" ry="10" fill="url(#groundBeefCookedGrad)" />
              {/* Individual crumbles texture */}
              {[[12, 26], [18, 24], [24, 22], [30, 24], [36, 26], [14, 32], [22, 30], [28, 32], [34, 30], [20, 36], [28, 36]].map(([x, y], i) => (
                <ellipse key={i} cx={x} cy={y} rx={2 + (i % 2)} ry={1.5} fill={['#9A7060', '#806050', '#6A5040'][i % 3]} opacity="0.7" />
              ))}
              {/* Fat rendered */}
              <circle cx="16" cy="28" r="1.5" fill="#E0D0A0" opacity="0.4" />
              <circle cx="32" cy="30" r="1" fill="#E8D8B0" opacity="0.35" />
            </g>
          );
        }
        // Raw ground beef
        return (
          <g>
            <defs>
              <radialGradient id="groundBeefRawGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E06070" />
                <stop offset="60%" stopColor="#C84858" />
                <stop offset="100%" stopColor="#A83848" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="16" ry="5" fill="rgba(0,0,0,0.1)" />
            {/* Ground beef pile */}
            <ellipse cx="25" cy="28" rx="16" ry="12" fill="url(#groundBeefRawGrad)" />
            {/* Textured surface - small chunks */}
            {[[12, 22], [18, 20], [25, 18], [32, 20], [38, 22], [10, 28], [16, 26], [22, 24], [28, 26], [34, 28], [14, 34], [22, 32], [30, 34], [36, 32]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx={2 + (i % 3) * 0.5} ry={1.5} fill={['#D85060', '#C04050', '#B83848'][i % 3]} opacity="0.6" />
            ))}
            {/* Fat specks */}
            <circle cx="20" cy="24" r="2" fill="#FFF8F0" opacity="0.5" />
            <circle cx="30" cy="26" r="1.5" fill="#FFF0E8" opacity="0.45" />
            <circle cx="25" cy="32" r="1.8" fill="#FFF8F0" opacity="0.4" />
            <circle cx="15" cy="30" r="1.2" fill="#FFE8E0" opacity="0.35" />
            {/* Highlight */}
            <ellipse cx="22" cy="20" rx="4" ry="2" fill="#F07080" opacity="0.3" />
          </g>
        );

      case 'beef':
        // Generic beef falls through to steak-like appearance
        if (state === 'raw') {
          return (
            <g>
              <defs>
                <radialGradient id="beefGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#D84855" />
                  <stop offset="100%" stopColor="#B03645" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="38" rx="16" ry="5" fill="rgba(0,0,0,0.1)" />
              <ellipse cx="25" cy="25" rx="17" ry="13" fill="url(#beefGrad)" />
              {/* Marbling */}
              <path d="M12 22 Q18 20 25 22" stroke="#FFE8E8" strokeWidth="2.5" fill="none" opacity="0.7" />
              <path d="M18 28 Q24 26 30 28" stroke="#FFD8D8" strokeWidth="2" fill="none" opacity="0.6" />
              <ellipse cx="20" cy="22" rx="3" ry="2" fill="#FFF" opacity="0.3" />
            </g>
          );
        }
        return (
          <g>
            <ellipse cx="25" cy="25" rx="16" ry="12" fill="#8B5A3C" stroke="#6B4228" strokeWidth="0.8" />
            <path d="M12 22 Q25 24 38 22" stroke="#A06B47" strokeWidth="1" fill="none" />
          </g>
        );

      case 'porkBelly':
      case 'pork':
        if (state === 'raw') {
          return (
            <g>
              <ellipse cx="25" cy="38" rx="16" ry="4" fill="rgba(0,0,0,0.08)" />
              <rect x="10" y="18" width="30" height="16" rx="2" fill="#FFCBCB" />
              <rect x="10" y="22" width="30" height="2" fill="#FFF" opacity="0.8" />
              <rect x="10" y="28" width="30" height="2" fill="#FFF" opacity="0.8" />
              <rect x="10" y="25" width="30" height="3" fill="#FFB3B3" />
            </g>
          );
        }
        return (
          <g>
            <rect x="10" y="18" width="30" height="16" rx="2" fill="#E8B8A0" />
            <rect x="10" y="22" width="30" height="2" fill="#F5D0C0" />
            <rect x="10" y="28" width="30" height="2" fill="#F5D0C0" />
          </g>
        );

      case 'tofu':
        return (
          <g>
            <defs>
              <radialGradient id="tofuGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFFEF5" />
                <stop offset="100%" stopColor="#F5F0E0" />
              </radialGradient>
            </defs>
            <ellipse cx="26" cy="40" rx="14" ry="3" fill="rgba(0,0,0,0.05)" />
            <rect
              x="12"
              y="16"
              width="26"
              height="20"
              rx="2"
              fill="url(#tofuGrad)"
              stroke="#E8E0C8"
              strokeWidth="0.8"
            />
            <rect x="14" y="18" width="22" height="16" rx="1" fill="#FFF" opacity="0.3" />
            <ellipse cx="20" cy="24" rx="3" ry="2" fill="#FFF" opacity="0.4" />
          </g>
        );

      case 'noodles':
        if (state === 'dry') {
          return (
            <g>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M${10 + i * 3} ${18 + (i % 2) * 2} Q${20 + i * 2} ${28 + (i % 3) * 3} ${15 + i * 3} ${38 + (i % 2) * 2}`}
                  stroke="#F5E6D3"
                  strokeWidth="1.5"
                  fill="none"
                />
              ))}
            </g>
          );
        }
        return (
          <g>
            <ellipse cx="25" cy="35" rx="16" ry="8" fill="#FFF8E8" />
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${12 + i * 3} ${30 + i} Q${20 + i * 2} ${28} ${28 + i * 3} ${30 + i}`}
                stroke="#F0E0C8"
                strokeWidth="2"
                fill="none"
              />
            ))}
          </g>
        );

      case 'bellPepper':
        if (state === 'whole') {
          return (
            <g>
              <defs>
                <radialGradient id="pepperGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FF4444" />
                  <stop offset="100%" stopColor="#CC0000" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="42" rx="12" ry="4" fill="rgba(0,0,0,0.1)" />
              <ellipse cx="25" cy="28" rx="14" ry="16" fill="url(#pepperGrad)" />
              <rect x="22" y="12" width="6" height="8" rx="2" fill="#4CAF50" />
              <ellipse cx="18" cy="22" rx="4" ry="3" fill="#FF8888" opacity="0.5" />
            </g>
          );
        }
        if (state === 'diced') {
          // Diced bell pepper - small cubes with colorful variety
          return (
            <g>
              <defs>
                <linearGradient id="pepperDiceRed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5555" />
                  <stop offset="100%" stopColor="#CC0000" />
                </linearGradient>
                <linearGradient id="pepperDiceYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE066" />
                  <stop offset="100%" stopColor="#FFCC00" />
                </linearGradient>
                <linearGradient id="pepperDiceOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA366" />
                  <stop offset="100%" stopColor="#FF6600" />
                </linearGradient>
              </defs>
              {/* Diced pepper cubes - scattered arrangement */}
              {[
                { x: 8, y: 12, color: 'url(#pepperDiceRed)' },
                { x: 18, y: 10, color: 'url(#pepperDiceYellow)' },
                { x: 28, y: 13, color: 'url(#pepperDiceOrange)' },
                { x: 36, y: 11, color: 'url(#pepperDiceRed)' },
                { x: 6, y: 22, color: 'url(#pepperDiceOrange)' },
                { x: 15, y: 20, color: 'url(#pepperDiceRed)' },
                { x: 24, y: 22, color: 'url(#pepperDiceYellow)' },
                { x: 33, y: 20, color: 'url(#pepperDiceOrange)' },
                { x: 10, y: 32, color: 'url(#pepperDiceYellow)' },
                { x: 20, y: 30, color: 'url(#pepperDiceOrange)' },
                { x: 30, y: 33, color: 'url(#pepperDiceRed)' },
                { x: 38, y: 30, color: 'url(#pepperDiceYellow)' },
              ].map(({ x, y, color }, i) => (
                <g key={i}>
                  {/* Shadow */}
                  <rect
                    x={x + 0.5}
                    y={y + 0.5}
                    width="7"
                    height="7"
                    rx="0.5"
                    fill="rgba(0,0,0,0.1)"
                  />
                  {/* Cube */}
                  <rect
                    x={x}
                    y={y}
                    width="7"
                    height="7"
                    rx="0.5"
                    fill={color}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="0.3"
                  />
                  {/* Glossy highlight */}
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width="3"
                    height="2"
                    rx="0.3"
                    fill="rgba(255,255,255,0.4)"
                  />
                  {/* Flesh texture inside */}
                  <line
                    x1={x + 2}
                    y1={y + 4}
                    x2={x + 5}
                    y2={y + 4}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.5"
                  />
                </g>
              ))}
            </g>
          );
        }
        // Sliced - default
        return (
          <g>
            {[0, 1, 2].map((i) => (
              <ellipse
                key={i}
                cx={15 + i * 10}
                cy={25 + i * 3}
                rx="6"
                ry="10"
                fill={i % 2 === 0 ? '#FF4444' : '#CC0000'}
              />
            ))}
          </g>
        );

      case 'salt':
        return (
          <g>
            {/* Salt shaker */}
            <defs>
              <linearGradient id="saltShaker" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E8E8E8" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="8" ry="3" fill="rgba(0,0,0,0.1)" />
            {/* Shaker body */}
            <path
              d="M18 15 L18 32 Q18 35 25 35 Q32 35 32 32 L32 15 Z"
              fill="url(#saltShaker)"
              stroke="#C0C0C0"
              strokeWidth="1"
            />
            {/* Top cap */}
            <rect
              x="16"
              y="12"
              width="18"
              height="5"
              rx="1"
              fill="#D0D0D0"
              stroke="#A0A0A0"
              strokeWidth="0.5"
            />
            {/* Holes */}
            <circle cx="22" cy="14" r="0.8" fill="#606060" />
            <circle cx="25" cy="14" r="0.8" fill="#606060" />
            <circle cx="28" cy="14" r="0.8" fill="#606060" />
            {/* Salt crystals */}
            <circle cx="23" cy="28" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="27" cy="26" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="25" cy="30" r="1.2" fill="#FFFFFF" opacity="0.9" />
          </g>
        );

      case 'pepper':
        return (
          <g>
            {/* Pepper mill */}
            <defs>
              <linearGradient id="pepperMill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A4A4A" />
                <stop offset="50%" stopColor="#2A2A2A" />
                <stop offset="100%" stopColor="#1A1A1A" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="8" ry="3" fill="rgba(0,0,0,0.15)" />
            {/* Mill body */}
            <path
              d="M18 20 L18 32 Q18 35 25 35 Q32 35 32 32 L32 20 Z"
              fill="url(#pepperMill)"
              stroke="#0A0A0A"
              strokeWidth="1"
            />
            {/* Top knob */}
            <circle cx="25" cy="18" r="5" fill="#8B4513" stroke="#654321" strokeWidth="0.8" />
            <circle cx="25" cy="18" r="2" fill="#A0522D" />
            {/* Metal band */}
            <rect x="19" y="24" width="12" height="3" fill="#C0C0C0" opacity="0.6" />
            {/* Ground pepper */}
            <circle cx="22" cy="30" r="1" fill="#1A1A1A" />
            <circle cx="26" cy="29" r="0.8" fill="#2A2A2A" />
            <circle cx="28" cy="31" r="1.2" fill="#0A0A0A" />
          </g>
        );

      // ============================================
      // SEAFOOD - Detailed graphics
      // ============================================

      case 'mahi':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="mahiSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5E6D3" />
                  <stop offset="30%" stopColor="#E8D4BC" />
                  <stop offset="70%" stopColor="#D4C4A8" />
                  <stop offset="100%" stopColor="#C4B498" />
                </linearGradient>
              </defs>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 2}, ${i * 11})`}>
                  <ellipse cx="24" cy="12" rx="15" ry="5.5" fill="url(#mahiSliceGrad)" stroke="#B8A888" strokeWidth="0.4" />
                  <path d={`M10,${10} Q17,${8} 24,${10} T38,${10}`} stroke="#F0E0D0" strokeWidth="1.5" fill="none" opacity="0.7" />
                  <path d={`M12,${12} Q20,${10} 28,${12} T36,${11}`} stroke="#E8D8C8" strokeWidth="1" fill="none" opacity="0.5" />
                  <ellipse cx="30" cy="9" rx="3" ry="1.5" fill="#FFF8F0" opacity="0.5" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="mahiCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8D4B8" />
                  <stop offset="40%" stopColor="#D4B890" />
                  <stop offset="100%" stopColor="#B89868" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="28" rx="18" ry="4" fill="rgba(0,0,0,0.15)" />
              <ellipse cx="25" cy="25" rx="19" ry="12" fill="url(#mahiCookedGrad)" stroke="#8B7355" strokeWidth="0.8" />
              <path d="M8,22 Q16,18 25,22 T42,20" stroke="#C4A878" strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M12,20 L18,28" stroke="#705030" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
              <path d="M22,18 L28,30" stroke="#705030" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              <path d="M32,20 L38,28" stroke="#705030" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
              <ellipse cx="18" cy="22" rx="4" ry="2" fill="#D8C4A0" opacity="0.4" />
            </g>
          );
        }
        // Raw mahi - distinctive golden-green color
        return (
          <g>
            <defs>
              <linearGradient id="mahiRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B8D4A8" />
                <stop offset="25%" stopColor="#A8C898" />
                <stop offset="50%" stopColor="#98B888" />
                <stop offset="75%" stopColor="#88A878" />
                <stop offset="100%" stopColor="#789868" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="18" ry="5" fill="rgba(0,0,0,0.12)" />
            <ellipse cx="25" cy="25" rx="20" ry="14" fill="url(#mahiRawGrad)" stroke="#688858" strokeWidth="0.8" />
            <path d="M6,20 Q15,12 25,18 T44,16" stroke="#C8E8B8" strokeWidth="2.5" fill="none" opacity="0.6" />
            <path d="M8,24 Q18,18 28,24 T42,22" stroke="#B8D8A8" strokeWidth="1.8" fill="none" opacity="0.5" />
            <ellipse cx="34" cy="18" rx="5" ry="3" fill="#D8F0C8" opacity="0.45" />
            <ellipse cx="16" cy="28" rx="3" ry="2" fill="#C8E0B8" opacity="0.35" />
          </g>
        );

      case 'tilapia':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="tilapiaSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFAF5" />
                  <stop offset="50%" stopColor="#F5EDE5" />
                  <stop offset="100%" stopColor="#E8DDD0" />
                </linearGradient>
              </defs>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 2}, ${i * 11})`}>
                  <ellipse cx="24" cy="12" rx="14" ry="5" fill="url(#tilapiaSliceGrad)" stroke="#C8BBA8" strokeWidth="0.4" />
                  <path d={`M11,${11} Q18,${9} 24,${11} T37,${10}`} stroke="#FFF" strokeWidth="1.2" fill="none" opacity="0.6" />
                  <ellipse cx="28" cy="10" rx="2.5" ry="1.2" fill="#FFF" opacity="0.5" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="tilapiaCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5E8D8" />
                  <stop offset="50%" stopColor="#E8D4BC" />
                  <stop offset="100%" stopColor="#D4C0A0" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="28" rx="17" ry="4" fill="rgba(0,0,0,0.12)" />
              <ellipse cx="25" cy="25" rx="18" ry="11" fill="url(#tilapiaCookedGrad)" stroke="#A89878" strokeWidth="0.8" />
              <path d="M10,22 Q18,18 26,22" stroke="#C4B090" strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M24,26 Q32,24 40,26" stroke="#B4A080" strokeWidth="1.2" fill="none" opacity="0.4" />
              <ellipse cx="20" cy="22" rx="4" ry="2.5" fill="#F0E0C8" opacity="0.4" />
            </g>
          );
        }
        // Raw tilapia - pale pink/white
        return (
          <g>
            <defs>
              <linearGradient id="tilapiaRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8F5" />
                <stop offset="30%" stopColor="#FFE8E0" />
                <stop offset="70%" stopColor="#F8D8D0" />
                <stop offset="100%" stopColor="#F0C8C0" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="17" ry="5" fill="rgba(0,0,0,0.1)" />
            <ellipse cx="25" cy="25" rx="19" ry="13" fill="url(#tilapiaRawGrad)" stroke="#D8B8B0" strokeWidth="0.8" />
            <path d="M7,20 Q16,13 26,18 T43,16" stroke="#FFF0E8" strokeWidth="2" fill="none" opacity="0.7" />
            <path d="M9,26 Q19,20 29,26 T41,24" stroke="#FFE8E0" strokeWidth="1.5" fill="none" opacity="0.5" />
            <ellipse cx="32" cy="19" rx="4" ry="2.5" fill="#FFF" opacity="0.4" />
            <ellipse cx="18" cy="24" rx="3" ry="2" fill="#FFF8F0" opacity="0.35" />
          </g>
        );

      case 'cod':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="codSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#F8F4F0" />
                  <stop offset="100%" stopColor="#EDE8E4" />
                </linearGradient>
              </defs>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 2}, ${i * 11})`}>
                  <ellipse cx="24" cy="12" rx="15" ry="5.5" fill="url(#codSliceGrad)" stroke="#D0C8C0" strokeWidth="0.4" />
                  <path d={`M9,${11} Q16,${9} 24,${11} T39,${10}`} stroke="#FFF" strokeWidth="1.8" fill="none" opacity="0.8" />
                  <path d={`M12,${13} Q20,${11} 28,${13}`} stroke="#F8F0E8" strokeWidth="1" fill="none" opacity="0.5" />
                  <ellipse cx="30" cy="9" rx="3" ry="1.5" fill="#FFF" opacity="0.6" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="codCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8F0" />
                  <stop offset="50%" stopColor="#F0E8DC" />
                  <stop offset="100%" stopColor="#E0D4C4" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="28" rx="18" ry="4" fill="rgba(0,0,0,0.12)" />
              <ellipse cx="25" cy="25" rx="19" ry="12" fill="url(#codCookedGrad)" stroke="#B8A890" strokeWidth="0.8" />
              {/* Flaky texture */}
              <path d="M10,22 Q16,19 22,22" stroke="#D8CCBC" strokeWidth="1.5" fill="none" opacity="0.6" />
              <path d="M20,26 Q26,23 32,26" stroke="#D0C4B4" strokeWidth="1.2" fill="none" opacity="0.5" />
              <path d="M28,22 Q34,19 40,22" stroke="#C8BCAC" strokeWidth="1" fill="none" opacity="0.4" />
              <ellipse cx="16" cy="22" rx="4" ry="2.5" fill="#FFF8F0" opacity="0.5" />
            </g>
          );
        }
        // Raw cod - pure white flesh
        return (
          <g>
            <defs>
              <radialGradient id="codRawGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#FAF8F5" />
                <stop offset="100%" stopColor="#F0EDE8" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="18" ry="5" fill="rgba(0,0,0,0.1)" />
            <ellipse cx="25" cy="25" rx="20" ry="14" fill="url(#codRawGrad)" stroke="#DDD8D0" strokeWidth="0.8" />
            <path d="M6,20 Q15,12 25,18 T44,16" stroke="#FFF" strokeWidth="3" fill="none" opacity="0.8" />
            <path d="M8,24 Q18,18 28,24 T42,22" stroke="#FFF" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M10,28 Q20,24 30,28" stroke="#FFF" strokeWidth="1.5" fill="none" opacity="0.4" />
            <ellipse cx="34" cy="18" rx="5" ry="3" fill="#FFF" opacity="0.6" />
            <ellipse cx="16" cy="28" rx="3" ry="2" fill="#FFF" opacity="0.4" />
          </g>
        );

      case 'crab':
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="crabCookedGrad" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#FF6B4A" />
                  <stop offset="50%" stopColor="#E84A30" />
                  <stop offset="100%" stopColor="#C83820" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.15)" />
              {/* Main shell */}
              <ellipse cx="25" cy="26" rx="18" ry="12" fill="url(#crabCookedGrad)" stroke="#A02810" strokeWidth="1" />
              {/* Shell segments */}
              <path d="M10,22 Q18,16 25,22" stroke="#FF8060" strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M25,22 Q32,16 40,22" stroke="#FF8060" strokeWidth="1.5" fill="none" opacity="0.5" />
              {/* Claws */}
              <ellipse cx="6" cy="28" rx="5" ry="8" fill="url(#crabCookedGrad)" stroke="#A02810" strokeWidth="0.8" transform="rotate(-20, 6, 28)" />
              <ellipse cx="44" cy="28" rx="5" ry="8" fill="url(#crabCookedGrad)" stroke="#A02810" strokeWidth="0.8" transform="rotate(20, 44, 28)" />
              {/* Claw pincers */}
              <path d="M2,20 Q0,18 2,16" stroke="#C83820" strokeWidth="2" fill="none" />
              <path d="M48,20 Q50,18 48,16" stroke="#C83820" strokeWidth="2" fill="none" />
              {/* Eyes */}
              <circle cx="20" cy="18" r="2" fill="#1A1A1A" />
              <circle cx="30" cy="18" r="2" fill="#1A1A1A" />
              <circle cx="21" cy="17" r="0.8" fill="#444" />
              <circle cx="31" cy="17" r="0.8" fill="#444" />
              {/* Highlight */}
              <ellipse cx="20" cy="24" rx="5" ry="3" fill="#FF9070" opacity="0.4" />
            </g>
          );
        }
        // Raw crab - grayish brown
        return (
          <g>
            <defs>
              <radialGradient id="crabRawGrad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#A89888" />
                <stop offset="50%" stopColor="#8A7A6A" />
                <stop offset="100%" stopColor="#6A5A4A" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.12)" />
            {/* Main shell */}
            <ellipse cx="25" cy="26" rx="18" ry="12" fill="url(#crabRawGrad)" stroke="#5A4A3A" strokeWidth="1" />
            {/* Shell texture */}
            <path d="M10,22 Q18,16 25,22" stroke="#B8A898" strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M25,22 Q32,16 40,22" stroke="#B8A898" strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* Claws */}
            <ellipse cx="6" cy="28" rx="5" ry="8" fill="url(#crabRawGrad)" stroke="#5A4A3A" strokeWidth="0.8" transform="rotate(-20, 6, 28)" />
            <ellipse cx="44" cy="28" rx="5" ry="8" fill="url(#crabRawGrad)" stroke="#5A4A3A" strokeWidth="0.8" transform="rotate(20, 44, 28)" />
            {/* Claw pincers */}
            <path d="M2,20 Q0,18 2,16" stroke="#6A5A4A" strokeWidth="2" fill="none" />
            <path d="M48,20 Q50,18 48,16" stroke="#6A5A4A" strokeWidth="2" fill="none" />
            {/* Eyes */}
            <circle cx="20" cy="18" r="2" fill="#1A1A1A" />
            <circle cx="30" cy="18" r="2" fill="#1A1A1A" />
            <circle cx="21" cy="17" r="0.8" fill="#444" />
            <circle cx="31" cy="17" r="0.8" fill="#444" />
            {/* Legs hint */}
            <path d="M8,34 L4,38 M12,36 L9,40 M38,36 L41,40 M42,34 L46,38" stroke="#7A6A5A" strokeWidth="1" />
          </g>
        );

      case 'scallops':
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="scallopCookedGrad" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#F5E8D0" />
                  <stop offset="50%" stopColor="#E0C8A0" />
                  <stop offset="100%" stopColor="#C4A878" />
                </radialGradient>
              </defs>
              {/* Three seared scallops */}
              {[[12, 22], [28, 20], [20, 34]].map(([cx, cy], i) => (
                <g key={i}>
                  <ellipse cx={cx} cy={cy + 3} rx="9" ry="3" fill="rgba(0,0,0,0.12)" />
                  <ellipse cx={cx} cy={cy} rx="9" ry="7" fill="url(#scallopCookedGrad)" stroke="#A08858" strokeWidth="0.6" />
                  {/* Sear marks - golden brown top */}
                  <ellipse cx={cx} cy={cy - 2} rx="7" ry="4" fill="#C49858" opacity="0.6" />
                  <ellipse cx={cx} cy={cy - 3} rx="5" ry="2.5" fill="#B08040" opacity="0.4" />
                  {/* Caramelized edge */}
                  <path d={`M${cx - 6},${cy - 1} Q${cx},${cy - 5} ${cx + 6},${cy - 1}`} stroke="#8B6914" strokeWidth="1" fill="none" opacity="0.3" />
                  {/* Highlight */}
                  <ellipse cx={cx - 2} cy={cy - 1} rx="2" ry="1.5" fill="#FFF8E8" opacity="0.5" />
                </g>
              ))}
            </g>
          );
        }
        // Raw scallops - creamy white with slight translucence
        return (
          <g>
            <defs>
              <radialGradient id="scallopRawGrad" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#FFFEF8" />
                <stop offset="50%" stopColor="#FFF8F0" />
                <stop offset="100%" stopColor="#F0E8DC" />
              </radialGradient>
            </defs>
            {/* Three raw scallops */}
            {[[12, 22], [28, 20], [20, 34]].map(([cx, cy], i) => (
              <g key={i}>
                <ellipse cx={cx} cy={cy + 3} rx="9" ry="3" fill="rgba(0,0,0,0.08)" />
                <ellipse cx={cx} cy={cy} rx="9" ry="7" fill="url(#scallopRawGrad)" stroke="#E0D8C8" strokeWidth="0.6" />
                {/* Muscle striations */}
                <ellipse cx={cx} cy={cy} rx="6" ry="4" fill="none" stroke="#F8F0E8" strokeWidth="0.8" opacity="0.6" />
                <ellipse cx={cx} cy={cy} rx="3" ry="2" fill="none" stroke="#FFF" strokeWidth="0.5" opacity="0.5" />
                {/* Wet sheen */}
                <ellipse cx={cx - 2} cy={cy - 2} rx="3" ry="2" fill="#FFF" opacity="0.5" />
                {/* Slight coral tint on edge */}
                <path d={`M${cx - 7},${cy + 2} Q${cx},${cy + 5} ${cx + 7},${cy + 2}`} stroke="#FFE0D8" strokeWidth="1.5" fill="none" opacity="0.3" />
              </g>
            ))}
          </g>
        );

      // ============================================
      // MEAT - Detailed graphics
      // ============================================

      case 'chickenWing':
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="wingCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4A060" />
                  <stop offset="30%" stopColor="#C08840" />
                  <stop offset="70%" stopColor="#A07030" />
                  <stop offset="100%" stopColor="#806020" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="14" ry="4" fill="rgba(0,0,0,0.12)" />
              {/* Drumette section */}
              <ellipse cx="18" cy="28" rx="10" ry="14" fill="url(#wingCookedGrad)" stroke="#705020" strokeWidth="0.8" transform="rotate(-15, 18, 28)" />
              {/* Flat section */}
              <ellipse cx="34" cy="26" rx="8" ry="12" fill="url(#wingCookedGrad)" stroke="#705020" strokeWidth="0.8" transform="rotate(20, 34, 26)" />
              {/* Crispy skin texture */}
              <path d="M12,20 Q18,16 24,20" stroke="#B08040" strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M28,18 Q34,14 40,18" stroke="#A07030" strokeWidth="1.2" fill="none" opacity="0.4" />
              {/* Bone end */}
              <ellipse cx="12" cy="38" rx="2" ry="3" fill="#F0E8D8" stroke="#D0C8B8" strokeWidth="0.5" />
              <ellipse cx="40" cy="36" rx="1.5" ry="2.5" fill="#F0E8D8" stroke="#D0C8B8" strokeWidth="0.5" />
              {/* Golden highlights */}
              <ellipse cx="16" cy="24" rx="3" ry="4" fill="#E0B060" opacity="0.4" />
              <ellipse cx="32" cy="22" rx="2.5" ry="3.5" fill="#D0A050" opacity="0.35" />
            </g>
          );
        }
        // Raw chicken wing
        return (
          <g>
            <defs>
              <linearGradient id="wingRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE8D8" />
                <stop offset="50%" stopColor="#FFD8C4" />
                <stop offset="100%" stopColor="#F0C8B0" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="14" ry="4" fill="rgba(0,0,0,0.1)" />
            {/* Drumette */}
            <ellipse cx="18" cy="28" rx="10" ry="14" fill="url(#wingRawGrad)" stroke="#E0B8A0" strokeWidth="0.8" transform="rotate(-15, 18, 28)" />
            {/* Flat */}
            <ellipse cx="34" cy="26" rx="8" ry="12" fill="url(#wingRawGrad)" stroke="#E0B8A0" strokeWidth="0.8" transform="rotate(20, 34, 26)" />
            {/* Skin texture */}
            <path d="M12,22 Q18,18 24,22" stroke="#F8E0D0" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M28,20 Q34,16 40,20" stroke="#F8E0D0" strokeWidth="1" fill="none" opacity="0.5" />
            {/* Joint */}
            <circle cx="26" cy="30" r="3" fill="#F0D0C0" stroke="#E0C0B0" strokeWidth="0.5" />
            {/* Highlights */}
            <ellipse cx="16" cy="24" rx="3" ry="4" fill="#FFF" opacity="0.3" />
          </g>
        );

      case 'chickenThigh':
        if (state === 'diced') {
          return (
            <g>
              <defs>
                <linearGradient id="thighDiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE8D8" />
                  <stop offset="50%" stopColor="#F8D8C4" />
                  <stop offset="100%" stopColor="#E8C8B0" />
                </linearGradient>
              </defs>
              {[[10, 12], [22, 10], [34, 14], [8, 24], [20, 22], [32, 26], [14, 36], [26, 34]].map(([x, y], i) => (
                <g key={i}>
                  <rect x={x + 1} y={y + 1} width="10" height="10" rx="1.5" fill="rgba(0,0,0,0.1)" />
                  <rect x={x} y={y} width="10" height="10" rx="1.5" fill="url(#thighDiceGrad)" stroke="#D0B0A0" strokeWidth="0.4" />
                  {/* Darker meat bits */}
                  <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.5" fill="#E0B8A0" opacity="0.5" />
                  <rect x={x + 1} y={y + 1} width="4" height="3" rx="1" fill="#FFF8F0" opacity="0.5" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="thighCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4A878" />
                  <stop offset="40%" stopColor="#C49060" />
                  <stop offset="100%" stopColor="#A07848" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="16" ry="5" fill="rgba(0,0,0,0.15)" />
              <ellipse cx="25" cy="26" rx="18" ry="14" fill="url(#thighCookedGrad)" stroke="#806030" strokeWidth="0.8" />
              {/* Crispy skin */}
              <path d="M10,20 Q18,14 26,20" stroke="#B08850" strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M24,28 Q32,22 40,28" stroke="#A07840" strokeWidth="1.5" fill="none" opacity="0.4" />
              {/* Bone hint */}
              <ellipse cx="38" cy="32" rx="3" ry="5" fill="#F0E8D8" stroke="#D0C8B8" strokeWidth="0.5" />
              <ellipse cx="20" cy="20" rx="4" ry="2.5" fill="#E0B870" opacity="0.4" />
            </g>
          );
        }
        // Raw chicken thigh
        return (
          <g>
            <defs>
              <linearGradient id="thighRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE0D0" />
                <stop offset="50%" stopColor="#FFD0BC" />
                <stop offset="100%" stopColor="#F0C0A8" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="16" ry="5" fill="rgba(0,0,0,0.1)" />
            <ellipse cx="25" cy="26" rx="18" ry="14" fill="url(#thighRawGrad)" stroke="#E0A890" strokeWidth="0.8" />
            {/* Fat marbling */}
            <path d="M10,22 Q18,16 26,22" stroke="#FFF0E0" strokeWidth="2.5" fill="none" opacity="0.7" />
            <path d="M24,28 Q32,24 40,28" stroke="#FFE8D8" strokeWidth="2" fill="none" opacity="0.5" />
            {/* Skin edge */}
            <path d="M8,30 Q14,36 22,34" stroke="#F8D8C0" strokeWidth="1.5" fill="none" opacity="0.4" />
            <ellipse cx="18" cy="22" rx="4" ry="3" fill="#FFF" opacity="0.35" />
          </g>
        );

      case 'porkChop':
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="chopCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4A080" />
                  <stop offset="40%" stopColor="#C08860" />
                  <stop offset="100%" stopColor="#A06840" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.15)" />
              {/* Main chop */}
              <ellipse cx="22" cy="26" rx="16" ry="14" fill="url(#chopCookedGrad)" stroke="#805830" strokeWidth="0.8" />
              {/* Bone */}
              <rect x="38" y="18" width="6" height="20" rx="3" fill="#F5EDE0" stroke="#D8D0C0" strokeWidth="0.8" />
              <ellipse cx="41" cy="18" rx="3" ry="2" fill="#F5EDE0" />
              {/* Grill marks */}
              <path d="M10,20 L18,32" stroke="#704020" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <path d="M18,18 L26,32" stroke="#704020" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
              <path d="M26,20 L34,32" stroke="#704020" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
              {/* Fat edge */}
              <path d="M6,24 Q8,18 12,16" stroke="#F0D8C0" strokeWidth="4" fill="none" opacity="0.7" />
              <ellipse cx="16" cy="24" rx="4" ry="2.5" fill="#D8B888" opacity="0.4" />
            </g>
          );
        }
        // Raw pork chop
        return (
          <g>
            <defs>
              <linearGradient id="chopRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFCCC0" />
                <stop offset="50%" stopColor="#FFB8A8" />
                <stop offset="100%" stopColor="#F0A090" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
            {/* Main chop */}
            <ellipse cx="22" cy="26" rx="16" ry="14" fill="url(#chopRawGrad)" stroke="#D08878" strokeWidth="0.8" />
            {/* Bone */}
            <rect x="38" y="18" width="6" height="20" rx="3" fill="#FFF8F0" stroke="#E8E0D8" strokeWidth="0.8" />
            <ellipse cx="41" cy="18" rx="3" ry="2" fill="#FFF8F0" />
            {/* Fat cap */}
            <path d="M6,24 Q8,16 14,14" stroke="#FFF" strokeWidth="5" fill="none" opacity="0.8" />
            {/* Marbling */}
            <path d="M12,22 Q18,18 24,22" stroke="#FFF" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M14,28 Q22,24 30,28" stroke="#FFE8E0" strokeWidth="1.5" fill="none" opacity="0.5" />
            <ellipse cx="18" cy="24" rx="4" ry="3" fill="#FFF" opacity="0.35" />
          </g>
        );

      case 'groundPork':
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="gporkCookedGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#C49870" />
                  <stop offset="100%" stopColor="#A07850" />
                </radialGradient>
              </defs>
              <ellipse cx="25" cy="38" rx="17" ry="5" fill="rgba(0,0,0,0.12)" />
              <ellipse cx="25" cy="28" rx="18" ry="12" fill="url(#gporkCookedGrad)" stroke="#806040" strokeWidth="0.8" />
              {/* Crumbly texture */}
              {[[12, 22], [20, 20], [28, 24], [36, 22], [16, 30], [24, 32], [32, 30]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2 + (i % 2)} fill="#B08860" opacity={0.4 + (i % 3) * 0.1} />
              ))}
              {/* Browned bits */}
              <circle cx="14" cy="26" r="2.5" fill="#906840" opacity="0.5" />
              <circle cx="30" cy="28" r="2" fill="#805830" opacity="0.4" />
              <ellipse cx="22" cy="24" rx="3" ry="2" fill="#D0A878" opacity="0.4" />
            </g>
          );
        }
        // Raw ground pork
        return (
          <g>
            <defs>
              <radialGradient id="gporkRawGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFD0C0" />
                <stop offset="100%" stopColor="#F0B8A0" />
              </radialGradient>
            </defs>
            <ellipse cx="25" cy="38" rx="17" ry="5" fill="rgba(0,0,0,0.1)" />
            <ellipse cx="25" cy="28" rx="18" ry="12" fill="url(#gporkRawGrad)" stroke="#E0A090" strokeWidth="0.8" />
            {/* Ground meat texture */}
            {[[12, 22], [20, 20], [28, 24], [36, 22], [16, 30], [24, 32], [32, 30]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2 + (i % 2)} fill="#F0C0B0" opacity={0.5 + (i % 3) * 0.1} />
            ))}
            {/* Fat specks */}
            <circle cx="18" cy="24" r="2" fill="#FFF" opacity="0.6" />
            <circle cx="32" cy="26" r="1.5" fill="#FFF" opacity="0.5" />
            <circle cx="24" cy="30" r="1.8" fill="#FFF8F0" opacity="0.5" />
          </g>
        );

      case 'lamb':
        if (state === 'diced') {
          return (
            <g>
              <defs>
                <linearGradient id="lambDiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C87070" />
                  <stop offset="50%" stopColor="#B86060" />
                  <stop offset="100%" stopColor="#A85050" />
                </linearGradient>
              </defs>
              {[[10, 12], [22, 10], [34, 14], [8, 24], [20, 22], [32, 26], [14, 36], [26, 34]].map(([x, y], i) => (
                <g key={i}>
                  <rect x={x + 1} y={y + 1} width="10" height="10" rx="1.5" fill="rgba(0,0,0,0.1)" />
                  <rect x={x} y={y} width="10" height="10" rx="1.5" fill="url(#lambDiceGrad)" stroke="#904040" strokeWidth="0.4" />
                  {/* Fat marbling */}
                  <path d={`M${x + 2},${y + 3} L${x + 8},${y + 3}`} stroke="#F0D0D0" strokeWidth="1" opacity="0.6" />
                  <rect x={x + 1} y={y + 1} width="4" height="3" rx="1" fill="#D89090" opacity="0.4" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="lambCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A87060" />
                  <stop offset="40%" stopColor="#906050" />
                  <stop offset="100%" stopColor="#785040" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="40" rx="16" ry="5" fill="rgba(0,0,0,0.15)" />
              <ellipse cx="25" cy="26" rx="18" ry="14" fill="url(#lambCookedGrad)" stroke="#604030" strokeWidth="0.8" />
              {/* Caramelized surface */}
              <path d="M10,22 Q18,16 26,22" stroke="#987060" strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M24,28 Q32,24 40,28" stroke="#886050" strokeWidth="1.5" fill="none" opacity="0.4" />
              <ellipse cx="18" cy="24" rx="4" ry="2.5" fill="#B88070" opacity="0.4" />
              <ellipse cx="32" cy="26" rx="3" ry="2" fill="#A87060" opacity="0.35" />
            </g>
          );
        }
        // Raw lamb - darker red than beef
        return (
          <g>
            <defs>
              <linearGradient id="lambRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D08080" />
                <stop offset="50%" stopColor="#C07070" />
                <stop offset="100%" stopColor="#A86060" />
              </linearGradient>
            </defs>
            <ellipse cx="25" cy="40" rx="16" ry="5" fill="rgba(0,0,0,0.12)" />
            <ellipse cx="25" cy="26" rx="18" ry="14" fill="url(#lambRawGrad)" stroke="#905050" strokeWidth="0.8" />
            {/* Fat marbling - lamb has distinctive white fat */}
            <path d="M10,22 Q18,16 26,22" stroke="#FFF" strokeWidth="2.5" fill="none" opacity="0.7" />
            <path d="M14,28 Q24,22 34,28" stroke="#FFE8E8" strokeWidth="2" fill="none" opacity="0.5" />
            <ellipse cx="20" cy="24" rx="4" ry="2.5" fill="#FFF" opacity="0.4" />
            <ellipse cx="32" cy="22" rx="3" ry="2" fill="#FFE0E0" opacity="0.35" />
          </g>
        );

      case 'broccoli':
        if (state === 'chopped') {
          return (
            <g>
              <defs>
                <radialGradient id="brocFloretGrad" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#3CB371" />
                  <stop offset="60%" stopColor="#228B22" />
                  <stop offset="100%" stopColor="#1B6B1B" />
                </radialGradient>
              </defs>
              {/* Multiple floret pieces */}
              {[[12, 14], [28, 10], [40, 16], [18, 28], [32, 26], [25, 38]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  {/* Floret head - bumpy texture */}
                  <ellipse cx="0" cy="0" rx="8" ry="6" fill="url(#brocFloretGrad)" />
                  <circle cx="-4" cy="-2" r="3" fill="#32A852" opacity="0.8" />
                  <circle cx="2" cy="-3" r="2.5" fill="#36B856" opacity="0.7" />
                  <circle cx="4" cy="0" r="2" fill="#30A050" opacity="0.6" />
                  <circle cx="-2" cy="2" r="2.5" fill="#2D9648" opacity="0.7" />
                  {/* Tiny stem stub */}
                  <rect x="-1.5" y="4" width="3" height="4" rx="1" fill="#7CB97C" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="brocCookedGrad" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#5BA65B" />
                  <stop offset="60%" stopColor="#4A8B4A" />
                  <stop offset="100%" stopColor="#3A7040" />
                </radialGradient>
              </defs>
              {/* Cooked florets - softer, darker green */}
              {[[12, 14], [28, 10], [40, 16], [18, 28], [32, 26], [25, 38]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="8" ry="6" fill="url(#brocCookedGrad)" opacity="0.9" />
                  <circle cx="-3" cy="-1" r="2.5" fill="#508B50" opacity="0.6" />
                  <circle cx="2" cy="-2" r="2" fill="#559055" opacity="0.5" />
                  <circle cx="3" cy="1" r="2" fill="#4D874D" opacity="0.5" />
                  {/* Tiny stem stub - slightly browned */}
                  <rect x="-1.5" y="4" width="3" height="4" rx="1" fill="#9AB89A" />
                </g>
              ))}
            </g>
          );
        }
        // Whole broccoli
        return (
          <g>
            <defs>
              <radialGradient id="brocHeadGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#3CB371" />
                <stop offset="50%" stopColor="#228B22" />
                <stop offset="100%" stopColor="#196919" />
              </radialGradient>
              <linearGradient id="brocStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6B8E6B" />
                <stop offset="50%" stopColor="#8FBC8F" />
                <stop offset="100%" stopColor="#6B8E6B" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="44" rx="12" ry="3" fill="rgba(0,0,0,0.1)" />
            {/* Main stem */}
            <path d="M21,46 L21,30 Q21,26 25,26 Q29,26 29,30 L29,46 Z" fill="url(#brocStemGrad)" stroke="#5A7A5A" strokeWidth="0.5" />
            {/* Floret head - bumpy texture */}
            <ellipse cx="25" cy="18" rx="18" ry="14" fill="url(#brocHeadGrad)" />
            {/* Individual floret bumps */}
            <circle cx="15" cy="12" r="5" fill="#32A852" />
            <circle cx="25" cy="8" r="6" fill="#36B856" />
            <circle cx="35" cy="12" r="5" fill="#30A050" />
            <circle cx="12" cy="20" r="4" fill="#2D9648" />
            <circle cx="20" cy="16" r="5" fill="#34B054" />
            <circle cx="30" cy="16" r="5" fill="#32A852" />
            <circle cx="38" cy="20" r="4" fill="#2E9A4A" />
            <circle cx="25" cy="22" r="4" fill="#2B9246" />
            {/* Highlight */}
            <ellipse cx="22" cy="10" rx="3" ry="2" fill="#5FD878" opacity="0.4" />
          </g>
        );

      case 'cabbage':
        if (state === 'shredded') {
          return (
            <g>
              <defs>
                <linearGradient id="cabbageShredGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E8F5E0" />
                  <stop offset="50%" stopColor="#C8E8C0" />
                  <stop offset="100%" stopColor="#A8D8A0" />
                </linearGradient>
              </defs>
              {/* Pile of shredded cabbage */}
              <ellipse cx="25" cy="38" rx="18" ry="8" fill="#E0F0D8" opacity="0.5" />
              {/* Many thin shredded strips */}
              {[...Array(20)].map((_, i) => {
                const x1 = 8 + (i % 5) * 8;
                const y1 = 12 + Math.floor(i / 5) * 8;
                const curve = (i % 3 - 1) * 3;
                return (
                  <path
                    key={i}
                    d={`M${x1},${y1} Q${x1 + 4 + curve},${y1 + 8} ${x1 + 8},${y1 + 12}`}
                    stroke={i % 3 === 0 ? '#B8E0B0' : i % 3 === 1 ? '#D0ECC8' : '#E0F5D8'}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}
              {/* White core pieces */}
              {[[15, 25], [30, 20], [22, 35], [35, 32]].map(([x, y], i) => (
                <path
                  key={`core${i}`}
                  d={`M${x},${y} Q${x + 2},${y + 5} ${x + 4},${y + 8}`}
                  stroke="#F8FFF5"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </g>
          );
        }
        // Whole cabbage
        return (
          <g>
            <defs>
              <radialGradient id="cabbageGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E8F8E0" />
                <stop offset="40%" stopColor="#B8E0B0" />
                <stop offset="80%" stopColor="#88C880" />
                <stop offset="100%" stopColor="#68A868" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="44" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
            {/* Main cabbage body */}
            <ellipse cx="25" cy="26" rx="20" ry="18" fill="url(#cabbageGrad)" stroke="#78B870" strokeWidth="0.5" />
            {/* Leaf layers - outer */}
            <path d="M8,30 Q5,20 15,12" stroke="#90D088" strokeWidth="2" fill="none" />
            <path d="M42,30 Q45,20 35,12" stroke="#90D088" strokeWidth="2" fill="none" />
            {/* Middle layers */}
            <path d="M12,32 Q10,22 20,14" stroke="#A0D898" strokeWidth="1.5" fill="none" />
            <path d="M38,32 Q40,22 30,14" stroke="#A0D898" strokeWidth="1.5" fill="none" />
            {/* Inner layers */}
            <ellipse cx="25" cy="24" rx="10" ry="8" fill="none" stroke="#B8E8B0" strokeWidth="1" />
            <ellipse cx="25" cy="22" rx="6" ry="5" fill="none" stroke="#C8F0C0" strokeWidth="1" />
            {/* Core hint */}
            <ellipse cx="25" cy="20" rx="3" ry="3" fill="#E8FFE0" opacity="0.6" />
            {/* Highlight */}
            <ellipse cx="20" cy="18" rx="4" ry="3" fill="#F0FFF0" opacity="0.3" />
          </g>
        );

      case 'mushroom':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="mushSliceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F5F0E8" />
                  <stop offset="40%" stopColor="#E8DDD0" />
                  <stop offset="100%" stopColor="#D4C4B0" />
                </linearGradient>
              </defs>
              {/* Multiple mushroom slices */}
              {[[10, 12], [25, 8], [38, 14], [15, 28], [30, 26], [22, 40]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  {/* Slice - cross section view */}
                  <ellipse cx="0" cy="0" rx="8" ry="5" fill="url(#mushSliceGrad)" stroke="#C0B0A0" strokeWidth="0.4" />
                  {/* Cap edge */}
                  <path d="M-7,0 Q-8,-3 0,-4 Q8,-3 7,0" stroke="#B8A090" strokeWidth="1.5" fill="none" />
                  {/* Gills pattern */}
                  <line x1="-4" y1="0" x2="-3" y2="3" stroke="#D8C8B8" strokeWidth="0.5" />
                  <line x1="-1" y1="0" x2="0" y2="4" stroke="#D8C8B8" strokeWidth="0.5" />
                  <line x1="2" y1="0" x2="3" y2="3" stroke="#D8C8B8" strokeWidth="0.5" />
                  {/* Stem base */}
                  <rect x="-2" y="2" width="4" height="3" rx="1" fill="#F0E8E0" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="mushCookedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C8B8A0" />
                  <stop offset="50%" stopColor="#A89880" />
                  <stop offset="100%" stopColor="#8A7A68" />
                </linearGradient>
              </defs>
              {/* Cooked mushroom slices - darker, slightly shrunken */}
              {[[10, 14], [26, 10], [38, 16], [16, 30], [32, 28], [24, 42]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="7" ry="4" fill="url(#mushCookedGrad)" stroke="#705840" strokeWidth="0.5" />
                  <path d="M-6,0 Q-6,-2 0,-3 Q6,-2 6,0" stroke="#8A7058" strokeWidth="1.2" fill="none" />
                  <line x1="-3" y1="0" x2="-2" y2="2" stroke="#9A8A78" strokeWidth="0.4" />
                  <line x1="0" y1="0" x2="0" y2="3" stroke="#9A8A78" strokeWidth="0.4" />
                  <line x1="3" y1="0" x2="2" y2="2" stroke="#9A8A78" strokeWidth="0.4" />
                </g>
              ))}
              {/* Slight oil sheen */}
              <ellipse cx="26" cy="10" rx="3" ry="1.5" fill="#FFF8E0" opacity="0.3" />
            </g>
          );
        }
        // Whole mushroom
        return (
          <g>
            <defs>
              <radialGradient id="mushCapGrad" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#D4C4B0" />
                <stop offset="60%" stopColor="#B8A090" />
                <stop offset="100%" stopColor="#8B7355" />
              </radialGradient>
              <linearGradient id="mushStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8E0D8" />
                <stop offset="50%" stopColor="#F8F4F0" />
                <stop offset="100%" stopColor="#E8E0D8" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.1)" />
            {/* Stem */}
            <path d="M20,44 L20,28 Q20,24 25,24 Q30,24 30,28 L30,44 Z" fill="url(#mushStemGrad)" stroke="#C0B0A0" strokeWidth="0.5" />
            {/* Cap */}
            <ellipse cx="25" cy="20" rx="16" ry="10" fill="url(#mushCapGrad)" stroke="#8B7355" strokeWidth="0.5" />
            {/* Cap underside - gills hint */}
            <path d="M10,22 Q15,26 25,26 Q35,26 40,22" stroke="#C8B8A8" strokeWidth="1" fill="none" />
            {/* Cap details */}
            <ellipse cx="22" cy="16" rx="5" ry="3" fill="#E0D0C0" opacity="0.3" />
            {/* Highlight */}
            <ellipse cx="20" cy="14" rx="3" ry="2" fill="#FFF8F0" opacity="0.4" />
          </g>
        );

      case 'greenOnion':
        if (state === 'chopped') {
          return (
            <g>
              <defs>
                <linearGradient id="scallionGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4CAF50" />
                  <stop offset="100%" stopColor="#2E7D32" />
                </linearGradient>
              </defs>
              {/* Scattered chopped rings and pieces */}
              {/* Green rings */}
              {[[8, 15], [22, 10], [35, 18], [12, 30], [28, 25], [40, 32], [18, 40], [32, 38]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="4" ry="2.5" fill="url(#scallionGreenGrad)" stroke="#1B5E20" strokeWidth="0.3" />
                  {/* Hollow center */}
                  <ellipse cx="0" cy="0" rx="2" ry="1" fill="#1B5E20" opacity="0.3" />
                </g>
              ))}
              {/* White pieces near root end */}
              {[[15, 22], [25, 35], [38, 26]].map(([x, y], i) => (
                <g key={`w${i}`} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="4" ry="2.5" fill="#F5F5F0" stroke="#E0E0D8" strokeWidth="0.3" />
                  <ellipse cx="0" cy="0" rx="2" ry="1" fill="#E8E8E0" opacity="0.5" />
                </g>
              ))}
            </g>
          );
        }
        // Whole green onion
        return (
          <g>
            <defs>
              <linearGradient id="scallionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4CAF50" />
                <stop offset="30%" stopColor="#388E3C" />
                <stop offset="60%" stopColor="#66BB6A" />
                <stop offset="100%" stopColor="#2E7D32" />
              </linearGradient>
              <linearGradient id="scallionWhiteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8E8E0" />
                <stop offset="50%" stopColor="#FAFAF8" />
                <stop offset="100%" stopColor="#E8E8E0" />
              </linearGradient>
            </defs>
            {/* Multiple stalks bundled */}
            {[[-3, 0], [0, 2], [3, -1]].map(([offsetX, offsetY], i) => (
              <g key={i} transform={`translate(${offsetX}, ${offsetY})`}>
                {/* Green part */}
                <path
                  d={`M22,6 Q20,20 22,35 L28,35 Q30,20 28,6 Z`}
                  fill="url(#scallionGrad)"
                  stroke="#2E7D32"
                  strokeWidth="0.3"
                />
                {/* White root end */}
                <path
                  d={`M22,35 Q21,40 22,46 L28,46 Q29,40 28,35 Z`}
                  fill="url(#scallionWhiteGrad)"
                  stroke="#D8D8D0"
                  strokeWidth="0.3"
                />
                {/* Root threads */}
                <path d="M23,46 Q22,48 21,50" stroke="#E0D8C8" strokeWidth="0.5" fill="none" />
                <path d="M25,46 Q25,49 25,50" stroke="#E0D8C8" strokeWidth="0.5" fill="none" />
                <path d="M27,46 Q28,48 29,50" stroke="#E0D8C8" strokeWidth="0.5" fill="none" />
              </g>
            ))}
            {/* Highlight on front stalk */}
            <path d="M24,10 L24,30" stroke="#7CB97C" strokeWidth="1" opacity="0.4" />
          </g>
        );

      case 'spinach':
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="spinachCookedGrad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#4A7A4A" />
                  <stop offset="70%" stopColor="#3A6A3A" />
                  <stop offset="100%" stopColor="#2A5A2A" />
                </radialGradient>
              </defs>
              {/* Wilted pile of cooked spinach */}
              <ellipse cx="25" cy="35" rx="18" ry="10" fill="url(#spinachCookedGrad)" opacity="0.9" />
              {/* Wilted leaf shapes */}
              <path d="M10,32 Q15,25 22,30 Q18,35 10,32" fill="#4A8050" opacity="0.8" />
              <path d="M20,28 Q28,22 35,28 Q30,35 20,28" fill="#3D7040" opacity="0.9" />
              <path d="M30,30 Q38,26 42,32 Q36,38 30,30" fill="#458548" opacity="0.8" />
              <path d="M15,36 Q22,32 28,38 Q20,42 15,36" fill="#3C6838" opacity="0.85" />
              <path d="M28,36 Q35,32 40,38 Q33,42 28,36" fill="#427542" opacity="0.8" />
              {/* Slight sheen */}
              <ellipse cx="25" cy="30" rx="5" ry="3" fill="#6A9A6A" opacity="0.3" />
            </g>
          );
        }
        // Raw spinach leaves
        return (
          <g>
            <defs>
              <linearGradient id="spinachLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4CAF50" />
                <stop offset="50%" stopColor="#388E3C" />
                <stop offset="100%" stopColor="#2E7D32" />
              </linearGradient>
            </defs>
            {/* Multiple fresh spinach leaves */}
            {[[25, 12, 0], [15, 22, -20], [35, 22, 20], [20, 34, -10], [30, 34, 10]].map(([x, y, rot], i) => (
              <g key={i} transform={`translate(${x}, ${y}) rotate(${rot})`}>
                {/* Leaf shape */}
                <path
                  d="M0,-8 Q-8,-4 -6,4 Q-4,8 0,10 Q4,8 6,4 Q8,-4 0,-8"
                  fill="url(#spinachLeafGrad)"
                  stroke="#2E7D32"
                  strokeWidth="0.3"
                />
                {/* Central vein */}
                <path d="M0,-6 L0,8" stroke="#5EAC5E" strokeWidth="0.8" fill="none" />
                {/* Side veins */}
                <path d="M0,0 Q-3,2 -4,4" stroke="#5EAC5E" strokeWidth="0.4" fill="none" />
                <path d="M0,0 Q3,2 4,4" stroke="#5EAC5E" strokeWidth="0.4" fill="none" />
                <path d="M0,-3 Q-2,0 -3,1" stroke="#5EAC5E" strokeWidth="0.4" fill="none" />
                <path d="M0,-3 Q2,0 3,1" stroke="#5EAC5E" strokeWidth="0.4" fill="none" />
              </g>
            ))}
          </g>
        );

      case 'bokChoy':
        if (state === 'chopped') {
          return (
            <g>
              <defs>
                <linearGradient id="bokChopGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4CAF50" />
                  <stop offset="100%" stopColor="#2E7D32" />
                </linearGradient>
              </defs>
              {/* Chopped bok choy pieces - mix of white stems and green leaves */}
              {/* White stem pieces */}
              {[[12, 15], [28, 12], [40, 20], [15, 35], [32, 32]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y}) rotate(${(i * 30) - 60})`}>
                  <path d="M0,-5 Q-4,0 0,5 Q4,0 0,-5" fill="#F5F5F0" stroke="#E0E0D8" strokeWidth="0.3" />
                </g>
              ))}
              {/* Green leaf pieces */}
              {[[20, 22], [36, 28], [10, 30], [25, 40], [42, 38]].map(([x, y], i) => (
                <g key={`g${i}`} transform={`translate(${x}, ${y}) rotate(${(i * 40) - 80})`}>
                  <ellipse cx="0" cy="0" rx="6" ry="4" fill="url(#bokChopGreenGrad)" stroke="#1B5E20" strokeWidth="0.3" />
                  <path d="M-4,0 L4,0" stroke="#5EAC5E" strokeWidth="0.5" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="bokCookedGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5A9A5A" />
                  <stop offset="100%" stopColor="#3A7A3A" />
                </linearGradient>
                <linearGradient id="bokCookedStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E0DDD0" />
                  <stop offset="50%" stopColor="#F0EDE5" />
                  <stop offset="100%" stopColor="#E0DDD0" />
                </linearGradient>
              </defs>
              {/* Cooked bok choy - wilted but still identifiable */}
              {[[-6, 0], [0, 2], [6, -1]].map(([offsetX, offsetY], i) => (
                <g key={i} transform={`translate(${25 + offsetX}, ${28 + offsetY})`}>
                  {/* Wilted green leaf */}
                  <path
                    d="M0,-15 Q-8,-8 -6,0 Q-3,5 0,8 Q3,5 6,0 Q8,-8 0,-15"
                    fill="url(#bokCookedGreenGrad)"
                    opacity="0.85"
                  />
                  {/* Cooked stem */}
                  <path
                    d="M-3,8 Q-4,14 -2,18 L2,18 Q4,14 3,8 Z"
                    fill="url(#bokCookedStemGrad)"
                    stroke="#C8C0B0"
                    strokeWidth="0.3"
                  />
                </g>
              ))}
              {/* Slight oil sheen */}
              <ellipse cx="25" cy="20" rx="4" ry="2" fill="#FFF8E0" opacity="0.25" />
            </g>
          );
        }
        // Whole bok choy
        return (
          <g>
            <defs>
              <linearGradient id="bokChoyGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4CAF50" />
                <stop offset="50%" stopColor="#388E3C" />
                <stop offset="100%" stopColor="#2E7D32" />
              </linearGradient>
              <linearGradient id="bokChoyStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8E8E0" />
                <stop offset="50%" stopColor="#FAFAF8" />
                <stop offset="100%" stopColor="#E8E8E0" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="14" ry="3" fill="rgba(0,0,0,0.1)" />
            {/* Multiple leaves/stalks */}
            {[[-8, 0], [-4, 2], [0, 0], [4, 2], [8, 0]].map(([offsetX, offsetY], i) => (
              <g key={i} transform={`translate(${25 + offsetX}, ${25 + offsetY})`}>
                {/* Green leaf part */}
                <path
                  d={`M0,-20 Q-10,-10 -8,0 Q-4,8 0,12 Q4,8 8,0 Q10,-10 0,-20`}
                  fill="url(#bokChoyGreenGrad)"
                  stroke="#2E7D32"
                  strokeWidth="0.3"
                />
                {/* Central vein */}
                <path d="M0,-15 L0,10" stroke="#6EBE6E" strokeWidth="1" fill="none" />
                {/* White stem/base */}
                <path
                  d={`M-4,12 Q-5,18 -3,22 L3,22 Q5,18 4,12 Z`}
                  fill="url(#bokChoyStemGrad)"
                  stroke="#D8D8D0"
                  strokeWidth="0.3"
                />
              </g>
            ))}
            {/* Highlight */}
            <ellipse cx="22" cy="12" rx="3" ry="4" fill="#7FCF7F" opacity="0.3" />
          </g>
        );

      case 'potato':
        if (state === 'diced') {
          return (
            <g>
              <defs>
                <linearGradient id="potatoDicedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8E8" />
                  <stop offset="50%" stopColor="#F5E8C8" />
                  <stop offset="100%" stopColor="#E8D8B0" />
                </linearGradient>
              </defs>
              {/* Multiple diced potato cubes */}
              {[[12, 14], [26, 10], [38, 16], [10, 28], [24, 26], [38, 30], [16, 40], [30, 38]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  {/* Cube shape - 3D effect */}
                  <polygon points="0,-4 6,-2 6,4 0,6 -6,4 -6,-2" fill="url(#potatoDicedGrad)" stroke="#D0C090" strokeWidth="0.4" />
                  {/* Top face - lighter */}
                  <polygon points="0,-4 6,-2 0,0 -6,-2" fill="#FFF8E0" stroke="#D8C8A0" strokeWidth="0.2" />
                  {/* Slight texture dots */}
                  <circle cx="-2" cy="1" r="0.8" fill="#D8C890" opacity="0.4" />
                  <circle cx="2" cy="2" r="0.6" fill="#D0C080" opacity="0.3" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <linearGradient id="potatoCookedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F0E0B0" />
                  <stop offset="50%" stopColor="#E8D090" />
                  <stop offset="100%" stopColor="#D8C080" />
                </linearGradient>
              </defs>
              {/* Cooked potato cubes - slightly browned */}
              {[[12, 14], [26, 10], [38, 16], [10, 28], [24, 26], [38, 30], [16, 40], [30, 38]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <polygon points="0,-4 6,-2 6,4 0,6 -6,4 -6,-2" fill="url(#potatoCookedGrad)" stroke="#B8A870" strokeWidth="0.5" />
                  <polygon points="0,-4 6,-2 0,0 -6,-2" fill="#F5E8C0" stroke="#C8B880" strokeWidth="0.2" />
                  {/* Browned spots */}
                  <circle cx="-3" cy="2" r="1.2" fill="#C8A860" opacity="0.5" />
                  <circle cx="3" cy="0" r="0.8" fill="#D0B070" opacity="0.4" />
                </g>
              ))}
              {/* Slight butter sheen */}
              <ellipse cx="24" cy="12" rx="3" ry="1.5" fill="#FFF8A0" opacity="0.3" />
            </g>
          );
        }
        // Whole potato
        return (
          <g>
            <defs>
              <radialGradient id="potatoGrad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#C8A878" />
                <stop offset="50%" stopColor="#A88858" />
                <stop offset="100%" stopColor="#806838" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="42" rx="14" ry="4" fill="rgba(0,0,0,0.12)" />
            {/* Main potato body - irregular oval */}
            <ellipse cx="25" cy="26" rx="18" ry="14" fill="url(#potatoGrad)" stroke="#705828" strokeWidth="0.6" />
            {/* Skin texture - small darker spots */}
            <circle cx="14" cy="22" r="1.5" fill="#785028" opacity="0.5" />
            <circle cx="32" cy="18" r="1" fill="#785028" opacity="0.4" />
            <circle cx="20" cy="32" r="1.2" fill="#785028" opacity="0.45" />
            <circle cx="36" cy="28" r="1" fill="#785028" opacity="0.4" />
            <circle cx="28" cy="20" r="0.8" fill="#705020" opacity="0.35" />
            {/* Eye indentations */}
            <ellipse cx="18" cy="26" rx="2" ry="1.5" fill="#907048" opacity="0.4" />
            <ellipse cx="30" cy="24" rx="1.5" ry="1" fill="#907048" opacity="0.35" />
            {/* Highlight */}
            <ellipse cx="20" cy="18" rx="4" ry="2.5" fill="#D8B888" opacity="0.4" />
          </g>
        );

      case 'sweetPotato':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <radialGradient id="sweetPotatoSliceGrad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#FF9040" />
                  <stop offset="60%" stopColor="#E87020" />
                  <stop offset="100%" stopColor="#D05010" />
                </radialGradient>
              </defs>
              {/* Multiple sliced rounds */}
              {[[12, 14], [28, 10], [40, 18], [16, 30], [32, 28], [24, 42]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  {/* Slice - orange flesh */}
                  <ellipse cx="0" cy="0" rx="8" ry="5" fill="url(#sweetPotatoSliceGrad)" stroke="#B04010" strokeWidth="0.4" />
                  {/* Skin edge - darker purple-brown */}
                  <ellipse cx="0" cy="0" rx="8" ry="5" fill="none" stroke="#803828" strokeWidth="1.5" />
                  {/* Inner texture rings */}
                  <ellipse cx="0" cy="0" rx="5" ry="3" fill="none" stroke="#FF8030" strokeWidth="0.5" opacity="0.5" />
                  <ellipse cx="0" cy="0" rx="2.5" ry="1.5" fill="#FFA050" opacity="0.4" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'cooked') {
          return (
            <g>
              <defs>
                <radialGradient id="sweetPotatoCookedGrad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#FF8830" />
                  <stop offset="60%" stopColor="#E06820" />
                  <stop offset="100%" stopColor="#C05818" />
                </radialGradient>
              </defs>
              {/* Cooked slices - slightly caramelized */}
              {[[12, 14], [28, 10], [40, 18], [16, 30], [32, 28], [24, 42]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <ellipse cx="0" cy="0" rx="7" ry="4.5" fill="url(#sweetPotatoCookedGrad)" stroke="#904020" strokeWidth="0.5" />
                  <ellipse cx="0" cy="0" rx="7" ry="4.5" fill="none" stroke="#603020" strokeWidth="1.2" />
                  {/* Caramelized spots */}
                  <circle cx="-2" cy="-1" r="1.5" fill="#C04810" opacity="0.4" />
                  <circle cx="3" cy="1" r="1" fill="#B85020" opacity="0.35" />
                </g>
              ))}
              {/* Butter/glaze sheen */}
              <ellipse cx="28" cy="12" rx="4" ry="2" fill="#FFD880" opacity="0.35" />
            </g>
          );
        }
        // Whole sweet potato
        return (
          <g>
            <defs>
              <linearGradient id="sweetPotatoSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A04030" />
                <stop offset="50%" stopColor="#803028" />
                <stop offset="100%" stopColor="#602020" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.12)" />
            {/* Main sweet potato body - elongated, tapered */}
            <path
              d="M8,28 Q5,24 10,18 Q18,10 30,12 Q42,14 44,24 Q44,32 38,36 Q28,42 16,38 Q8,34 8,28 Z"
              fill="url(#sweetPotatoSkinGrad)"
              stroke="#501818"
              strokeWidth="0.6"
            />
            {/* Skin texture - slight ridges */}
            <path d="M12,22 Q20,18 28,20" stroke="#904038" strokeWidth="1" fill="none" opacity="0.4" />
            <path d="M16,30 Q26,26 36,28" stroke="#904038" strokeWidth="0.8" fill="none" opacity="0.3" />
            {/* Highlight */}
            <ellipse cx="22" cy="18" rx="5" ry="3" fill="#C06050" opacity="0.35" />
            {/* Darker spots */}
            <circle cx="34" cy="24" r="2" fill="#602828" opacity="0.3" />
            <circle cx="14" cy="28" r="1.5" fill="#582020" opacity="0.25" />
          </g>
        );

      case 'fishSauce':
        // Amber-brown clear liquid in bottle
        return (
          <g>
            <defs>
              <linearGradient id="fishSauceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4A060" />
                <stop offset="50%" stopColor="#B07830" />
                <stop offset="100%" stopColor="#8B5A20" />
              </linearGradient>
              <linearGradient id="fishSauceBottle" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8E0D8" />
                <stop offset="20%" stopColor="#F8F4F0" />
                <stop offset="80%" stopColor="#F8F4F0" />
                <stop offset="100%" stopColor="#D8D0C8" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.1)" />
            {/* Bottle body */}
            <path d="M18,44 L18,20 Q18,16 25,16 Q32,16 32,20 L32,44 Z" fill="url(#fishSauceBottle)" stroke="#A0988A" strokeWidth="0.5" />
            {/* Liquid inside */}
            <rect x="19" y="22" width="12" height="20" rx="1" fill="url(#fishSauceGrad)" opacity="0.9" />
            {/* Bottle neck */}
            <rect x="22" y="10" width="6" height="6" rx="1" fill="url(#fishSauceBottle)" stroke="#A0988A" strokeWidth="0.5" />
            {/* Cap */}
            <rect x="21" y="6" width="8" height="5" rx="1" fill="#8B4513" stroke="#5D3010" strokeWidth="0.3" />
            {/* Label hint */}
            <rect x="19" y="28" width="12" height="8" fill="#FFF8E8" opacity="0.6" />
            <text x="25" y="34" fontSize="4" fill="#5A4020" textAnchor="middle">魚</text>
            {/* Liquid shimmer */}
            <ellipse cx="24" cy="26" rx="2" ry="3" fill="#E8C080" opacity="0.4" />
          </g>
        );

      case 'oysterSauce':
        // Dark brown thick sauce in bottle
        return (
          <g>
            <defs>
              <linearGradient id="oysterSauceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4A3020" />
                <stop offset="50%" stopColor="#3A2418" />
                <stop offset="100%" stopColor="#2A1810" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="9" ry="2" fill="rgba(0,0,0,0.12)" />
            {/* Bottle - wider, squat */}
            <path d="M15,44 L15,22 Q15,18 25,18 Q35,18 35,22 L35,44 Q35,46 25,46 Q15,46 15,44 Z" fill="#F0E8E0" stroke="#B0A090" strokeWidth="0.5" />
            {/* Dark sauce inside */}
            <rect x="17" y="24" width="16" height="18" rx="2" fill="url(#oysterSauceGrad)" />
            {/* Bottle neck */}
            <rect x="22" y="12" width="6" height="6" rx="1" fill="#F0E8E0" stroke="#B0A090" strokeWidth="0.4" />
            {/* Red cap */}
            <rect x="21" y="6" width="8" height="6" rx="1.5" fill="#C41E3A" stroke="#8B0000" strokeWidth="0.3" />
            {/* Cap top */}
            <ellipse cx="25" cy="7" rx="3.5" ry="1" fill="#D82E4E" />
            {/* Label */}
            <rect x="17" y="28" width="16" height="10" fill="#FFE4B5" opacity="0.8" />
            <text x="25" y="35" fontSize="4" fill="#3A2010" textAnchor="middle">蠔油</text>
            {/* Shine */}
            <ellipse cx="22" cy="30" rx="2" ry="4" fill="#6A5040" opacity="0.3" />
          </g>
        );

      case 'sesameOil':
        // Amber oil with golden sheen
        return (
          <g>
            <defs>
              <linearGradient id="sesameOilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4A030" />
                <stop offset="50%" stopColor="#C08820" />
                <stop offset="100%" stopColor="#A07018" />
              </linearGradient>
              <linearGradient id="sesameBottle" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D8B870" />
                <stop offset="30%" stopColor="#F0D890" />
                <stop offset="70%" stopColor="#F0D890" />
                <stop offset="100%" stopColor="#C8A860" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="7" ry="2" fill="rgba(0,0,0,0.1)" />
            {/* Tall bottle */}
            <path d="M19,44 L19,18 Q19,14 25,14 Q31,14 31,18 L31,44 Z" fill="url(#sesameBottle)" stroke="#A08040" strokeWidth="0.5" opacity="0.6" />
            {/* Oil inside - golden */}
            <rect x="20" y="20" width="10" height="22" rx="1" fill="url(#sesameOilGrad)" opacity="0.85" />
            {/* Bottle neck */}
            <rect x="23" y="8" width="4" height="6" rx="1" fill="url(#sesameBottle)" stroke="#A08040" strokeWidth="0.3" opacity="0.6" />
            {/* Black cap */}
            <rect x="22" y="4" width="6" height="5" rx="1" fill="#2A2A2A" stroke="#1A1A1A" strokeWidth="0.3" />
            {/* Oil shimmer - characteristic of sesame oil */}
            <ellipse cx="24" cy="28" rx="2" ry="5" fill="#E8C050" opacity="0.5" />
            <ellipse cx="26" cy="35" rx="1.5" ry="3" fill="#D8B040" opacity="0.4" />
            {/* Sesame seeds floating hint */}
            <circle cx="23" cy="38" r="0.8" fill="#F0D870" opacity="0.6" />
            <circle cx="27" cy="40" r="0.6" fill="#E8C860" opacity="0.5" />
          </g>
        );

      case 'mirin':
        // Light amber/gold sweet rice wine
        return (
          <g>
            <defs>
              <linearGradient id="mirinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8E8B0" />
                <stop offset="50%" stopColor="#E8D090" />
                <stop offset="100%" stopColor="#D4B870" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.1)" />
            {/* Traditional bottle shape */}
            <path d="M17,44 L17,22 Q17,18 25,18 Q33,18 33,22 L33,44 Z" fill="#F8F4F0" stroke="#C0B8A8" strokeWidth="0.5" />
            {/* Light amber liquid */}
            <rect x="18" y="24" width="14" height="18" rx="1" fill="url(#mirinGrad)" opacity="0.8" />
            {/* Narrow neck */}
            <rect x="23" y="10" width="4" height="8" rx="1" fill="#F8F4F0" stroke="#C0B8A8" strokeWidth="0.4" />
            {/* Green cap */}
            <rect x="22" y="5" width="6" height="6" rx="1" fill="#228B22" stroke="#1B6B1B" strokeWidth="0.3" />
            {/* Label */}
            <rect x="18" y="28" width="14" height="10" fill="#FFF8F0" opacity="0.7" />
            <text x="25" y="35" fontSize="4" fill="#8B4513" textAnchor="middle">味醂</text>
            {/* Liquid clarity highlight */}
            <ellipse cx="23" cy="30" rx="2" ry="4" fill="#FFF8E0" opacity="0.4" />
          </g>
        );

      case 'sake':
        // Clear/light rice wine
        return (
          <g>
            <defs>
              <linearGradient id="sakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8F8F8" />
                <stop offset="50%" stopColor="#F0F0F0" />
                <stop offset="100%" stopColor="#E8E8E8" />
              </linearGradient>
              <linearGradient id="sakeBottle" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D0E8D0" />
                <stop offset="50%" stopColor="#E8F8E8" />
                <stop offset="100%" stopColor="#C0D8C0" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.08)" />
            {/* Classic sake bottle - green glass */}
            <path d="M17,44 L17,20 Q17,14 25,14 Q33,14 33,20 L33,44 Z" fill="url(#sakeBottle)" stroke="#90A890" strokeWidth="0.5" opacity="0.7" />
            {/* Clear liquid */}
            <rect x="18" y="22" width="14" height="20" rx="1" fill="url(#sakeGrad)" opacity="0.6" />
            {/* Bottle neck - elongated */}
            <rect x="23" y="6" width="4" height="8" rx="1" fill="url(#sakeBottle)" stroke="#90A890" strokeWidth="0.4" opacity="0.7" />
            {/* Silver/white cap */}
            <rect x="22" y="2" width="6" height="5" rx="1" fill="#E8E8E8" stroke="#B8B8B8" strokeWidth="0.3" />
            {/* Label - traditional style */}
            <rect x="18" y="26" width="14" height="12" fill="#FFF8F0" opacity="0.85" />
            <text x="25" y="34" fontSize="5" fill="#2A2A2A" textAnchor="middle">酒</text>
            {/* Glass reflection */}
            <path d="M20,26 L20,38" stroke="#FFF" strokeWidth="1" opacity="0.3" />
          </g>
        );

      case 'chiliOil':
        // Red oil with visible chili flakes
        return (
          <g>
            <defs>
              <linearGradient id="chiliOilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E84020" />
                <stop offset="40%" stopColor="#D03018" />
                <stop offset="100%" stopColor="#A02010" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.1)" />
            {/* Glass jar */}
            <path d="M16,44 L16,18 Q16,14 25,14 Q34,14 34,18 L34,44 Z" fill="#F8F4F0" stroke="#D0C8C0" strokeWidth="0.5" opacity="0.5" />
            {/* Red chili oil */}
            <rect x="17" y="20" width="16" height="22" rx="2" fill="url(#chiliOilGrad)" opacity="0.9" />
            {/* Chili flakes floating */}
            <ellipse cx="20" cy="24" rx="1.5" ry="0.8" fill="#8B0000" transform="rotate(-20 20 24)" />
            <ellipse cx="28" cy="28" rx="1.2" ry="0.6" fill="#A01010" transform="rotate(15 28 28)" />
            <ellipse cx="24" cy="32" rx="1" ry="0.5" fill="#900808" transform="rotate(-10 24 32)" />
            <ellipse cx="22" cy="38" rx="1.3" ry="0.7" fill="#8B0000" transform="rotate(25 22 38)" />
            <ellipse cx="29" cy="36" rx="1" ry="0.5" fill="#950C0C" transform="rotate(-5 29 36)" />
            {/* Seeds */}
            <circle cx="26" cy="26" r="0.6" fill="#F0E0B0" opacity="0.7" />
            <circle cx="21" cy="34" r="0.5" fill="#E8D8A0" opacity="0.6" />
            {/* Jar lid */}
            <rect x="18" y="12" width="14" height="4" rx="1" fill="#D02020" stroke="#A01818" strokeWidth="0.3" />
            <ellipse cx="25" cy="12" rx="6" ry="1.5" fill="#E03030" />
            {/* Oil sheen */}
            <ellipse cx="22" cy="26" rx="2" ry="3" fill="#FF6040" opacity="0.3" />
          </g>
        );

      case 'hoiSin':
        // Dark reddish-brown thick sauce
        return (
          <g>
            <defs>
              <linearGradient id="hoisinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5A2020" />
                <stop offset="50%" stopColor="#4A1818" />
                <stop offset="100%" stopColor="#3A1010" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="46" rx="9" ry="2" fill="rgba(0,0,0,0.12)" />
            {/* Wide bottle */}
            <path d="M14,44 L14,20 Q14,16 25,16 Q36,16 36,20 L36,44 Q36,46 25,46 Q14,46 14,44 Z" fill="#F8F0E8" stroke="#C8B8A8" strokeWidth="0.5" />
            {/* Dark sauce */}
            <rect x="16" y="22" width="18" height="20" rx="2" fill="url(#hoisinGrad)" />
            {/* Bottle neck */}
            <rect x="22" y="10" width="6" height="6" rx="1" fill="#F8F0E8" stroke="#C8B8A8" strokeWidth="0.4" />
            {/* Yellow cap */}
            <rect x="21" y="4" width="8" height="7" rx="1.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3" />
            <ellipse cx="25" cy="5" rx="3.5" ry="1" fill="#FFE040" />
            {/* Label */}
            <rect x="16" y="26" width="18" height="12" fill="#FFF0E0" opacity="0.85" />
            <text x="25" y="34" fontSize="4" fill="#5A2020" textAnchor="middle">海鮮</text>
            {/* Thick sauce highlight */}
            <ellipse cx="22" cy="34" rx="2" ry="3" fill="#7A3030" opacity="0.3" />
          </g>
        );

      case 'chiliFlakes':
        // Red chili flakes in a small pile
        return (
          <g>
            <defs>
              <radialGradient id="chiliFlakeGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E03020" />
                <stop offset="60%" stopColor="#C02018" />
                <stop offset="100%" stopColor="#8B0000" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="14" ry="5" fill="rgba(0,0,0,0.1)" />
            {/* Main pile */}
            <ellipse cx="25" cy="32" rx="14" ry="8" fill="url(#chiliFlakeGrad)" />
            {/* Individual flakes scattered on top */}
            {[[18, 28], [25, 26], [32, 28], [20, 32], [28, 30], [15, 34], [35, 34], [22, 36], [30, 35]].map(([x, y], i) => (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={1.5 + (i % 3) * 0.5}
                ry={0.8}
                fill={['#D42020', '#B81818', '#A01010'][i % 3]}
                transform={`rotate(${(i * 40) - 80} ${x} ${y})`}
              />
            ))}
            {/* Seeds visible */}
            <circle cx="24" cy="30" r="1" fill="#F0E0A0" opacity="0.7" />
            <circle cx="28" cy="34" r="0.8" fill="#E8D890" opacity="0.6" />
            <circle cx="20" cy="33" r="0.6" fill="#F0E0A0" opacity="0.5" />
            {/* Highlight */}
            <ellipse cx="22" cy="28" rx="3" ry="2" fill="#FF4030" opacity="0.3" />
          </g>
        );

      case 'paprika':
        // Bright red-orange powder
        return (
          <g>
            <defs>
              <radialGradient id="paprikaGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#E04020" />
                <stop offset="50%" stopColor="#C83018" />
                <stop offset="100%" stopColor="#A02010" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="14" ry="5" fill="rgba(0,0,0,0.1)" />
            {/* Main powder pile - smooth mound */}
            <ellipse cx="25" cy="32" rx="14" ry="10" fill="url(#paprikaGrad)" />
            {/* Powder texture - fine particles */}
            <ellipse cx="20" cy="28" rx="4" ry="3" fill="#D83020" opacity="0.4" />
            <ellipse cx="30" cy="30" rx="3" ry="2" fill="#B02818" opacity="0.3" />
            <ellipse cx="25" cy="34" rx="5" ry="3" fill="#C02818" opacity="0.25" />
            {/* Smooth powder highlight */}
            <ellipse cx="22" cy="26" rx="4" ry="2.5" fill="#F05030" opacity="0.35" />
            {/* Small spoon or indent */}
            <path d="M30,30 Q33,28 35,30 Q34,32 30,30" fill="#A81810" opacity="0.4" />
          </g>
        );

      case 'cumin':
        // Brown powder with visible seeds
        return (
          <g>
            <defs>
              <radialGradient id="cuminGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#B08040" />
                <stop offset="50%" stopColor="#906830" />
                <stop offset="100%" stopColor="#705020" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="14" ry="5" fill="rgba(0,0,0,0.1)" />
            {/* Main powder pile */}
            <ellipse cx="25" cy="32" rx="14" ry="10" fill="url(#cuminGrad)" />
            {/* Cumin seeds on top */}
            {[[18, 28], [24, 26], [30, 28], [20, 32], [27, 30], [33, 32], [22, 35], [28, 34]].map(([x, y], i) => (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={2}
                ry={0.8}
                fill={['#8B6914', '#A07820', '#7A5A10'][i % 3]}
                transform={`rotate(${(i * 25) - 50} ${x} ${y})`}
              />
            ))}
            {/* Ridged seed detail */}
            {[[20, 30], [26, 28], [32, 31]].map(([x, y], i) => (
              <path key={`r${i}`} d={`M${x-1.5},${y} L${x+1.5},${y}`} stroke="#604010" strokeWidth="0.3" />
            ))}
            {/* Highlight */}
            <ellipse cx="22" cy="27" rx="3" ry="2" fill="#C89850" opacity="0.3" />
          </g>
        );

      case 'turmeric':
        // Bright yellow-orange powder
        return (
          <g>
            <defs>
              <radialGradient id="turmericGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFB020" />
                <stop offset="50%" stopColor="#E89810" />
                <stop offset="100%" stopColor="#CC8000" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="14" ry="5" fill="rgba(0,0,0,0.1)" />
            {/* Main powder pile - bright yellow */}
            <ellipse cx="25" cy="32" rx="14" ry="10" fill="url(#turmericGrad)" />
            {/* Powder texture variations */}
            <ellipse cx="20" cy="28" rx="4" ry="3" fill="#FFC030" opacity="0.5" />
            <ellipse cx="30" cy="30" rx="3" ry="2" fill="#D88810" opacity="0.4" />
            <ellipse cx="24" cy="34" rx="5" ry="3" fill="#E89010" opacity="0.3" />
            {/* Bright highlight - turmeric is very vibrant */}
            <ellipse cx="22" cy="26" rx="5" ry="3" fill="#FFD040" opacity="0.45" />
            {/* Root piece hint */}
            <path d="M32,32 Q35,30 36,33 Q34,35 32,32" fill="#C07808" opacity="0.5" />
          </g>
        );

      case 'curryPowder':
        // Golden yellow blend with visible spice bits
        return (
          <g>
            <defs>
              <radialGradient id="curryGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#D4A020" />
                <stop offset="50%" stopColor="#B88818" />
                <stop offset="100%" stopColor="#906810" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="14" ry="5" fill="rgba(0,0,0,0.1)" />
            {/* Main powder pile */}
            <ellipse cx="25" cy="32" rx="14" ry="10" fill="url(#curryGrad)" />
            {/* Mixed spice bits - different colored specks */}
            <circle cx="18" cy="29" r="1" fill="#CC2020" opacity="0.6" /> {/* red chili */}
            <circle cx="24" cy="27" r="0.8" fill="#E8B010" opacity="0.7" /> {/* turmeric */}
            <circle cx="30" cy="28" r="1" fill="#8B4513" opacity="0.5" /> {/* cumin */}
            <circle cx="21" cy="33" r="0.7" fill="#C08040" opacity="0.6" /> {/* coriander */}
            <circle cx="28" cy="32" r="0.9" fill="#A06030" opacity="0.5" />
            <circle cx="33" cy="31" r="0.6" fill="#CC3030" opacity="0.5" />
            {/* Powder texture */}
            <ellipse cx="22" cy="30" rx="4" ry="2.5" fill="#C89820" opacity="0.35" />
            {/* Highlight */}
            <ellipse cx="21" cy="26" rx="4" ry="2.5" fill="#E8B830" opacity="0.4" />
          </g>
        );

      case 'fiveSpice':
        // Brown aromatic blend
        return (
          <g>
            <defs>
              <radialGradient id="fiveSpiceGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#8B6040" />
                <stop offset="50%" stopColor="#704830" />
                <stop offset="100%" stopColor="#503020" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="14" ry="5" fill="rgba(0,0,0,0.1)" />
            {/* Main powder pile */}
            <ellipse cx="25" cy="32" rx="14" ry="10" fill="url(#fiveSpiceGrad)" />
            {/* Distinctive spice elements */}
            {/* Star anise piece */}
            <path d="M18,28 L19,26 L20,28 L22,27 L20,29 L21,31 L19,30 L17,31 L18,29 L16,27 Z" fill="#4A3020" opacity="0.7" transform="scale(0.5) translate(26, 50)" />
            {/* Cinnamon bark bit */}
            <rect x="28" y="30" width="4" height="1.5" rx="0.5" fill="#8B4513" opacity="0.6" transform="rotate(-15 30 31)" />
            {/* Clove */}
            <ellipse cx="22" cy="34" rx="1" ry="1.5" fill="#3A2010" opacity="0.6" />
            {/* Fennel seeds */}
            <ellipse cx="31" cy="33" rx="1.2" ry="0.5" fill="#7A6040" transform="rotate(20 31 33)" opacity="0.5" />
            {/* Szechuan peppercorn */}
            <circle cx="26" cy="28" r="1.2" fill="#6A4030" opacity="0.5" />
            {/* Highlight */}
            <ellipse cx="22" cy="27" rx="3" ry="2" fill="#A08060" opacity="0.35" />
          </g>
        );

      case 'cinnamon':
        // Cinnamon sticks with powder
        return (
          <g>
            <defs>
              <linearGradient id="cinnamonStickGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A0522D" />
                <stop offset="50%" stopColor="#8B4513" />
                <stop offset="100%" stopColor="#6B3510" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="42" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
            {/* Cinnamon sticks - rolled bark */}
            {[[15, 30, -10], [25, 26, 5], [35, 32, -5]].map(([x, y, rot], i) => (
              <g key={i} transform={`translate(${x}, ${y}) rotate(${rot})`}>
                {/* Outer bark */}
                <rect x="-12" y="-3" width="24" height="6" rx="3" fill="url(#cinnamonStickGrad)" stroke="#5A2D0D" strokeWidth="0.4" />
                {/* Inner curl lines */}
                <path d="M-10,-1 C-8,0 -6,-1 -4,0 C-2,-1 0,0 2,-1 C4,0 6,-1 8,0" stroke="#6B3510" strokeWidth="0.5" fill="none" />
                <path d="M-10,1 C-8,2 -6,1 -4,2 C-2,1 0,2 2,1 C4,2 6,1 8,2" stroke="#5A2D0D" strokeWidth="0.4" fill="none" />
                {/* Highlight */}
                <rect x="-10" y="-2" width="18" height="1.5" rx="0.5" fill="#B86B3D" opacity="0.3" />
              </g>
            ))}
            {/* Powder scattered */}
            <ellipse cx="25" cy="38" rx="8" ry="3" fill="#A0522D" opacity="0.4" />
          </g>
        );

      case 'starAnise':
        // Distinctive 8-pointed star shape
        return (
          <g>
            <defs>
              <radialGradient id="starAniseGrad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#6A4030" />
                <stop offset="60%" stopColor="#4A2820" />
                <stop offset="100%" stopColor="#3A1810" />
              </radialGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="40" rx="12" ry="4" fill="rgba(0,0,0,0.1)" />
            {/* Main star anise - 8 pointed */}
            <g transform="translate(25, 28)">
              {/* 8 pods radiating from center */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <g key={i} transform={`rotate(${angle})`}>
                  {/* Pod */}
                  <path
                    d="M0,0 L-2,6 Q0,12 2,6 Z"
                    fill="url(#starAniseGrad)"
                    stroke="#2A1008"
                    strokeWidth="0.3"
                  />
                  {/* Seed cavity */}
                  <ellipse cx="0" cy="6" rx="1" ry="1.5" fill="#1A0A04" opacity="0.5" />
                  {/* Shiny seed */}
                  <ellipse cx="0" cy="5.5" rx="0.8" ry="1" fill="#5A3020" />
                  <ellipse cx="-0.2" cy="5" rx="0.3" ry="0.4" fill="#8A6050" opacity="0.6" />
                </g>
              ))}
              {/* Center */}
              <circle cx="0" cy="0" r="3" fill="#3A2010" stroke="#2A1008" strokeWidth="0.3" />
              <circle cx="-0.5" cy="-0.5" r="1" fill="#5A4030" opacity="0.4" />
            </g>
            {/* Second smaller star anise */}
            <g transform="translate(38, 36) scale(0.5)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <g key={i} transform={`rotate(${angle})`}>
                  <path d="M0,0 L-2,6 Q0,10 2,6 Z" fill="#4A2820" stroke="#2A1008" strokeWidth="0.4" />
                </g>
              ))}
              <circle cx="0" cy="0" r="2.5" fill="#3A2010" />
            </g>
          </g>
        );

      case 'wonton':
        // Square wonton wrapper
        return (
          <g>
            <defs>
              <linearGradient id="wontonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8E8" />
                <stop offset="50%" stopColor="#F5ECD8" />
                <stop offset="100%" stopColor="#E8DCC8" />
              </linearGradient>
            </defs>
            {/* Stack of wonton wrappers */}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${i * 0.5}, ${i * -1.5})`}>
                {/* Wrapper - square with slight curve */}
                <path
                  d={`M8,${24 + i} L25,${10 + i} L42,${24 + i} L25,${38 + i} Z`}
                  fill="url(#wontonGrad)"
                  stroke="#D4C4A8"
                  strokeWidth="0.4"
                  opacity={1 - i * 0.15}
                />
                {/* Flour dust texture */}
                <circle cx={15 + i * 5} cy={22 - i} r="1" fill="#FFF" opacity="0.3" />
                <circle cx={32 - i * 3} cy={26 - i} r="0.8" fill="#FFF" opacity="0.25" />
              </g>
            ))}
            {/* Edge detail on top wrapper */}
            <path d="M12,22 L25,12 L38,22" stroke="#E0D0B8" strokeWidth="0.5" fill="none" opacity="0.5" />
            {/* Slight translucency effect */}
            <ellipse cx="25" cy="24" rx="8" ry="6" fill="#FFF" opacity="0.15" />
          </g>
        );

      case 'springRoll':
        // Round rice paper wrapper
        return (
          <g>
            <defs>
              <radialGradient id="springRollGrad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F8F4F0" />
                <stop offset="100%" stopColor="#E8E4E0" />
              </radialGradient>
            </defs>
            {/* Stack of round rice paper wrappers */}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${i * 0.3}, ${i * -1})`}>
                <ellipse
                  cx="25"
                  cy={28 + i * 0.5}
                  rx="18"
                  ry="14"
                  fill="url(#springRollGrad)"
                  stroke="#D8D4D0"
                  strokeWidth="0.3"
                  opacity={0.9 - i * 0.1}
                />
              </g>
            ))}
            {/* Rice paper texture - crosshatch pattern */}
            <g opacity="0.15">
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={`h${i}`} x1="10" y1={20 + i * 4} x2="40" y2={20 + i * 4} stroke="#C8C4C0" strokeWidth="0.3" />
              ))}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line key={`v${i}`} x1={12 + i * 5} y1="16" x2={12 + i * 5} y2="40" stroke="#C8C4C0" strokeWidth="0.3" />
              ))}
            </g>
            {/* Translucent quality highlight */}
            <ellipse cx="20" cy="22" rx="5" ry="3" fill="#FFF" opacity="0.4" />
          </g>
        );

      case 'tofu':
        if (state === 'diced') {
          return (
            <g>
              <defs>
                <linearGradient id="tofuDicedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFF8" />
                  <stop offset="50%" stopColor="#F8F4E8" />
                  <stop offset="100%" stopColor="#F0ECD8" />
                </linearGradient>
              </defs>
              {/* Diced tofu cubes */}
              {[[12, 14], [26, 10], [38, 16], [10, 28], [24, 26], [38, 30], [16, 40], [30, 38]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  {/* 3D cube */}
                  <polygon points="0,-5 7,-2 7,5 0,8 -7,5 -7,-2" fill="url(#tofuDicedGrad)" stroke="#E0D8C8" strokeWidth="0.4" />
                  <polygon points="0,-5 7,-2 0,1 -7,-2" fill="#FFFFF8" stroke="#E8E0D0" strokeWidth="0.2" />
                  {/* Subtle pore texture */}
                  <circle cx="-2" cy="1" r="0.5" fill="#E8E0D0" opacity="0.4" />
                  <circle cx="2" cy="3" r="0.4" fill="#E8E0D0" opacity="0.3" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'fried') {
          return (
            <g>
              <defs>
                <linearGradient id="tofuFriedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8D8B0" />
                  <stop offset="50%" stopColor="#D4C090" />
                  <stop offset="100%" stopColor="#C0A870" />
                </linearGradient>
              </defs>
              {/* Fried tofu cubes - golden brown */}
              {[[12, 14], [26, 10], [38, 16], [10, 28], [24, 26], [38, 30], [16, 40], [30, 38]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <polygon points="0,-5 7,-2 7,5 0,8 -7,5 -7,-2" fill="url(#tofuFriedGrad)" stroke="#A08050" strokeWidth="0.5" />
                  <polygon points="0,-5 7,-2 0,1 -7,-2" fill="#F0E0C0" stroke="#C8B080" strokeWidth="0.2" />
                  {/* Crispy browned spots */}
                  <circle cx="-3" cy="2" r="1.2" fill="#B09060" opacity="0.5" />
                  <circle cx="3" cy="0" r="0.9" fill="#C8A870" opacity="0.4" />
                </g>
              ))}
              {/* Oil sheen */}
              <ellipse cx="26" cy="12" rx="3" ry="1.5" fill="#FFF8A0" opacity="0.3" />
            </g>
          );
        }
        // Raw tofu block
        return (
          <g>
            <defs>
              <linearGradient id="tofuRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFF8" />
                <stop offset="50%" stopColor="#F8F4E8" />
                <stop offset="100%" stopColor="#F0ECD8" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="42" rx="14" ry="4" fill="rgba(0,0,0,0.08)" />
            {/* Main tofu block - 3D rectangle */}
            <path d="M10,36 L10,20 L25,14 L40,20 L40,36 L25,42 Z" fill="url(#tofuRawGrad)" stroke="#E0D8C8" strokeWidth="0.5" />
            {/* Top face */}
            <path d="M10,20 L25,14 L40,20 L25,26 Z" fill="#FFFFF8" stroke="#E8E0D0" strokeWidth="0.3" />
            {/* Right face slightly darker */}
            <path d="M25,26 L40,20 L40,36 L25,42 Z" fill="#F5F0E0" stroke="#E0D8C8" strokeWidth="0.3" />
            {/* Subtle pore texture */}
            <circle cx="18" cy="28" r="1" fill="#E8E0D0" opacity="0.4" />
            <circle cx="22" cy="32" r="0.8" fill="#E8E0D0" opacity="0.35" />
            <circle cx="15" cy="34" r="0.6" fill="#E8E0D0" opacity="0.3" />
            {/* Water droplets */}
            <ellipse cx="30" cy="18" rx="1.5" ry="0.8" fill="#F0FFFF" opacity="0.5" />
          </g>
        );

      case 'tempeh':
        if (state === 'sliced') {
          return (
            <g>
              <defs>
                <linearGradient id="tempehSliceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E8D8C0" />
                  <stop offset="50%" stopColor="#D4C4A8" />
                  <stop offset="100%" stopColor="#C0B090" />
                </linearGradient>
              </defs>
              {/* Sliced tempeh pieces */}
              {[[12, 16], [28, 12], [40, 20], [16, 32], [32, 30], [24, 44]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <rect x="-8" y="-4" width="16" height="8" rx="1" fill="url(#tempehSliceGrad)" stroke="#A09080" strokeWidth="0.4" />
                  {/* Visible soybean pattern */}
                  {[[-5, -1], [-2, 1], [1, -1], [4, 1], [-3, -2], [2, 2]].map(([bx, by], j) => (
                    <ellipse key={j} cx={bx} cy={by} rx="1.5" ry="1" fill="#D0C0A0" opacity="0.6" />
                  ))}
                  {/* White mycelium binding */}
                  <path d="M-6,-2 Q-3,0 0,-1 Q3,0 6,-2" stroke="#F0E8E0" strokeWidth="0.5" fill="none" opacity="0.5" />
                </g>
              ))}
            </g>
          );
        }
        if (state === 'fried') {
          return (
            <g>
              <defs>
                <linearGradient id="tempehFriedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C8A870" />
                  <stop offset="50%" stopColor="#B89860" />
                  <stop offset="100%" stopColor="#A08050" />
                </linearGradient>
              </defs>
              {/* Fried tempeh pieces - golden brown */}
              {[[12, 16], [28, 12], [40, 20], [16, 32], [32, 30], [24, 44]].map(([x, y], i) => (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <rect x="-8" y="-4" width="16" height="8" rx="1" fill="url(#tempehFriedGrad)" stroke="#806040" strokeWidth="0.5" />
                  {/* Visible soybean pattern - darker when fried */}
                  {[[-5, -1], [-2, 1], [1, -1], [4, 1], [-3, -2], [2, 2]].map(([bx, by], j) => (
                    <ellipse key={j} cx={bx} cy={by} rx="1.5" ry="1" fill="#A08860" opacity="0.5" />
                  ))}
                  {/* Crispy edges */}
                  <path d="M-7,-3 L7,-3" stroke="#907050" strokeWidth="0.8" opacity="0.4" />
                  <path d="M-7,3 L7,3" stroke="#907050" strokeWidth="0.8" opacity="0.4" />
                </g>
              ))}
              {/* Oil sheen */}
              <ellipse cx="28" cy="14" rx="3" ry="1.5" fill="#FFF8A0" opacity="0.3" />
            </g>
          );
        }
        // Raw tempeh block
        return (
          <g>
            <defs>
              <linearGradient id="tempehRawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0E8D8" />
                <stop offset="50%" stopColor="#E0D4C0" />
                <stop offset="100%" stopColor="#D0C4A8" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="42" rx="14" ry="3" fill="rgba(0,0,0,0.1)" />
            {/* Main tempeh block */}
            <rect x="10" y="16" width="30" height="22" rx="2" fill="url(#tempehRawGrad)" stroke="#B0A088" strokeWidth="0.5" />
            {/* White mycelium covering */}
            <rect x="10" y="16" width="30" height="22" rx="2" fill="#FFF8F0" opacity="0.3" />
            {/* Visible soybean pattern */}
            {[[15, 22], [22, 20], [30, 22], [18, 28], [25, 26], [33, 28], [15, 34], [28, 32], [35, 34]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="2.5" ry="1.8" fill="#C8B890" opacity="0.6" />
            ))}
            {/* Mycelium texture lines */}
            <path d="M12,20 Q18,22 24,20 Q30,18 38,20" stroke="#E8E0D8" strokeWidth="0.5" fill="none" opacity="0.6" />
            <path d="M12,30 Q20,28 28,30 Q34,32 38,30" stroke="#E8E0D8" strokeWidth="0.5" fill="none" opacity="0.5" />
          </g>
        );

      case 'cream':
        // Cream in a small bowl or poured
        return (
          <g>
            <defs>
              <radialGradient id="creamGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFFFF8" />
                <stop offset="60%" stopColor="#FFF8E8" />
                <stop offset="100%" stopColor="#F5ECD8" />
              </radialGradient>
              <linearGradient id="creamBowlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8E4E0" />
                <stop offset="50%" stopColor="#F8F4F0" />
                <stop offset="100%" stopColor="#E0DCD8" />
              </linearGradient>
            </defs>
            {/* Shadow */}
            <ellipse cx="25" cy="44" rx="12" ry="3" fill="rgba(0,0,0,0.1)" />
            {/* Small bowl */}
            <ellipse cx="25" cy="38" rx="14" ry="6" fill="url(#creamBowlGrad)" stroke="#C8C4C0" strokeWidth="0.5" />
            <ellipse cx="25" cy="36" rx="12" ry="5" fill="url(#creamBowlGrad)" />
            {/* Cream surface */}
            <ellipse cx="25" cy="32" rx="11" ry="5" fill="url(#creamGrad)" />
            {/* Cream texture - thick and smooth */}
            <ellipse cx="22" cy="30" rx="4" ry="2" fill="#FFFFF8" opacity="0.5" />
            {/* Cream swirl/pour effect */}
            <path d="M20,28 Q25,26 28,30 Q26,32 24,30" fill="#FFFFF8" opacity="0.4" />
            {/* Rich cream highlight */}
            <ellipse cx="20" cy="29" rx="2" ry="1" fill="#FFF" opacity="0.6" />
            {/* Bowl inner rim */}
            <ellipse cx="25" cy="34" rx="11" ry="4" fill="none" stroke="#D8D4D0" strokeWidth="0.5" />
          </g>
        );

      default:
        // Enhanced fallback renderer based on category
        const cat = ingredient?.category || 'unknown';
        const catColors = {
          seafood: { fill: '#FFB5A7', stroke: '#E8968A', inner: '#FA8072' },
          meat: { fill: '#FFD6C4', stroke: '#D4A090', inner: '#E8B8A0' },
          vegetable: { fill: '#98FB98', stroke: '#66CC66', inner: '#7FE87F' },
          starch: { fill: '#FFF8E8', stroke: '#E8D8B8', inner: '#F5ECD8' },
          dairy: { fill: '#FFFEF5', stroke: '#E8E4D0', inner: '#FFF8E0' },
          sauce: { fill: '#8B4513', stroke: '#5D3010', inner: '#A05820' },
          spice: { fill: '#DAA520', stroke: '#B8860B', inner: '#F0C040' },
          wrapper: { fill: '#F5F5DC', stroke: '#D4D4AA', inner: '#EAEAC8' },
          protein: { fill: '#F5F5F0', stroke: '#D8D8C8', inner: '#EAEAE0' },
        };
        const colors = catColors[cat] || { fill: '#CCC', stroke: '#999', inner: '#DDD' };

        // Different shapes for different categories
        if (cat === 'sauce' || cat === 'dairy') {
          // Bottle/container shape
          return (
            <g>
              <ellipse cx="25" cy="42" rx="10" ry="3" fill="rgba(0,0,0,0.1)" />
              <rect
                x="15"
                y="20"
                width="20"
                height="20"
                rx="3"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
              />
              <rect
                x="20"
                y="14"
                width="10"
                height="8"
                rx="2"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
              />
              <rect x="18" y="24" width="14" height="12" rx="1" fill={colors.inner} opacity="0.5" />
              <ellipse cx="22" cy="28" rx="3" ry="2" fill="white" opacity="0.3" />
            </g>
          );
        }
        if (cat === 'spice') {
          // Small pile/powder shape
          return (
            <g>
              <ellipse
                cx="25"
                cy="38"
                rx="14"
                ry="6"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="0.5"
              />
              <ellipse cx="25" cy="34" rx="12" ry="5" fill={colors.inner} />
              <ellipse cx="22" cy="32" rx="4" ry="2" fill="white" opacity="0.2" />
              {[...Array(6)].map((_, i) => (
                <circle
                  key={i}
                  cx={15 + i * 4}
                  cy={36 + (i % 2) * 2}
                  r="1"
                  fill={colors.stroke}
                  opacity="0.3"
                />
              ))}
            </g>
          );
        }
        if (cat === 'wrapper') {
          // Flat wrapper shape
          return (
            <g>
              <rect
                x="8"
                y="15"
                width="34"
                height="28"
                rx="2"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
              />
              <rect x="10" y="17" width="30" height="24" rx="1" fill={colors.inner} opacity="0.5" />
              <line
                x1="12"
                y1="22"
                x2="38"
                y2="22"
                stroke={colors.stroke}
                strokeWidth="0.3"
                opacity="0.3"
              />
              <line
                x1="12"
                y1="29"
                x2="38"
                y2="29"
                stroke={colors.stroke}
                strokeWidth="0.3"
                opacity="0.3"
              />
              <line
                x1="12"
                y1="36"
                x2="38"
                y2="36"
                stroke={colors.stroke}
                strokeWidth="0.3"
                opacity="0.3"
              />
            </g>
          );
        }
        // Default rounded shape for proteins, vegetables, etc
        return (
          <g>
            <ellipse cx="25" cy="42" rx="12" ry="4" fill="rgba(0,0,0,0.08)" />
            <ellipse
              cx="25"
              cy="28"
              rx="16"
              ry="14"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="1"
            />
            <ellipse cx="25" cy="26" rx="13" ry="11" fill={colors.inner} opacity="0.5" />
            <ellipse cx="20" cy="22" rx="5" ry="3" fill="white" opacity="0.25" />
          </g>
        );
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      {renderIngredient()}
    </svg>
  );
};

// Recipes imported from gameData.js

// Steam effect with multiple particles
const SteamEffect = ({ active, intensity = 1 }) => {
  if (!active) {
    return null;
  }
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 10}%`,
            bottom: '50%',
            width: `${6 + (i % 3) * 2}px`,
            height: `${15 + (i % 2) * 8}px`,
            background: `linear-gradient(to top, rgba(255,255,255,${0.3 * intensity}), transparent)`,
            borderRadius: '50%',
            animation: `steam ${1.2 + (i % 3) * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.15}s`,
            filter: 'blur(2px)',
          }}
        />
      ))}
      <style>{`
        @keyframes steam {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-15px) scale(1.3) rotate(5deg); opacity: 0.3; }
          100% { transform: translateY(-35px) scale(1.8) rotate(-5deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Sizzle particles effect
const SizzleEffect = ({ active }) => {
  if (!active) {
    return null;
  }
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            bottom: '40%',
            width: '3px',
            height: '3px',
            background: '#FFD700',
            animation: `sizzle ${0.5 + Math.random() * 0.5}s ease-out infinite`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes sizzle {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) translateX(${Math.random() > 0.5 ? '' : '-'}10px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Mixed ingredients visual - shows a swirled combination of ingredients
const MixedIngredientsVisual = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Get colors based on ingredient types
  const getIngredientColor = (type) => {
    const colors = {
      salmon: '#FA8072',
      chicken: '#FFE8D6',
      shrimp: '#FFB6C1',
      rice: '#FFFEF8',
      nori: '#1B4D3E',
      flour: '#FFFAFA',
      avocado: '#9ACD32',
      cucumber: '#98FB98',
      onion: '#F5DEB3',
      garlic: '#FFFAF5',
      ginger: '#DEB887',
      egg: '#FFD740',
      soySauce: '#3D2314',
      vinegar: '#F5F2EC',
      coconutMilk: '#FFFEF8',
    };
    return colors[type] || '#CCC';
  };

  const colors = items.map((item) => getIngredientColor(item.type));

  return (
    <svg
      width="70"
      height="50"
      viewBox="0 0 70 50"
      style={{ filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.2))' }}
    >
      <defs>
        <linearGradient id="mixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          {colors.map((color, i) => (
            <stop key={i} offset={`${(i / colors.length) * 100}%`} stopColor={color} />
          ))}
        </linearGradient>
        <filter id="mixBlur">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
      {/* Base mixture blob */}
      <ellipse cx="35" cy="28" rx="28" ry="18" fill="url(#mixGrad)" opacity="0.9" />
      {/* Swirl patterns */}
      <path
        d="M15,25 Q25,15 35,25 T55,25"
        stroke={colors[0]}
        strokeWidth="4"
        fill="none"
        opacity="0.7"
        filter="url(#mixBlur)"
      />
      <path
        d="M20,32 Q35,40 50,32"
        stroke={colors[colors.length > 1 ? 1 : 0]}
        strokeWidth="3"
        fill="none"
        opacity="0.6"
        filter="url(#mixBlur)"
      />
      {colors.length > 2 && (
        <path
          d="M25,22 Q35,28 45,22"
          stroke={colors[2]}
          strokeWidth="3"
          fill="none"
          opacity="0.5"
          filter="url(#mixBlur)"
        />
      )}
      {/* Highlight */}
      <ellipse cx="28" cy="22" rx="8" ry="5" fill="white" opacity="0.3" />
      {/* Small ingredient chunks visible */}
      {items.slice(0, 4).map((item, i) => (
        <circle
          key={i}
          cx={20 + i * 12}
          cy={25 + (i % 2) * 8}
          r="4"
          fill={getIngredientColor(item.type)}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
};

// Sushi roll visual
const SushiRollVisual = ({ ingredients }) => {
  const hasRice = ingredients?.includes('rice');
  const hasSalmon = ingredients?.includes('salmon');
  const hasAvocado = ingredients?.includes('avocado');
  const hasCucumber = ingredients?.includes('cucumber');

  return (
    <svg
      width="120"
      height="50"
      viewBox="0 0 120 50"
      style={{ filter: 'drop-shadow(3px 4px 5px rgba(0,0,0,0.3))' }}
    >
      <defs>
        <linearGradient id="noriWrap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1B4D3E" />
          <stop offset="50%" stopColor="#0D3328" />
          <stop offset="100%" stopColor="#1B4D3E" />
        </linearGradient>
        <radialGradient id="riceCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F0E8" />
        </radialGradient>
      </defs>

      {/* Roll pieces - 3 cut pieces */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${10 + i * 38}, 5)`}>
          {/* Shadow */}
          <ellipse cx="15" cy="42" rx="14" ry="4" fill="rgba(0,0,0,0.15)" />

          {/* Nori outer wrap */}
          <circle cx="15" cy="22" r="17" fill="url(#noriWrap)" stroke="#0A2A20" strokeWidth="1" />

          {/* Rice layer */}
          {hasRice && (
            <circle
              cx="15"
              cy="22"
              r="14"
              fill="url(#riceCenter)"
              stroke="#E8E4D8"
              strokeWidth="0.5"
            />
          )}

          {/* Fillings in center */}
          <g>
            {/* Salmon */}
            {hasSalmon && (
              <ellipse
                cx="15"
                cy="20"
                rx="6"
                ry="4"
                fill="#FA8072"
                stroke="#E76F51"
                strokeWidth="0.5"
              >
                <animate
                  attributeName="opacity"
                  values="1;0.9;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </ellipse>
            )}

            {/* Avocado */}
            {hasAvocado && (
              <ellipse
                cx="12"
                cy="26"
                rx="4"
                ry="3"
                fill="#9ACD32"
                stroke="#6B8E23"
                strokeWidth="0.3"
              />
            )}

            {/* Cucumber */}
            {hasCucumber && (
              <circle cx="19" cy="25" r="3" fill="#98FB98" stroke="#66CC66" strokeWidth="0.3" />
            )}

            {/* If no specific filling, show generic filling */}
            {!hasSalmon && !hasAvocado && !hasCucumber && (
              <circle cx="15" cy="22" r="5" fill="#FFB6C1" stroke="#FF9AAB" strokeWidth="0.3" />
            )}
          </g>

          {/* Rice grain details */}
          {hasRice && (
            <>
              <ellipse cx="8" cy="18" rx="2" ry="1" fill="#FFF" opacity="0.7" />
              <ellipse cx="22" cy="20" rx="2" ry="1" fill="#FFF" opacity="0.6" />
              <ellipse cx="10" cy="28" rx="1.5" ry="0.8" fill="#FFF" opacity="0.5" />
              <ellipse cx="20" cy="27" rx="1.5" ry="0.8" fill="#FFF" opacity="0.5" />
            </>
          )}

          {/* Highlight on nori */}
          <path d="M5,15 Q10,10 15,12" stroke="#2D5A4A" strokeWidth="1" fill="none" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
};

// Completed dish visual - detailed SVG for each finished recipe
const CompletedDishVisual = ({ recipeId, size = 60 }) => {
  switch (recipeId) {
    case 'salmonMaki':
      // Plated sushi rolls
      return (
        <svg width={size} height={size} viewBox="0 0 60 60">
          <defs>
            <linearGradient id="dishPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E8E8E8" />
            </linearGradient>
            <radialGradient id="salmonFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF8C7A" />
              <stop offset="100%" stopColor="#FA8072" />
            </radialGradient>
          </defs>
          {/* Plate */}
          <ellipse cx="30" cy="35" rx="28" ry="18" fill="url(#dishPlateGrad)" stroke="#C0C0C0" strokeWidth="1" />
          <ellipse cx="30" cy="33" rx="24" ry="14" fill="#FAFAFA" />
          {/* Sushi pieces - 3 rolls */}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${12 + i * 14}, 24)`}>
              <circle cx="6" cy="6" r="9" fill="#1B4D3E" stroke="#0A2A20" strokeWidth="0.5" />
              <circle cx="6" cy="6" r="7" fill="#FAFAF5" />
              <ellipse cx="6" cy="5" rx="3.5" ry="2.5" fill="url(#salmonFill)" />
              <ellipse cx="5" cy="8" rx="2" ry="1.5" fill="#9ACD32" opacity="0.8" />
            </g>
          ))}
          {/* Wasabi and ginger */}
          <ellipse cx="18" cy="48" rx="4" ry="2" fill="#8FBC8F" />
          <path d="M38 46 Q42 44 46 47 Q44 50 40 48 Z" fill="#FFB6C1" opacity="0.8" />
        </svg>
      );

    case 'chickenAdobo':
      // Filipino braised chicken in a bowl
      return (
        <svg width={size} height={size} viewBox="0 0 60 60">
          <defs>
            <linearGradient id="adoboBowl" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="100%" stopColor="#5D3320" />
            </linearGradient>
            <linearGradient id="adoboSauce" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A2C2A" />
              <stop offset="50%" stopColor="#3D2323" />
              <stop offset="100%" stopColor="#2A1A1A" />
            </linearGradient>
            <linearGradient id="adoboChicken" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CD853F" />
              <stop offset="50%" stopColor="#A0522D" />
              <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
          </defs>
          {/* Bowl shadow */}
          <ellipse cx="30" cy="54" rx="22" ry="5" fill="rgba(0,0,0,0.15)" />
          {/* Bowl */}
          <path d="M6 30 Q6 50 30 52 Q54 50 54 30 L52 28 Q50 46 30 48 Q10 46 8 28 Z" fill="url(#adoboBowl)" />
          <ellipse cx="30" cy="28" rx="24" ry="12" fill="#8B4513" stroke="#5D3320" strokeWidth="1" />
          {/* Sauce inside */}
          <ellipse cx="30" cy="30" rx="20" ry="10" fill="url(#adoboSauce)" />
          {/* Chicken pieces */}
          <ellipse cx="22" cy="28" rx="8" ry="5" fill="url(#adoboChicken)" stroke="#6B4226" strokeWidth="0.5" />
          <ellipse cx="38" cy="30" rx="7" ry="4" fill="url(#adoboChicken)" stroke="#6B4226" strokeWidth="0.5" />
          <ellipse cx="30" cy="34" rx="6" ry="3.5" fill="url(#adoboChicken)" stroke="#6B4226" strokeWidth="0.5" />
          {/* Garlic bits */}
          <circle cx="26" cy="24" r="1.5" fill="#F5F5DC" opacity="0.8" />
          <circle cx="34" cy="26" r="1.2" fill="#F5F5DC" opacity="0.7" />
          {/* Sauce shine */}
          <ellipse cx="25" cy="32" rx="3" ry="1.5" fill="rgba(255,255,255,0.15)" />
        </svg>
      );

    case 'friedRice':
      // Wok-fried rice in a bowl
      return (
        <svg width={size} height={size} viewBox="0 0 60 60">
          <defs>
            <linearGradient id="riceBowlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4682B4" />
              <stop offset="100%" stopColor="#2F5570" />
            </linearGradient>
            <radialGradient id="friedRiceGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F5DEB3" />
              <stop offset="100%" stopColor="#DAA520" />
            </radialGradient>
          </defs>
          {/* Bowl shadow */}
          <ellipse cx="30" cy="54" rx="20" ry="4" fill="rgba(0,0,0,0.12)" />
          {/* Bowl */}
          <path d="M8 28 Q8 48 30 50 Q52 48 52 28" fill="url(#riceBowlGrad)" stroke="#2F5570" strokeWidth="1" />
          <ellipse cx="30" cy="28" rx="22" ry="10" fill="#4682B4" stroke="#2F5570" strokeWidth="1" />
          {/* Rice mound */}
          <ellipse cx="30" cy="26" rx="18" ry="8" fill="url(#friedRiceGrad)" />
          <path d="M12 26 Q18 18 30 16 Q42 18 48 26" fill="#F5DEB3" stroke="#DAA520" strokeWidth="0.3" />
          {/* Rice grains */}
          {[[15, 22], [20, 19], [25, 17], [30, 16], [35, 17], [40, 19], [45, 22], [22, 24], [28, 22], [33, 21], [38, 23]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2" ry="0.8" fill="#FFFEF5" opacity="0.7" transform={`rotate(${(i * 30) % 180} ${x} ${y})`} />
          ))}
          {/* Egg bits - yellow */}
          <ellipse cx="20" cy="22" rx="3" ry="2" fill="#FFD700" opacity="0.9" />
          <ellipse cx="38" cy="24" rx="2.5" ry="1.8" fill="#FFD700" opacity="0.85" />
          <circle cx="28" cy="20" r="1.5" fill="#FFD700" opacity="0.9" />
          {/* Green onion bits */}
          <ellipse cx="25" cy="25" rx="2" ry="0.8" fill="#228B22" opacity="0.8" />
          <ellipse cx="35" cy="21" rx="1.5" ry="0.6" fill="#228B22" opacity="0.75" />
          <ellipse cx="42" cy="26" rx="1.8" ry="0.7" fill="#228B22" opacity="0.8" />
          {/* Soy sauce sheen */}
          <ellipse cx="30" cy="24" rx="6" ry="2" fill="rgba(139,69,19,0.2)" />
        </svg>
      );

    case 'shrimpTempura':
      // Crispy golden tempura shrimp
      return (
        <svg width={size} height={size} viewBox="0 0 60 60">
          <defs>
            <linearGradient id="tempuraGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5DEB3" />
              <stop offset="30%" stopColor="#DAA520" />
              <stop offset="70%" stopColor="#CD853F" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <linearGradient id="shrimpPink" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA07A" />
              <stop offset="100%" stopColor="#FA8072" />
            </linearGradient>
          </defs>
          {/* Plate */}
          <ellipse cx="30" cy="48" rx="26" ry="10" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1" />
          <ellipse cx="30" cy="46" rx="22" ry="7" fill="#FFFFFF" />
          {/* Three tempura shrimp */}
          {[
            { x: 14, y: 32, rot: -20 },
            { x: 30, y: 28, rot: 0 },
            { x: 46, y: 32, rot: 20 },
          ].map(({ x, y, rot }, i) => (
            <g key={i} transform={`translate(${x}, ${y}) rotate(${rot})`}>
              {/* Shrimp tail */}
              <path d="M-2 8 Q-4 12 -2 16 L2 16 Q4 12 2 8" fill="url(#shrimpPink)" stroke="#E76F51" strokeWidth="0.3" />
              {/* Crispy tempura body */}
              <ellipse cx="0" cy="0" rx="4" ry="10" fill="url(#tempuraGold)" stroke="#B8860B" strokeWidth="0.5" />
              {/* Crispy texture bumps */}
              <circle cx="-2" cy="-4" r="1.5" fill="#F5DEB3" opacity="0.6" />
              <circle cx="1" cy="-2" r="1.2" fill="#F5DEB3" opacity="0.5" />
              <circle cx="-1" cy="3" r="1.3" fill="#F5DEB3" opacity="0.6" />
              <circle cx="2" cy="5" r="1" fill="#F5DEB3" opacity="0.5" />
              {/* Golden highlight */}
              <ellipse cx="-1" cy="-6" rx="2" ry="1.5" fill="#FFF8DC" opacity="0.4" />
            </g>
          ))}
          {/* Dipping sauce bowl */}
          <ellipse cx="48" cy="52" rx="6" ry="3" fill="#4A4A4A" stroke="#333" strokeWidth="0.5" />
          <ellipse cx="48" cy="51" rx="4" ry="2" fill="#8B4513" />
        </svg>
      );

    case 'gingerChicken':
      // Stir-fried chicken with ginger
      return (
        <svg width={size} height={size} viewBox="0 0 60 60">
          <defs>
            <linearGradient id="gingerChickenPlate" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0F0F0" />
            </linearGradient>
            <linearGradient id="cookedChickenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DEB887" />
              <stop offset="50%" stopColor="#D2691E" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
            <linearGradient id="gingerSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6C8" />
              <stop offset="100%" stopColor="#E8D4A8" />
            </linearGradient>
          </defs>
          {/* Plate shadow */}
          <ellipse cx="30" cy="52" rx="24" ry="6" fill="rgba(0,0,0,0.1)" />
          {/* Plate */}
          <ellipse cx="30" cy="38" rx="26" ry="16" fill="url(#gingerChickenPlate)" stroke="#D0D0D0" strokeWidth="1" />
          <ellipse cx="30" cy="36" rx="22" ry="12" fill="#FEFEFE" />
          {/* Sauce glaze */}
          <ellipse cx="30" cy="36" rx="18" ry="9" fill="rgba(139,69,19,0.15)" />
          {/* Chicken pieces */}
          {[
            { cx: 22, cy: 32, rx: 7, ry: 5 },
            { cx: 38, cy: 34, rx: 6, ry: 4.5 },
            { cx: 30, cy: 38, rx: 6, ry: 4 },
            { cx: 25, cy: 40, rx: 5, ry: 3.5 },
            { cx: 36, cy: 40, rx: 5.5, ry: 3.5 },
          ].map((props, i) => (
            <ellipse key={i} {...props} fill="url(#cookedChickenGrad)" stroke="#8B4513" strokeWidth="0.4" />
          ))}
          {/* Ginger slices scattered on top */}
          {[
            { x: 20, y: 30, rot: 15 },
            { x: 32, y: 32, rot: -10 },
            { x: 28, y: 36, rot: 25 },
            { x: 40, y: 38, rot: -20 },
          ].map(({ x, y, rot }, i) => (
            <ellipse key={i} cx={x} cy={y} rx="3" ry="1.5" fill="url(#gingerSliceGrad)" stroke="#C9B87A" strokeWidth="0.3" transform={`rotate(${rot} ${x} ${y})`} />
          ))}
          {/* Green onion garnish */}
          <ellipse cx="42" cy="30" rx="2" ry="0.8" fill="#228B22" opacity="0.9" transform="rotate(-30 42 30)" />
          <ellipse cx="18" cy="36" rx="1.8" ry="0.7" fill="#228B22" opacity="0.85" transform="rotate(20 18 36)" />
          {/* Sauce drizzle shine */}
          <path d="M24 34 Q28 32 32 35" stroke="rgba(139,69,19,0.3)" strokeWidth="1.5" fill="none" />
        </svg>
      );

    default:
      // Fallback - generic plated dish
      return (
        <svg width={size} height={size} viewBox="0 0 60 60">
          <ellipse cx="30" cy="45" rx="25" ry="12" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1" />
          <ellipse cx="30" cy="43" rx="20" ry="8" fill="#FFFFFF" />
          <circle cx="30" cy="38" r="10" fill="#DAA520" opacity="0.6" />
          <text x="30" y="42" textAnchor="middle" fontSize="14">🍽️</text>
        </svg>
      );
  }
};

// Water running effect for sink
const WaterEffect = ({ active }) => {
  if (!active) {
    return null;
  }
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Water stream */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-full"
        style={{
          background:
            'linear-gradient(180deg, rgba(135,206,250,0.7) 0%, rgba(135,206,250,0.4) 50%, rgba(135,206,250,0.2) 100%)',
          animation: 'waterFlow 0.3s linear infinite',
        }}
      />
      {/* Splash droplets */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${40 + (i % 3) * 10}%`,
            bottom: `${20 + (i % 4) * 5}%`,
            width: `${4 + (i % 3)}px`,
            height: `${4 + (i % 3)}px`,
            background: 'rgba(135,206,250,0.6)',
            animation: `splash ${0.4 + i * 0.1}s ease-out infinite`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waterFlow {
          0% { opacity: 0.7; }
          50% { opacity: 0.9; }
          100% { opacity: 0.7; }
        }
        @keyframes splash {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-15px) translateX(${Math.random() > 0.5 ? '' : '-'}8px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default function CookingGame() {
  const [activeItems, setActiveItems] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [cuttingBoardItems, setCuttingBoardItems] = useState([]);
  const [mixingBowlItems, setMixingBowlItems] = useState([]);
  const [potItems, setPotItems] = useState([]);
  const [panItems, setPanItems] = useState([]);
  const [plateItems, setPlateItems] = useState([]);
  const [completedDishes, setCompletedDishes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [currentRecipePage, setCurrentRecipePage] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [potHeat, setPotHeat] = useState(false);
  const [panHeat, setPanHeat] = useState(false);
  const [bowlMixed, setBowlMixed] = useState(false);
  const [sushiRoll, setSushiRoll] = useState(null);
  const [sinkItems, setSinkItems] = useState([]);
  const [waterRunning, setWaterRunning] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Progression system
  const {
    playerProfile,
    levelUpData,
    gainXP,
    discoverRecipe,
    updateStat,
    isIngredientUnlocked,
    closeLevelUpModal,
    currentLevel,
    nextLevel,
    xpProgress,
  } = useProgression();

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  // Customer orders system
  const {
    restaurantMode,
    activeOrders,
    reputation,
    toggleRestaurant,
    checkForMatchingOrder,
    spawnCustomer,
    getPatiencePercent,
    getPatienceColor,
  } = useCustomerOrders(
    playerProfile,
    // onOrderComplete callback
    ({ xp, message }) => {
      gainXP(xp, 'Customer order');
      updateStat('customersServed');
      showNotification(message, 'success');
    },
    // onOrderFailed callback
    ({ message }) => {
      showNotification(message, 'error');
    }
  );

  // Disaster system
  const {
    activeDisaster,
    warnings,
    panTimer,
    potTimer,
    resolveDisaster,
    updatePanTimer,
    updatePotTimer,
    getWarningColor,
  } = useDisasters(
    // onDisasterSuccess callback
    ({ xp, message }) => {
      gainXP(xp, 'Disaster handled');
      updateStat('disastersHandled');
      showNotification(message, 'success');
    },
    // onDisasterFailure callback
    ({ message }) => {
      showNotification(message, 'error');
    }
  );

  // Track pan/pot heating for disaster system
  useEffect(() => {
    updatePanTimer(panHeat);
  }, [panHeat, updatePanTimer]);

  useEffect(() => {
    updatePotTimer(potHeat);
  }, [potHeat, updatePotTimer]);

  const createItem = (type) => ({
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    state: INGREDIENTS[type].states[0],
  });

  // Touch support state
  const [touchState, setTouchState] = useState(null);

  // Input mode detection for hybrid devices (laptop touchscreens)
  const { mode: inputMode, isHybridDevice } = useInputMode();
  const isTouchActive = isTouchMode(inputMode);

  // Tap-to-select mode for touch accessibility
  const tapToSelect = useTapToSelect({
    onPlace: (item, dropZone, source) => {
      // Create synthetic event-like object for handleDrop
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      // Set dragged item and call handleDrop
      setDraggedItem({ ...item, source });
      setTimeout(() => {
        handleDrop(syntheticEvent, dropZone);
      }, 0);
    },
    onSelect: (item, source) => {
      showNotification(`Selected ${item.type} - tap a station to place it`, 'info');
    },
    onCancel: () => {
      showNotification('Selection cancelled', 'info');
    },
    enableHaptics: true,
  });

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tool selection shortcuts (1-7)
      const toolMap = {
        '1': 'knife',
        '2': 'peeler',
        '3': 'grater',
        '4': 'whisk',
        '5': 'rollingMat',
        '6': 'tongs',
        '7': 'ladle',
      };

      if (toolMap[e.key]) {
        e.preventDefault();
        const newTool = toolMap[e.key];
        setSelectedTool(selectedTool === newTool ? null : newTool);
        showNotification(`${newTool.charAt(0).toUpperCase() + newTool.slice(1)} ${selectedTool === newTool ? 'deselected' : 'selected'}`, 'info');
      }

      // Escape to cancel selection/drag
      if (e.key === 'Escape') {
        if (tapToSelect.hasSelection) {
          tapToSelect.cancelSelection('escape');
        }
        if (touchState) {
          setTouchState(null);
          setDraggedItem(null);
        }
      }

      // R to toggle recipe book
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          setShowRecipeBook(!showRecipeBook);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, tapToSelect, touchState, showRecipeBook, showNotification]);

  const handleDragStart = (e, item, source) => {
    setDraggedItem({ ...item, source });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Touch handlers for mobile/touchscreen support with haptic feedback
  const handleTouchStart = (e, item, source) => {
    e.preventDefault();
    const touch = e.touches[0];

    // Add haptic feedback if supported (vibration)
    if (navigator.vibrate) {
      navigator.vibrate(10); // Short vibration on touch start
    }

    setTouchState({
      item: { ...item, source },
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: false,
    });
    setDraggedItem({ ...item, source });
  };

  const handleTouchMove = (e) => {
    if (!touchState) {
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];

    // Check if we've moved enough to consider it a drag (5px threshold)
    const deltaX = Math.abs(touch.clientX - touchState.startX);
    const deltaY = Math.abs(touch.clientY - touchState.startY);
    const isDragging = deltaX > 5 || deltaY > 5;

    // Trigger haptic feedback when drag actually starts
    if (isDragging && !touchState.isDragging && navigator.vibrate) {
      navigator.vibrate(15); // Slightly longer vibration when drag starts
    }

    setTouchState((prev) => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging,
    }));
  };

  const handleTouchEnd = (e) => {
    if (!touchState) {
      return;
    }
    e.preventDefault();

    // Find the element at the touch position
    const touch = e.changedTouches[0];
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);

    // Find the closest drop zone
    let target = null;
    let element = elementAtPoint;
    while (element && !target) {
      const dropZone = element.getAttribute('data-drop-zone');
      if (dropZone) {
        target = dropZone;
        break;
      }
      element = element.parentElement;
    }

    // Simulate drop event
    if (target && draggedItem) {
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        nativeEvent: {
          offsetX: touch.clientX,
          offsetY: touch.clientY,
        },
      };
      handleDrop(syntheticEvent, target);

      // Success vibration
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    } else if (touchState.isDragging && navigator.vibrate) {
      // Failed drop - error vibration pattern
      navigator.vibrate([10, 50, 10]);
    }

    setTouchState(null);
    setDraggedItem(null);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) {
      return;
    }
    const item =
      draggedItem.source === 'pantry' ? createItem(draggedItem.type) : { ...draggedItem };
    if (draggedItem.source !== 'pantry') {
      removeFromAllStations(draggedItem.id);
    }

    switch (target) {
      case 'cuttingBoard':
        if (draggedItem.type === 'mixedBowl' && draggedItem.items) {
          // Transfer mixed contents to cutting board, keeping them as mixed
          setCuttingBoardItems((prev) => [
            ...prev,
            {
              id: 'mixed-' + Date.now(),
              type: 'mixedBowl',
              state: 'mixed',
              items: draggedItem.items,
            },
          ]);
          setMixingBowlItems([]);
          setBowlMixed(false);
          setSushiRoll(null);
        } else if (INGREDIENTS[item.type]?.category === 'sauce') {
          showNotification("Liquids don't go on the cutting board!", 'error');
        } else {
          setCuttingBoardItems((prev) => [...prev, item]);
          setSushiRoll(null);
        }
        break;
      case 'mixingBowl':
        setMixingBowlItems((prev) => [...prev, item]);
        setBowlMixed(false);
        break;
      case 'pot':
        if (draggedItem.type === 'mixedBowl' && draggedItem.items) {
          // Keep as mixed item in pot
          setPotItems((prev) => [
            ...prev,
            {
              id: 'mixed-' + Date.now(),
              type: 'mixedBowl',
              state: 'mixed',
              items: draggedItem.items,
            },
          ]);
          setMixingBowlItems([]);
          setBowlMixed(false);
        } else {
          setPotItems((prev) => [...prev, item]);
        }
        break;
      case 'pan':
        if (draggedItem.type === 'mixedBowl' && draggedItem.items) {
          // Keep as mixed item in pan
          setPanItems((prev) => [
            ...prev,
            {
              id: 'mixed-' + Date.now(),
              type: 'mixedBowl',
              state: 'mixed',
              items: draggedItem.items,
            },
          ]);
          setMixingBowlItems([]);
          setBowlMixed(false);
        } else {
          setPanItems((prev) => [...prev, item]);
        }
        break;
      case 'plate':
        // Handle sushi roll
        if (draggedItem.type === 'sushiRoll') {
          setPlateItems((prev) => [
            ...prev,
            {
              id: draggedItem.id,
              type: 'sushiRoll',
              state: 'rolled',
              ingredients: draggedItem.ingredients || sushiRoll?.ingredients,
            },
          ]);
          setSushiRoll(null);
        } else if (draggedItem.type === 'mixedBowl') {
          // Handle mixed bowl contents
          setPlateItems((prev) => [
            ...prev,
            {
              id: draggedItem.id || 'mixed-' + Date.now(),
              type: 'mixedBowl',
              state: 'mixed',
              items: draggedItem.items,
            },
          ]);
          if (draggedItem.source === 'mixingBowl') {
            setMixingBowlItems([]);
            setBowlMixed(false);
          }
        } else {
          setPlateItems((prev) => [...prev, item]);
        }
        break;
      case 'sink':
        setSinkItems((prev) => [...prev, item]);
        break;
      case 'workspace':
        if (draggedItem.type === 'mixedBowl' && draggedItem.items) {
          // Handle mixed bowl contents
          setActiveItems((prev) => [
            ...prev,
            {
              id: draggedItem.id || 'mixed-' + Date.now(),
              type: 'mixedBowl',
              state: 'mixed',
              items: draggedItem.items,
              x: e.nativeEvent.offsetX - 25,
              y: e.nativeEvent.offsetY - 25,
            },
          ]);
          if (draggedItem.source === 'mixingBowl') {
            setMixingBowlItems([]);
            setBowlMixed(false);
          }
        } else {
          setActiveItems((prev) => [
            ...prev,
            { ...item, x: e.nativeEvent.offsetX - 25, y: e.nativeEvent.offsetY - 25 },
          ]);
        }
        break;
    }
    setDraggedItem(null);
  };

  const removeFromAllStations = (itemId) => {
    setCuttingBoardItems((prev) => prev.filter((i) => i.id !== itemId));
    setMixingBowlItems((prev) => prev.filter((i) => i.id !== itemId));
    setPotItems((prev) => prev.filter((i) => i.id !== itemId));
    setPanItems((prev) => prev.filter((i) => i.id !== itemId));
    setPlateItems((prev) => prev.filter((i) => i.id !== itemId));
    setSinkItems((prev) => prev.filter((i) => i.id !== itemId));
    setActiveItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleChop = () => {
    if (selectedTool !== 'knife') {
      showNotification('Select the knife first!', 'error');
      return;
    }
    if (cuttingBoardItems.length === 0) {
      showNotification('Put something on the cutting board!', 'error');
      return;
    }
    setCuttingBoardItems((prev) =>
      prev.map((item) => {
        const ingredient = INGREDIENTS[item.type];
        // Skip non-ingredient items (like completedDish, sushiRoll, etc.)
        if (!ingredient) {
          return item;
        }

        const chopStates = ['sliced', 'diced', 'minced', 'peeled'];
        const currentIndex = ingredient.states.indexOf(item.state);
        const nextState = chopStates.find(
          (s) => ingredient.states.includes(s) && ingredient.states.indexOf(s) > currentIndex
        );
        if (nextState) {
          showNotification(`Chopped ${ingredient.name}!`, 'success');
          return { ...item, state: nextState };
        }
        return item;
      })
    );
  };

  const handleMix = () => {
    if (selectedTool !== 'whisk') {
      showNotification('Select the whisk first!', 'error');
      return;
    }
    if (mixingBowlItems.length === 0) {
      showNotification('Put something in the bowl!', 'error');
      return;
    }

    // Check for special combinations first
    const riceItem = mixingBowlItems.find((i) => i.type === 'rice');
    const vinegarItem = mixingBowlItems.find((i) => i.type === 'vinegar');
    if (riceItem && vinegarItem) {
      if (riceItem.state === 'cooked') {
        setMixingBowlItems((prev) =>
          prev
            .map((item) => (item.id === riceItem.id ? { ...item, state: 'seasoned' } : item))
            .filter((item) => item.id !== vinegarItem.id)
        );
        // Don't set bowlMixed for seasoned rice - keep it draggable as individual ingredient
        // setBowlMixed(true);
        showNotification('Made seasoned sushi rice!', 'success');
        return;
      } else {
        // Rice needs to be cooked first
        showNotification('Cook the rice first! Then mix with vinegar to season it.', 'info');
        return;
      }
    }

    const eggItem = mixingBowlItems.find((i) => i.type === 'egg' && i.state === 'raw');
    if (eggItem) {
      setMixingBowlItems((prev) =>
        prev.map((item) => (item.id === eggItem.id ? { ...item, state: 'beaten' } : item))
      );
      // Don't set bowlMixed for single egg - allow dragging individual beaten egg
      // setBowlMixed(true);
      showNotification('Beat the egg!', 'success');
      return;
    }

    // For any other combination, just mark as mixed visually
    if (mixingBowlItems.length >= 1) {
      setBowlMixed(true);
      showNotification('Mixed the ingredients!', 'success');
    }
  };

  const handleCook = (vessel) => {
    const items = vessel === 'pot' ? potItems : panItems;
    const setItems = vessel === 'pot' ? setPotItems : setPanItems;
    const setHeat = vessel === 'pot' ? setPotHeat : setPanHeat;
    if (items.length === 0) {
      showNotification(`Put something in the ${vessel}!`, 'error');
      return;
    }

    setHeat(true);
    setTimeout(() => setHeat(false), 2500);
    const action = vessel === 'pot' ? 'boil' : 'fry';
    if (checkRecipes(items, action, setItems)) {
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const ingredient = INGREDIENTS[item.type];
        // Skip non-ingredient items (like completedDish, sushiRoll, etc.)
        if (!ingredient) {
          return item;
        }

        // Handle rice specially - both dry and washed can become cooked
        if (item.type === 'rice' && (item.state === 'dry' || item.state === 'washed')) {
          showNotification(`Cooked the rice!`, 'success');
          return { ...item, state: 'cooked' };
        }
        // Handle eggs - boil in pot, cook/fry in pan
        if (item.type === 'egg' && item.state === 'raw') {
          if (vessel === 'pot') {
            showNotification(`Boiled the egg!`, 'success');
            return { ...item, state: 'boiled' };
          } else {
            showNotification(`Cooked ${ingredient.name}!`, 'success');
            return { ...item, state: 'cooked' };
          }
        }
        if (
          ingredient.states.includes('cooked') &&
          !['cooked', 'caramelized', 'fried', 'boiled'].includes(item.state)
        ) {
          showNotification(`Cooked ${ingredient.name}!`, 'success');
          return { ...item, state: 'cooked' };
        }
        if (item.type === 'onion' && item.state === 'diced') {
          showNotification(`Caramelized ${ingredient.name}!`, 'success');
          return { ...item, state: 'caramelized' };
        }
        if (item.type === 'garlic' && item.state === 'minced') {
          showNotification(`Fried ${ingredient.name}!`, 'success');
          return { ...item, state: 'fried' };
        }
        return item;
      })
    );
  };

  const handleRoll = () => {
    if (selectedTool !== 'rollingMat') {
      showNotification('Select the rolling mat first!', 'error');
      return;
    }
    if (cuttingBoardItems.length === 0) {
      showNotification('Put ingredients on the cutting board!', 'error');
      return;
    }

    // Check for complete sushi recipe first
    if (checkRecipes(cuttingBoardItems, 'roll', setCuttingBoardItems)) {
      setSushiRoll(null); // Clear any partial roll since recipe was completed
      return;
    }

    // Check if we have nori - required for any roll
    const hasNori = cuttingBoardItems.find((i) => i.type === 'nori');
    if (!hasNori) {
      showNotification('You need nori (seaweed) to make a roll!', 'error');
      return;
    }

    // Check what we have for the roll (accept rice in any state including seasoned)
    const hasRice = cuttingBoardItems.find((i) => i.type === 'rice');
    const hasFilling = cuttingBoardItems.find((i) =>
      ['salmon', 'avocado', 'cucumber', 'shrimp'].includes(i.type)
    );

    if (!hasRice) {
      showNotification('Add rice to your roll!', 'info');
      return;
    }

    if (!hasFilling) {
      showNotification('Add a filling like salmon, avocado, or cucumber!', 'info');
      return;
    }

    // Check if rice is properly seasoned for the real recipe
    const seasonedRice = cuttingBoardItems.find((i) => i.type === 'rice' && i.state === 'seasoned');
    const slicedSalmon = cuttingBoardItems.find((i) => i.type === 'salmon' && i.state === 'sliced');

    if (!seasonedRice) {
      showNotification('The rice should be seasoned! Mix cooked rice with vinegar.', 'info');
    }

    if (cuttingBoardItems.find((i) => i.type === 'salmon') && !slicedSalmon) {
      showNotification('Slice the salmon first!', 'info');
    }

    // Create a visual roll with whatever ingredients we have
    const rollIngredients = cuttingBoardItems.map((i) => i.type);
    setSushiRoll({ ingredients: rollIngredients, id: Date.now() });
    setCuttingBoardItems([]);
    showNotification('Rolled! (Try seasoned rice + sliced salmon + nori for perfect maki)', 'info');
  };

  const checkRecipes = (items, action, setItems) => {
    // Check all recipes for matches
    for (const [recipeId, recipe] of Object.entries(RECIPES)) {
      if (recipe.action !== action) {
        continue;
      }

      // Check if all required ingredients are present with correct states
      const allRequired = recipe.required.every((req) =>
        items.find((item) => item.type === req.ingredient && item.state === req.state)
      );

      if (allRequired) {
        showNotification(`🎉 You made ${recipe.name}!`, 'success');

        // Create a completed dish item and add it to the plate
        const completedDish = {
          id: Date.now(),
          type: 'completedDish',
          recipeId,
          recipe: { ...recipe, recipeId },
        };
        setPlateItems((prev) => [...prev, completedDish]);

        // Also add to completedDishes for tracking
        setCompletedDishes((prev) => [...prev, { ...recipe, recipeId, id: Date.now() }]);

        // Clear the cooking station
        setItems([]);

        // Award XP for making the recipe
        gainXP(recipe.xpReward || 20, `Made ${recipe.name}`);

        // Check if this is a new recipe discovery
        const isNew = discoverRecipe(recipeId);
        if (isNew) {
          gainXP(10, `Discovered ${recipe.name}!`);
          showNotification(`New recipe discovered: ${recipe.name}! +10 XP`, 'success');
        }

        // Update stats
        updateStat('recipesCompleted');

        return true;
      }

      // Provide helpful feedback if ingredients are close but not quite right
      const hasMatchingIngredients = recipe.required.some((req) =>
        items.some((item) => item.type === req.ingredient)
      );

      if (hasMatchingIngredients && recipe.action === action) {
        // They have some ingredients but wrong states
        const missing = recipe.required
          .filter(
            (req) => !items.find((item) => item.type === req.ingredient && item.state === req.state)
          )
          .map((req) => {
            const wrongStateItem = items.find((item) => item.type === req.ingredient);
            if (wrongStateItem) {
              return `${INGREDIENTS[req.ingredient].name} needs to be ${req.state} (currently ${wrongStateItem.state})`;
            }
            return `Need ${INGREDIENTS[req.ingredient].name} (${req.state})`;
          });

        if (missing.length > 0) {
          showNotification(`${recipe.name} needs: ${missing.join(', ')}`, 'info');
        }
      }
    }
    return false;
  };

  const clearStation = (station) => {
    const clearMap = {
      cuttingBoard: setCuttingBoardItems,
      mixingBowl: setMixingBowlItems,
      pot: setPotItems,
      pan: setPanItems,
      plate: setPlateItems,
      sink: setSinkItems,
    };
    clearMap[station]?.([]);
    if (station === 'mixingBowl') {
      setBowlMixed(false);
    }
    if (station === 'cuttingBoard') {
      setSushiRoll(null);
    }
  };

  const handleServeDish = (dish) => {
    if (!restaurantMode) {
      showNotification('Open the restaurant first to serve customers!', 'info');
      return;
    }

    if (activeOrders.length === 0) {
      showNotification('No customers waiting. Keep this dish ready!', 'info');
      return;
    }

    // Try to match this dish with a customer order
    const orderResult = checkForMatchingOrder(dish.recipeId);

    if (orderResult) {
      // Successfully served! Remove from plate and completed dishes
      setPlateItems((prev) =>
        prev.filter((item) => !(item.type === 'completedDish' && item.recipeId === dish.recipeId))
      );
      setCompletedDishes((prev) => prev.filter((d) => d.recipeId !== dish.recipeId));
      showNotification(`✨ Served ${dish.name} to ${orderResult.order.customer.name}!`, 'success');
    } else {
      // No customer wants this dish
      showNotification(`No customer ordered ${dish.name} right now!`, 'error');
    }
  };

  const handleWash = () => {
    if (sinkItems.length === 0) {
      showNotification('Put something in the sink first!', 'error');
      return;
    }

    setWaterRunning(true);
    setTimeout(() => setWaterRunning(false), 1500);

    // Washing can clean rice (makes it ready for cooking) or just clean vegetables
    setSinkItems((prev) =>
      prev.map((item) => {
        const ingredient = INGREDIENTS[item.type];
        if (item.type === 'rice' && item.state === 'dry') {
          showNotification('Washed the rice! Ready to cook.', 'success');
          return { ...item, state: 'washed' };
        }
        if (['cucumber', 'avocado', 'ginger', 'onion', 'garlic'].includes(item.type)) {
          showNotification(`Washed the ${ingredient.name}!`, 'success');
          return { ...item, washed: true };
        }
        showNotification(`Rinsed the ${ingredient.name}!`, 'info');
        return item;
      })
    );
  };

  const handlePeel = () => {
    if (selectedTool !== 'peeler') {
      showNotification('Select the peeler first!', 'error');
      return;
    }
    if (cuttingBoardItems.length === 0) {
      showNotification('Put something on the cutting board!', 'error');
      return;
    }

    setCuttingBoardItems((prev) =>
      prev.map((item) => {
        const ingredient = INGREDIENTS[item.type];
        // Peelable items
        if (item.type === 'shrimp' && item.state === 'raw') {
          showNotification('Peeled the shrimp!', 'success');
          return { ...item, state: 'peeled' };
        }
        if (item.type === 'ginger' && item.state === 'whole') {
          showNotification('Peeled the ginger!', 'success');
          return { ...item, state: 'peeled' };
        }
        if (item.type === 'cucumber' && item.state === 'whole') {
          showNotification('Peeled the cucumber!', 'success');
          return { ...item, peeled: true };
        }
        if (item.type === 'avocado' && item.state === 'whole') {
          showNotification('Peeled and pitted the avocado!', 'success');
          return { ...item, state: 'sliced' };
        }
        return item;
      })
    );
  };

  const handleGrate = () => {
    if (selectedTool !== 'grater') {
      showNotification('Select the grater first!', 'error');
      return;
    }
    if (cuttingBoardItems.length === 0) {
      showNotification('Put something on the cutting board!', 'error');
      return;
    }

    setCuttingBoardItems((prev) =>
      prev.map((item) => {
        const ingredient = INGREDIENTS[item.type];
        // Gratable items
        if (item.type === 'ginger') {
          showNotification('Grated the ginger!', 'success');
          return { ...item, state: 'minced' };
        }
        if (item.type === 'garlic') {
          showNotification('Grated the garlic!', 'success');
          return { ...item, state: 'minced' };
        }
        if (item.type === 'cucumber') {
          showNotification('Grated the cucumber!', 'success');
          return { ...item, state: 'sliced', grated: true };
        }
        return item;
      })
    );
  };

  const handleTongs = () => {
    if (selectedTool !== 'tongs') {
      showNotification('Select the tongs first!', 'error');
      return;
    }
    // Tongs can flip items in pan or move hot items
    if (panItems.length > 0) {
      showNotification('Flipped the ingredients!', 'success');
      setPanHeat(true);
      setTimeout(() => setPanHeat(false), 800);
    } else if (potItems.length > 0) {
      showNotification('Stirred the pot!', 'success');
      setPotHeat(true);
      setTimeout(() => setPotHeat(false), 800);
    } else {
      showNotification('Nothing to flip or stir!', 'error');
    }
  };

  const renderDraggableIngredient = (item, source, size = 45) => {
    const isSelected = tapToSelect.isSelected(item);

    return (
      <SelectionIndicator visible={isSelected} size="normal" color="amber">
        <div
          key={item.id || item.type}
          draggable
          onDragStart={(e) => handleDragStart(e, item, source)}
          onTouchStart={(e) => handleTouchStart(e, item, source)}
          onClick={(e) => {
            // Tap-to-select: if touch mode and not dragging, select the item
            if (isTouchActive && !touchState?.isDragging) {
              e.preventDefault();
              e.stopPropagation();
              tapToSelect.handleTap(e, item, source, null);
            }
          }}
          className={`cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 active:opacity-70 transition-all duration-150 select-none touch-target touch-affordance ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
          style={{
            filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.25))',
            touchAction: 'none',
            minWidth: '44px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'transparent',
          }}
          title={`${INGREDIENTS[item.type]?.name} (${item.state})`}
          role="button"
          aria-label={`${INGREDIENTS[item.type]?.name}, ${item.state}. ${isTouchActive ? 'Tap to select or drag to move.' : 'Drag to move.'}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              tapToSelect.selectItem(item, source);
            }
          }}
        >
          <IngredientSVG type={item.type} state={item.state} size={size} />
        </div>
      </SelectionIndicator>
    );
  };

  return (
    <div
      className="w-full h-screen overflow-hidden flex flex-col game-container game-safe-zone"
      style={{ background: 'linear-gradient(180deg, #2C2416 0%, #1A1510 100%)' }}
    >
      {/* Tap-to-select hint overlay */}
      <TapHint
        visible={tapToSelect.showHint}
        message={tapToSelect.hintMessage}
        position="top"
      />

      {/* Cancel zone during drag */}
      <CancelZone visible={touchState?.isDragging} message="↑ Drag up to cancel" />

      {notification && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl text-white font-bold text-lg border ${notification.type === 'success' ? 'bg-green-700 border-green-500' : notification.type === 'error' ? 'bg-red-700 border-red-500' : 'bg-amber-700 border-amber-500'}`}
        >
          {notification.message}
        </div>
      )}

      {/* Touch drag preview - visual feedback during touch drag */}
      {touchState && touchState.isDragging && touchState.item && (
        <div
          className="fixed pointer-events-none z-[200]"
          style={{
            left: touchState.currentX - 30,
            top: touchState.currentY - 30,
            transform: 'scale(1.2) rotate(5deg)',
            opacity: 0.85,
            filter: 'drop-shadow(4px 6px 8px rgba(0,0,0,0.5))',
            transition: 'none',
          }}
        >
          {touchState.item.type === 'completedDish' ? (
            <div className="flex flex-col items-center gap-0.5 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <CompletedDishVisual recipeId={touchState.item.recipeId} size={60} />
              <span className="text-xs text-white font-bold">{touchState.item.recipe.name}</span>
            </div>
          ) : touchState.item.type === 'sushiRoll' ? (
            <div className="flex items-center">
              <SushiRollVisual items={touchState.item.items} />
            </div>
          ) : touchState.item.type === 'mixedBowl' ? (
            <div className="flex items-center">
              <MixedIngredientsVisual items={touchState.item.items} />
            </div>
          ) : (
            <IngredientSVG type={touchState.item.type} state={touchState.item.state} size={60} />
          )}
        </div>
      )}

      {/* Merged Header: XP Progress + Kitchen Explorer + Controls */}
      <div
        className="fixed top-0 left-0 right-0 z-50 shadow-lg"
        style={{
          background: 'linear-gradient(180deg, #3D2E1E 0%, #2A1F14 100%)',
          borderBottom: '2px solid #5D4A32',
        }}
      >
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title */}
            <h1 className="text-lg font-bold text-amber-100 drop-shadow whitespace-nowrap">
              🍳 Kitchen Explorer
            </h1>

            {/* Center: XP Progress */}
            <div className="flex-1 flex items-center gap-3 max-w-md">
              <div className="flex items-center gap-2 text-xs text-white whitespace-nowrap">
                <span className="font-bold">{currentLevel.title}</span>
                <span>Lv {playerProfile.level}</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <div className="text-[9px] text-gray-300 text-center mt-0.5">
                  {playerProfile.xp} /{' '}
                  {nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 'MAX'} XP
                </div>
              </div>
            </div>

            {/* Right: Stats & Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex gap-3 text-xs text-white">
                <span>🍽️ {playerProfile.stats.recipesCompleted}</span>
                <span>👥 {playerProfile.stats.customersServed}</span>
                <span>⭐ {reputation.toFixed(1)}</span>
              </div>
              <button
                onClick={() => setShowRecipeBook(true)}
                className="bg-amber-800 hover:bg-amber-700 px-3 py-2 rounded-lg font-bold transition-colors text-xs text-amber-100 border border-amber-600 shadow whitespace-nowrap action-button touch-active"
              >
                📖 Recipes
              </button>
              <button
                onClick={toggleRestaurant}
                className={`px-3 py-2 rounded-lg font-bold transition-colors text-xs shadow whitespace-nowrap action-button touch-active ${
                  restaurantMode
                    ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500'
                    : 'bg-green-600 hover:bg-green-500 text-white border border-green-500'
                }`}
              >
                {restaurantMode ? '🔴 Close' : '🟢 Open'}
              </button>
              {completedDishes.length > 0 && (
                <div className="bg-green-800 px-2 py-1 rounded-lg text-xs text-green-100 border border-green-600 whitespace-nowrap">
                  ✓ {completedDishes.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders Display - Above Tools Bar */}
      {restaurantMode && activeOrders.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="flex gap-2">
            {activeOrders.map((order) => {
              const patiencePercent = getPatiencePercent(order);
              const color = getPatienceColor(order);
              // Check if matching dish is on the plate
              const matchingDish = plateItems.find(
                (item) => item.type === 'completedDish' && item.recipeId === order.recipeId
              );

              return (
                <div key={order.id} className="flex flex-col items-center gap-1">
                  <div
                    className="flex items-center gap-2 bg-gray-900/95 rounded-lg px-3 py-2 border-2 shadow-xl pointer-events-auto"
                    style={{ borderColor: order.customer.color || '#666' }}
                  >
                    {/* Customer icon and name */}
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-2xl">{order.customer.emoji}</span>
                      <span className="text-white text-[9px] font-bold whitespace-nowrap">
                        {order.customer.name}
                      </span>
                    </div>

                    {/* Order details */}
                    <div className="flex flex-col gap-1">
                      <div className="text-gray-200 text-xs font-medium">
                        {order.recipe.emoji} {order.recipe.name}
                      </div>

                      {/* Timer below */}
                      <div className="w-28">
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-full rounded-full transition-all`}
                            style={{
                              width: `${patiencePercent}%`,
                              backgroundColor:
                                color === 'green'
                                  ? '#4CAF50'
                                  : color === 'yellow'
                                    ? '#FFC107'
                                    : '#F44336',
                            }}
                          />
                        </div>
                        <div className="text-[9px] text-gray-400 text-center mt-0.5">
                          {Math.floor(order.patienceRemaining)}s
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Serve button appears when matching dish is ready */}
                  {matchingDish && (
                    <button
                      onClick={() => handleServeDish(matchingDish.recipe)}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg pointer-events-auto transition-all active:scale-95 action-button touch-active"
                    >
                      ✨ Serve!
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warning Banners */}
      {warnings.length > 0 && (
        <div className="fixed top-64 left-0 right-0 z-40 pointer-events-none">
          <div className="max-w-2xl mx-auto space-y-2">
            {warnings.map((warning) => (
              <div
                key={warning.id}
                className="px-4 py-2 rounded-lg text-white text-center font-bold"
                style={{ backgroundColor: getWarningColor(warning.severity) }}
              >
                ⚠️ {warning.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {levelUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
            <div className="text-2xl text-yellow-600 mb-4">Level {levelUpData.newLevel}</div>
            <div className="text-xl font-bold mb-2">{levelUpData.title}</div>
            <p className="mb-4">{levelUpData.message}</p>
            {levelUpData.unlockedIngredients && levelUpData.unlockedIngredients.length > 0 && (
              <div className="mb-4">
                <div className="font-bold">New Ingredients Unlocked:</div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {levelUpData.unlockedIngredients.map((ing) => (
                    <span key={ing} className="px-2 py-1 bg-green-100 rounded text-sm">
                      {INGREDIENTS[ing]?.name || ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={closeLevelUpModal}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Disaster Mini-Game Overlay */}
      {activeDisaster && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">{activeDisaster.emoji}</div>
            <h2 className="text-3xl font-bold mb-2 text-red-600">{activeDisaster.name}!</h2>
            <div className="text-5xl font-bold text-red-600 mb-4">
              {activeDisaster.timeRemaining}s
            </div>
            <button
              onClick={resolveDisaster}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg font-bold text-xl hover:bg-blue-600"
            >
              {activeDisaster.actionButton}
            </button>
          </div>
        </div>
      )}

      {/* Spacer for merged header */}
      <div className="h-14"></div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="w-36 flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #4A3828 0%, #3D2E20 100%)',
            borderRight: '3px solid #2A1F14',
            boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex flex-col gap-1 p-1">
              {Object.entries(INGREDIENT_CATEGORIES).map(([catId, cat]) => (
                <div key={catId}>
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === catId ? null : catId)}
                    className={`w-full rounded-lg p-2 flex items-center justify-between transition-all ${expandedCategory === catId ? 'bg-amber-700/50' : 'bg-amber-900/30 hover:bg-amber-800/40'}`}
                  >
                    <span className="text-amber-100 text-xs font-medium flex items-center gap-1.5">
                      <span className="text-base">{cat.icon}</span>
                      {cat.name}
                    </span>
                    <span
                      className={`text-amber-300 text-xs transition-transform ${expandedCategory === catId ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Expanded Items */}
                  {expandedCategory === catId && (
                    <div className="grid grid-cols-2 gap-1 mt-1 mb-2 animate-fadeIn">
                      {cat.items
                        .filter((id) => isIngredientUnlocked(id))
                        .map((id) => {
                          const ing = INGREDIENTS[id];
                          if (!ing) {
                            return null;
                          }
                          return (
                            <div
                              key={id}
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, { type: id, state: ing.states[0] }, 'pantry')
                              }
                              onTouchStart={(e) =>
                                handleTouchStart(e, { type: id, state: ing.states[0] }, 'pantry')
                              }
                              className="rounded-lg p-1.5 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 active:opacity-70 transition-all duration-150 flex flex-col items-center select-none"
                              style={{
                                background: 'linear-gradient(145deg, #5D4A32 0%, #4A3828 100%)',
                                boxShadow:
                                  '2px 2px 4px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.1)',
                                touchAction: 'none',
                                minWidth: '44px',
                                minHeight: '44px',
                                WebkitTapHighlightColor: 'transparent',
                              }}
                              title={ing.name}
                            >
                              <IngredientSVG type={id} state={ing.states[0]} size={34} />
                              <span className="text-[8px] text-amber-200/80 text-center leading-tight mt-0.5 line-clamp-2">
                                {ing.name}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-5px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          `}</style>
        </div>

        <div className="flex-1 flex flex-col">
          <div
            className="flex-1 relative"
            data-drop-zone="workspace"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'workspace')}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="300" height="60">
                  <rect width="300" height="60" fill="#B8956E" />
                  <path
                    d="M0,8 Q75,4 150,8 T300,8"
                    stroke="#A68560"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.5"
                  />
                  <path
                    d="M0,20 Q75,16 150,20 T300,20"
                    stroke="#9A7850"
                    strokeWidth="0.8"
                    fill="none"
                    opacity="0.4"
                  />
                  <path
                    d="M0,32 Q75,28 150,32 T300,32"
                    stroke="#A68560"
                    strokeWidth="0.6"
                    fill="none"
                    opacity="0.35"
                  />
                  <path
                    d="M0,44 Q75,40 150,44 T300,44"
                    stroke="#9A7850"
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M0,54 Q75,52 150,54 T300,54"
                    stroke="#A68560"
                    strokeWidth="0.4"
                    fill="none"
                    opacity="0.25"
                  />
                  <ellipse cx="220" cy="30" rx="12" ry="18" fill="#8B6D50" opacity="0.25" />
                  <ellipse cx="80" cy="45" rx="8" ry="12" fill="#9A7850" opacity="0.18" />
                  <ellipse cx="260" cy="15" rx="6" ry="10" fill="#8B7050" opacity="0.15" />
                </pattern>
                <linearGradient id="counterShade" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="50%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#woodGrain)" />
              <rect width="100%" height="100%" fill="url(#counterShade)" />
            </svg>

            {/* Cutting Board */}
            <div
              className="absolute top-6 left-6 w-72 h-48 rounded-lg flex flex-col overflow-hidden"
              style={{
                background:
                  'linear-gradient(145deg, #DEB887 0%, #D2B48C 30%, #C4A46A 70%, #B8956A 100%)',
                border: '5px solid #8B7355',
                boxShadow:
                  '8px 8px 24px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.15)',
              }}
              data-drop-zone="cuttingBoard"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => handleDrop(e, 'cuttingBoard')}
              onClick={(e) => {
                // Tap-to-select: place selected item here
                if (tapToSelect.hasSelection) {
                  e.stopPropagation();
                  tapToSelect.placeItem('cuttingBoard');
                }
              }}
            >
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                <defs>
                  <pattern id="boardGrain" patternUnits="userSpaceOnUse" width="100" height="20">
                    <path
                      d="M0,5 Q25,3 50,5 T100,5"
                      stroke="#9A7850"
                      strokeWidth="0.8"
                      fill="none"
                    />
                    <path
                      d="M0,15 Q25,13 50,15 T100,15"
                      stroke="#8B6840"
                      strokeWidth="0.6"
                      fill="none"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#boardGrain)" />
                <line x1="15" y1="25" x2="85" y2="28" stroke="#6B5344" strokeWidth="0.4" />
                <line x1="30" y1="45" x2="130" y2="43" stroke="#6B5344" strokeWidth="0.3" />
                <line x1="50" y1="65" x2="160" y2="67" stroke="#6B5344" strokeWidth="0.4" />
                <line x1="20" y1="85" x2="110" y2="83" stroke="#6B5344" strokeWidth="0.35" />
                <line x1="80" y1="35" x2="200" y2="37" stroke="#6B5344" strokeWidth="0.3" />
              </svg>
              <div className="flex-1 flex flex-wrap gap-1 p-3 items-center justify-center content-center relative z-10">
                {sushiRoll ? (
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedItem({
                        id: sushiRoll.id,
                        type: 'sushiRoll',
                        state: 'rolled',
                        source: 'cuttingBoard',
                        ingredients: sushiRoll.ingredients,
                      });
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                  >
                    <SushiRollVisual ingredients={sushiRoll.ingredients} />
                  </div>
                ) : (
                  <>
                    {cuttingBoardItems.map((item) =>
                      item.type === 'mixedBowl' ? (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedItem({ ...item, source: 'cuttingBoard' });
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                        >
                          <MixedIngredientsVisual items={item.items} />
                        </div>
                      ) : (
                        renderDraggableIngredient(item, 'cuttingBoard', 52)
                      )
                    )}
                    {cuttingBoardItems.length === 0 && (
                      <span className="text-amber-900/30 text-xs italic">
                        Drop ingredients here
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-1.5 p-2 bg-gradient-to-t from-amber-900/50 to-transparent">
                <button
                  onClick={handleChop}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all shadow action-button touch-active ${selectedTool === 'knife' ? 'bg-green-600 text-white' : 'bg-amber-100/90 text-amber-900 hover:bg-amber-50 active:bg-amber-200'}`}
                >
                  🔪 Chop
                </button>
                <button
                  onClick={handlePeel}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all shadow action-button touch-active ${selectedTool === 'peeler' ? 'bg-green-600 text-white' : 'bg-amber-100/90 text-amber-900 hover:bg-amber-50 active:bg-amber-200'}`}
                >
                  🥔 Peel
                </button>
                <button
                  onClick={handleGrate}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all shadow action-button touch-active ${selectedTool === 'grater' ? 'bg-green-600 text-white' : 'bg-amber-100/90 text-amber-900 hover:bg-amber-50 active:bg-amber-200'}`}
                >
                  🧀 Grate
                </button>
                <button
                  onClick={handleRoll}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all shadow action-button touch-active ${selectedTool === 'rollingMat' ? 'bg-green-600 text-white' : 'bg-amber-100/90 text-amber-900 hover:bg-amber-50 active:bg-amber-200'}`}
                >
                  🍣 Roll
                </button>
                <button
                  onClick={() => clearStation('cuttingBoard')}
                  className="px-3 py-2.5 rounded-lg text-sm bg-red-100 text-red-800 hover:bg-red-200 active:bg-red-300 shadow clear-button touch-active"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mixing Bowl */}
            <div
              className="absolute top-8 left-[310px] w-44 h-44"
              data-drop-zone="mixingBowl"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => handleDrop(e, 'mixingBowl')}
              onClick={(e) => {
                if (tapToSelect.hasSelection) {
                  e.stopPropagation();
                  tapToSelect.placeItem('mixingBowl');
                }
              }}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(4px 6px 8px rgba(0,0,0,0.3))' }}
              >
                <defs>
                  <radialGradient id="bowlOuter" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#F8F5F0" />
                    <stop offset="100%" stopColor="#C8C4B8" />
                  </radialGradient>
                  <radialGradient id="bowlInner" cx="50%" cy="60%" r="50%">
                    <stop offset="0%" stopColor="#FAFAF8" />
                    <stop offset="100%" stopColor="#E8E4DC" />
                  </radialGradient>
                </defs>
                <ellipse cx="50" cy="90" rx="36" ry="6" fill="rgba(0,0,0,0.15)" />
                <ellipse
                  cx="50"
                  cy="55"
                  rx="44"
                  ry="34"
                  fill="url(#bowlOuter)"
                  stroke="#A09890"
                  strokeWidth="1.5"
                />
                <ellipse cx="50" cy="55" rx="38" ry="28" fill="url(#bowlInner)" />
                <ellipse cx="38" cy="42" rx="10" ry="5" fill="rgba(255,255,255,0.35)" />
                <ellipse
                  cx="50"
                  cy="55"
                  rx="44"
                  ry="34"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
              </svg>
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0 pt-6">
                {bowlMixed && mixingBowlItems.length > 0 ? (
                  <div
                    draggable
                    onDragStart={(e) => {
                      // When dragging mixed contents, we'll move all items
                      setDraggedItem({
                        id: 'mixed-' + Date.now(),
                        type: 'mixedBowl',
                        items: mixingBowlItems,
                        source: 'mixingBowl',
                      });
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onTouchStart={(e) => {
                      const item = {
                        id: 'mixed-' + Date.now(),
                        type: 'mixedBowl',
                        items: mixingBowlItems,
                      };
                      handleTouchStart(e, item, 'mixingBowl');
                    }}
                    className="cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 active:opacity-70 transition-all duration-150 select-none"
                    style={{
                      touchAction: 'none',
                      minWidth: '44px',
                      minHeight: '44px',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    title="Drag to move mixed ingredients"
                  >
                    <MixedIngredientsVisual items={mixingBowlItems} />
                  </div>
                ) : (
                  mixingBowlItems.map((item) => renderDraggableIngredient(item, 'mixingBowl', 32))
                )}
              </div>
              <button
                onClick={handleMix}
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow action-button touch-active ${selectedTool === 'whisk' ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-800 hover:bg-white active:bg-stone-200'}`}
              >
                🥄 Mix
              </button>
              <button
                onClick={() => clearStation('mixingBowl')}
                className="absolute -bottom-2 right-1 px-2.5 py-2 rounded-lg text-sm bg-red-100 text-red-800 hover:bg-red-200 active:bg-red-300 shadow clear-button touch-active"
              >
                ✕
              </button>
            </div>

            {/* Stove */}
            <div
              className="absolute top-6 right-6 w-[380px] h-44 rounded-lg overflow-hidden flex flex-col"
              style={{
                background: 'linear-gradient(145deg, #1A1A1A 0%, #0A0A0A 100%)',
                border: '4px solid #2A2A2A',
                boxShadow: '10px 10px 30px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.08)',
              }}
            >
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-gray-600 text-[8px] font-bold tracking-[0.3em]">
                PROFESSIONAL SERIES
              </div>
              <div className="absolute top-1 right-2 flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #4A4A4A 0%, #2A2A2A 100%)',
                      border: '1px solid #3A3A3A',
                    }}
                  />
                ))}
              </div>

              {/* Cookware Area */}
              <div className="flex justify-around items-start flex-1 pt-3 px-4">
                {/* Pot */}
                <div
                  className="relative w-28 h-28"
                  data-drop-zone="pot"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => handleDrop(e, 'pot')}
                  onClick={(e) => {
                    if (tapToSelect.hasSelection) {
                      e.stopPropagation();
                      tapToSelect.placeItem('pot');
                    }
                  }}
                >
                  <div
                    className={`absolute inset-2 rounded-full transition-all duration-700 ${potHeat ? 'bg-orange-500/60 blur-xl animate-pulse' : 'bg-orange-950/20'}`}
                  />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#3A3A3A" strokeWidth="3" />
                    <circle cx="50" cy="50" r="34" fill="none" stroke="#2A2A2A" strokeWidth="2" />
                    <circle cx="50" cy="50" r="26" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="18" fill="none" stroke="#2A2A2A" strokeWidth="1" />
                    {potHeat && (
                      <>
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#FF6B35"
                          strokeWidth="2.5"
                          opacity="0.7"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="30"
                          fill="none"
                          stroke="#FF4500"
                          strokeWidth="1.5"
                          opacity="0.5"
                        />
                      </>
                    )}
                  </svg>
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                    style={{ filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.4))' }}
                  >
                    <defs>
                      <linearGradient id="potBody" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#909090" />
                        <stop offset="30%" stopColor="#707070" />
                        <stop offset="70%" stopColor="#606060" />
                        <stop offset="100%" stopColor="#404040" />
                      </linearGradient>
                      <linearGradient id="potRim" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A0A0A0" />
                        <stop offset="100%" stopColor="#606060" />
                      </linearGradient>
                    </defs>
                    <ellipse
                      cx="50"
                      cy="60"
                      rx="34"
                      ry="24"
                      fill="url(#potBody)"
                      stroke="#404040"
                      strokeWidth="1.5"
                    />
                    <ellipse cx="50" cy="56" rx="28" ry="18" fill="#383838" />
                    <ellipse
                      cx="50"
                      cy="48"
                      rx="34"
                      ry="12"
                      fill="url(#potRim)"
                      stroke="#505050"
                      strokeWidth="1"
                    />
                    <ellipse cx="50" cy="48" rx="28" ry="8" fill="#404040" />
                    <rect
                      x="10"
                      y="54"
                      width="12"
                      height="7"
                      rx="2"
                      fill="#606060"
                      stroke="#404040"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="78"
                      y="54"
                      width="12"
                      height="7"
                      rx="2"
                      fill="#606060"
                      stroke="#404040"
                      strokeWidth="0.5"
                    />
                    <ellipse cx="38" cy="45" rx="8" ry="2.5" fill="rgba(255,255,255,0.12)" />
                  </svg>
                  <SteamEffect active={potHeat} intensity={1.2} />
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0 pt-4">
                    {potItems.map((item) =>
                      item.type === 'mixedBowl' ? (
                        <div key={item.id} className="scale-50">
                          <MixedIngredientsVisual items={item.items} />
                        </div>
                      ) : (
                        renderDraggableIngredient(item, 'pot', 24)
                      )
                    )}
                  </div>
                </div>

                {/* Pan */}
                <div
                  className="relative w-32 h-28"
                  data-drop-zone="pan"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => handleDrop(e, 'pan')}
                  onClick={(e) => {
                    if (tapToSelect.hasSelection) {
                      e.stopPropagation();
                      tapToSelect.placeItem('pan');
                    }
                  }}
                >
                  <div
                    className={`absolute inset-4 left-2 rounded-full transition-all duration-700 ${panHeat ? 'bg-orange-500/60 blur-xl animate-pulse' : 'bg-orange-950/20'}`}
                  />
                  <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full">
                    <circle cx="48" cy="50" r="40" fill="none" stroke="#3A3A3A" strokeWidth="3" />
                    <circle cx="48" cy="50" r="32" fill="none" stroke="#2A2A2A" strokeWidth="2" />
                    <circle cx="48" cy="50" r="24" fill="none" stroke="#3A3A3A" strokeWidth="1" />
                    {panHeat && (
                      <>
                        <circle
                          cx="48"
                          cy="50"
                          r="36"
                          fill="none"
                          stroke="#FF6B35"
                          strokeWidth="2.5"
                          opacity="0.7"
                        />
                        <circle
                          cx="48"
                          cy="50"
                          r="28"
                          fill="none"
                          stroke="#FF4500"
                          strokeWidth="1.5"
                          opacity="0.5"
                        />
                      </>
                    )}
                  </svg>
                  <svg
                    viewBox="0 0 120 100"
                    className="absolute inset-0 w-full h-full"
                    style={{ filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.4))' }}
                  >
                    <defs>
                      <radialGradient id="panSurface" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#4A4A4A" />
                        <stop offset="100%" stopColor="#2A2A2A" />
                      </radialGradient>
                    </defs>
                    <ellipse
                      cx="48"
                      cy="52"
                      rx="40"
                      ry="32"
                      fill="#505050"
                      stroke="#3A3A3A"
                      strokeWidth="2"
                    />
                    <ellipse cx="48" cy="50" rx="36" ry="28" fill="url(#panSurface)" />
                    <ellipse cx="48" cy="50" rx="32" ry="24" fill="#333" />
                    <rect
                      x="88"
                      y="44"
                      width="30"
                      height="12"
                      rx="3"
                      fill="#3A3A3A"
                      stroke="#222"
                      strokeWidth="1"
                    />
                    <rect x="92" y="47" width="22" height="6" rx="1.5" fill="#484848" />
                    <ellipse cx="36" cy="42" rx="10" ry="4" fill="rgba(255,255,255,0.08)" />
                  </svg>
                  <SteamEffect active={panHeat} intensity={0.8} />
                  <SizzleEffect active={panHeat} />
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0 pt-2 pr-10">
                    {panItems.map((item) =>
                      item.type === 'mixedBowl' ? (
                        <div key={item.id} className="scale-50">
                          <MixedIngredientsVisual items={item.items} />
                        </div>
                      ) : (
                        renderDraggableIngredient(item, 'pan', 26)
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Button Bar - All buttons in a single row below cookware */}
              <div className="flex justify-center items-center gap-1 px-2 pb-2 pt-1">
                {/* Pot Controls */}
                <button
                  onClick={() => {
                    if (selectedTool === 'ladle') {
                      showNotification('Stirred the pot!', 'success');
                      setPotHeat(true);
                      setTimeout(() => setPotHeat(false), 800);
                    } else {
                      showNotification('Select the ladle first!', 'error');
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold shadow action-button touch-active ${selectedTool === 'ladle' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300 active:bg-gray-500'}`}
                >
                  🥣
                </button>
                <button
                  onClick={() => handleCook('pot')}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-b from-orange-600 to-orange-800 text-white hover:from-orange-500 hover:to-orange-700 shadow-lg border border-orange-500/50 action-button touch-active"
                >
                  🍲 Boil
                </button>
                <button
                  onClick={() => clearStation('pot')}
                  className="px-2 py-1 rounded-lg text-xs bg-red-900/80 text-red-200 hover:bg-red-800 active:bg-red-700 border border-red-700/50 clear-button touch-active"
                >
                  ✕
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-gray-600 mx-1" />

                {/* Pan Controls */}
                <button
                  onClick={() => handleCook('pan')}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-b from-orange-600 to-orange-800 text-white hover:from-orange-500 hover:to-orange-700 shadow-lg border border-orange-500/50 action-button touch-active"
                >
                  🍳 Fry
                </button>
                <button
                  onClick={handleTongs}
                  className={`px-2 py-1 rounded-lg text-xs font-bold shadow action-button touch-active ${selectedTool === 'tongs' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300 active:bg-gray-500'}`}
                >
                  🥢
                </button>
                <button
                  onClick={() => clearStation('pan')}
                  className="px-2 py-1 rounded-lg text-xs bg-red-900/80 text-red-200 hover:bg-red-800 active:bg-red-700 border border-red-700/50 clear-button touch-active"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sink - Bottom Left */}
            <div
              className="absolute bottom-6 left-6 w-56 h-40 rounded-lg overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #8A9A9A 0%, #6A7A7A 100%)',
                border: '4px solid #5A6A6A',
                boxShadow: '6px 6px 20px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              data-drop-zone="sink"
              onDrop={(e) => handleDrop(e, 'sink')}
              onClick={(e) => {
                if (tapToSelect.hasSelection) {
                  e.stopPropagation();
                  tapToSelect.placeItem('sink');
                }
              }}
            >
              {/* Faucet */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                <svg width="60" height="35" viewBox="0 0 60 35">
                  <defs>
                    <linearGradient id="faucetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#A0A8A8" />
                      <stop offset="50%" stopColor="#C0C8C8" />
                      <stop offset="100%" stopColor="#A0A8A8" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="24"
                    y="0"
                    width="12"
                    height="6"
                    rx="2"
                    fill="url(#faucetGrad)"
                    stroke="#707878"
                    strokeWidth="1"
                  />
                  <path
                    d="M30,6 L30,16 Q30,22 24,22 L24,26"
                    stroke="url(#faucetGrad)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <ellipse
                    cx="24"
                    cy="28"
                    rx="3"
                    ry="1.5"
                    fill="#B0B8B8"
                    stroke="#808888"
                    strokeWidth="0.5"
                  />
                  <circle cx="16" cy="5" r="4" fill="#4A9FD4" stroke="#3080B0" strokeWidth="1" />
                  <circle cx="44" cy="5" r="4" fill="#D44A4A" stroke="#B03030" strokeWidth="1" />
                </svg>
              </div>

              {/* Basin */}
              <div
                className="absolute bottom-2 left-2 right-2 h-20 rounded-lg overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #E8E8E8 0%, #C8C8C8 100%)',
                  border: '2px solid #A0A0A0',
                  boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.2)',
                }}
              >
                <WaterEffect active={waterRunning} />
                <div className="flex flex-wrap items-center justify-center gap-1 p-1 h-full">
                  {sinkItems.map((item) => renderDraggableIngredient(item, 'sink', 24))}
                </div>
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #606060 0%, #303030 100%)',
                    border: '2px solid #404040',
                  }}
                >
                  <div
                    className="absolute inset-0.5 rounded-full"
                    style={{
                      background:
                        'repeating-conic-gradient(#404040 0deg 30deg, #303030 30deg 60deg)',
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <button
                onClick={handleWash}
                className="absolute bottom-1 right-1 px-3 py-2 rounded-lg text-xs font-bold bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600 shadow action-button touch-active"
              >
                💧 Wash
              </button>
              <button
                onClick={() => clearStation('sink')}
                className="absolute bottom-1 left-1 px-2.5 py-2 rounded-lg text-sm bg-red-100 text-red-800 hover:bg-red-200 active:bg-red-300 shadow clear-button touch-active"
              >
                ✕
              </button>
            </div>

            {/* Plate */}
            <div
              className="absolute bottom-6 right-6 w-56 h-44 rounded-xl flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #F5F5F5 0%, #E0E0E0 100%)',
                border: '2px solid #C8C8C8',
                boxShadow: '6px 6px 20px rgba(0,0,0,0.2), inset 0 2px 6px rgba(255,255,255,0.8)',
              }}
              data-drop-zone="plate"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => handleDrop(e, 'plate')}
              onClick={(e) => {
                if (tapToSelect.hasSelection) {
                  e.stopPropagation();
                  tapToSelect.placeItem('plate');
                }
              }}
            >
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <defs>
                  <radialGradient id="plateGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E8E8E8" />
                  </radialGradient>
                </defs>
                <ellipse cx="50" cy="60" rx="44" ry="8" fill="rgba(0,0,0,0.1)" />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="44"
                  ry="36"
                  fill="url(#plateGrad)"
                  stroke="#D0D0D0"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="38"
                  ry="30"
                  fill="#FAFAFA"
                  stroke="#E0E0E0"
                  strokeWidth="0.8"
                />
                <ellipse cx="50" cy="50" rx="32" ry="24" fill="#FFF" />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="24"
                  ry="18"
                  fill="#FEFEFE"
                  stroke="#F0F0F0"
                  strokeWidth="0.5"
                />
                <ellipse cx="38" cy="40" rx="10" ry="5" fill="rgba(255,255,255,0.9)" />
              </svg>
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 pt-4">
                {plateItems.map((item) =>
                  item.type === 'completedDish' ? (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, 'plate')}
                      onTouchStart={(e) => handleTouchStart(e, item, 'plate')}
                      className="flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 active:opacity-70 transition-all duration-150 select-none"
                      style={{
                        touchAction: 'none',
                        minWidth: '44px',
                        minHeight: '44px',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <div className="drop-shadow-lg">
                        <CompletedDishVisual recipeId={item.recipeId} size={50} />
                      </div>
                      <span className="text-[8px] text-gray-600 font-medium">
                        {item.recipe.name}
                      </span>
                    </div>
                  ) : item.type === 'sushiRoll' ? (
                    <div key={item.id} className="scale-75">
                      <SushiRollVisual ingredients={item.ingredients} />
                    </div>
                  ) : item.type === 'mixedBowl' ? (
                    <div key={item.id} className="scale-50">
                      <MixedIngredientsVisual items={item.items} />
                    </div>
                  ) : (
                    renderDraggableIngredient(item, 'plate', 30)
                  )
                )}
              </div>
              <span className="text-gray-400 text-[10px] mt-1 font-medium">Plating Area</span>
              <button
                onClick={() => clearStation('plate')}
                className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg text-xs bg-red-100 text-red-800 hover:bg-red-200 shadow action-button touch-active"
              >
                ✕
              </button>
            </div>

            {completedDishes.length > 0 && (
              <div className="absolute top-[45%] right-6 bg-white/95 rounded-xl shadow-xl p-3 max-w-[220px] border border-amber-200">
                <h3 className="font-bold text-amber-900 text-sm mb-2">🍽️ Completed Dishes</h3>
                <p className="text-[10px] text-gray-600 mb-2">Click to serve to customers!</p>
                <div className="flex flex-wrap gap-1.5">
                  {completedDishes.map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => handleServeDish(dish)}
                      className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-3 py-2 rounded-lg text-xs font-medium border border-green-200 shadow-sm hover:from-green-200 hover:to-green-100 hover:shadow-md transition-all cursor-pointer active:scale-95 action-button touch-active"
                    >
                      {dish.emoji} {dish.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, 'workspace')}
                className="absolute cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                style={{
                  left: item.x,
                  top: item.y,
                  filter: 'drop-shadow(3px 4px 5px rgba(0,0,0,0.3))',
                }}
              >
                <IngredientSVG type={item.type} state={item.state} size={55} />
              </div>
            ))}
          </div>

          <div
            className="h-16 flex items-center justify-center gap-3 px-4"
            style={{
              background: 'linear-gradient(180deg, #3D2E1E 0%, #2A1F14 100%)',
              borderTop: '2px solid #5D4A32',
            }}
          >
            <span className="text-amber-300/70 text-sm font-medium">Tools:</span>
            {[
              { id: 'knife', icon: '🔪', name: 'Knife' },
              { id: 'peeler', icon: '🥔', name: 'Peeler' },
              { id: 'grater', icon: '🧀', name: 'Grater' },
              { id: 'whisk', icon: '🥄', name: 'Whisk' },
              { id: 'rollingMat', icon: '🎋', name: 'Mat' },
              { id: 'tongs', icon: '🥢', name: 'Tongs' },
              { id: 'ladle', icon: '🥣', name: 'Ladle' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                className={`w-12 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${selectedTool === tool.id ? 'bg-gradient-to-b from-amber-400 to-amber-600 scale-110 shadow-lg ring-2 ring-amber-300' : 'bg-gradient-to-b from-stone-600 to-stone-700 hover:from-stone-500 hover:to-stone-600'}`}
                style={{
                  boxShadow:
                    selectedTool === tool.id
                      ? '0 4px 12px rgba(217, 119, 6, 0.4)'
                      : '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-lg">{tool.icon}</span>
                <span
                  className={`text-[8px] font-medium ${selectedTool === tool.id ? 'text-amber-900' : 'text-stone-300'}`}
                >
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showRecipeBook && (
        <div
          className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 backdrop-blur-sm"
          onClick={() => setShowRecipeBook(false)}
        >
          <div className="relative flex" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -right-9 top-6 flex flex-col gap-1.5 z-10">
              {/* Components tab first */}
              <button
                onClick={() => setCurrentRecipePage(-1)}
                className={`w-10 h-14 rounded-r-xl flex items-center justify-center text-lg shadow-lg transition-all ${currentRecipePage === -1 ? 'bg-amber-50 translate-x-1' : 'bg-amber-100 hover:translate-x-1'}`}
                style={{ border: '2px solid #8B4513', borderLeft: 'none' }}
                title="Recipe Components"
              >
                📝
              </button>

              {/* Recipe tabs */}
              {Object.entries(RECIPES).map(([id, recipe], index) => (
                <button
                  key={id}
                  onClick={() => setCurrentRecipePage(index)}
                  className={`w-10 h-14 rounded-r-xl flex items-center justify-center text-lg shadow-lg transition-all ${currentRecipePage === index ? 'bg-amber-50 translate-x-1' : 'bg-amber-100 hover:translate-x-1'}`}
                  style={{ border: '2px solid #8B4513', borderLeft: 'none' }}
                  title={recipe.name}
                >
                  {recipe.emoji}
                </button>
              ))}
            </div>

            <div
              className="w-[620px] h-[400px] rounded-xl shadow-2xl flex overflow-hidden"
              style={{ border: '8px solid #5D3A1A', background: '#5D3A1A' }}
            >
              <div
                className="w-6 flex flex-col items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(90deg, #3E2723 0%, #5D4037 50%, #3E2723 100%)',
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-1.5 h-14 bg-amber-600/60 rounded-full" />
                ))}
              </div>

              <div
                className="flex-1 p-5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FFF8E7 0%, #F5E6C8 100%)',
                  borderRight: '1px solid #D4C4A8',
                }}
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 24px, #C9B896 24px, #C9B896 25px)',
                  }}
                />
                <button
                  onClick={() => setShowRecipeBook(false)}
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-500 flex items-center justify-center shadow"
                >
                  ✕
                </button>

                {currentRecipePage === -1 ? (
                  // Recipe Components Page
                  <div className="h-full flex flex-col pt-4 relative z-10">
                    <h2 className="text-xl font-bold text-amber-900 text-center border-b-2 border-amber-800 pb-2 mb-3">
                      Recipe Components
                    </h2>
                    <p className="text-xs text-amber-700 italic text-center mb-4">
                      Learn how to prepare ingredients for recipes
                    </p>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                      {/* Rice Preparations */}
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <div className="font-bold text-amber-900 mb-1">🍚 Rice:</div>
                        <div className="ml-3 space-y-0.5">
                          <div>Rice (dry) → Sink + Wash = Rice (washed)</div>
                          <div>Rice (washed) → Pot + Boil = Rice (cooked)</div>
                          <div>Rice (cooked) + Vinegar → Bowl + Mix = Rice (seasoned)</div>
                        </div>
                      </div>

                      {/* Egg Preparations */}
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <div className="font-bold text-amber-900 mb-1">🥚 Egg:</div>
                        <div className="ml-3 space-y-0.5">
                          <div>Egg (raw) → Bowl + Mix = Egg (beaten)</div>
                          <div>Egg (beaten) → Pan + Fry = Egg (cooked)</div>
                        </div>
                      </div>

                      {/* Shrimp Preparations */}
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <div className="font-bold text-amber-900 mb-1">🦐 Shrimp:</div>
                        <div className="ml-3 space-y-0.5">
                          <div>Shrimp (raw) → Board + Peel = Shrimp (peeled)</div>
                          <div>Shrimp (peeled) → Pan + Fry = Shrimp (cooked)</div>
                        </div>
                      </div>

                      {/* Chicken Preparations */}
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <div className="font-bold text-amber-900 mb-1">🍗 Chicken:</div>
                        <div className="ml-3 space-y-0.5">
                          <div>Chicken (raw) → Board + Chop = Chicken (diced)</div>
                          <div>Chicken (diced) → Pot/Pan + Cook = Chicken (cooked)</div>
                        </div>
                      </div>

                      {/* Vegetable Preparations */}
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <div className="font-bold text-amber-900 mb-1">🥕 Vegetables:</div>
                        <div className="ml-3 space-y-0.5">
                          <div>Carrot/Cucumber → Board + Chop = Sliced</div>
                          <div>Onion → Board + Chop = Diced</div>
                          <div>Garlic → Board + Grate = Minced</div>
                          <div>Onion (diced) → Pan + Fry = Caramelized</div>
                          <div>Garlic (minced) → Pan + Fry = Fried</div>
                        </div>
                      </div>

                      {/* Salmon Preparations */}
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <div className="font-bold text-amber-900 mb-1">🐟 Salmon:</div>
                        <div className="ml-3 space-y-0.5">
                          <div>Salmon (raw) → Board + Chop = Salmon (sliced)</div>
                          <div>Salmon (sliced) → Pan + Fry = Salmon (cooked)</div>
                        </div>
                      </div>

                      {/* Nori Info */}
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <div className="font-bold text-amber-900 mb-1">🌿 Nori (seaweed):</div>
                        <div className="ml-3">Ready to use - no prep needed!</div>
                      </div>
                    </div>

                    <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-100/80 to-amber-50/80 rounded-lg border border-amber-300">
                      <p className="text-xs text-amber-800 font-medium">
                        💡 Tip: Use these preparations to create the ingredients needed for each
                        recipe!
                      </p>
                    </div>
                  </div>
                ) : (
                  // Regular Recipe Page
                  (() => {
                    const [id, recipe] = Object.entries(RECIPES)[currentRecipePage];
                    return (
                      <div className="h-full flex flex-col pt-4 relative z-10">
                        <h2 className="text-xl font-bold text-amber-900 text-center border-b-2 border-amber-800 pb-2">
                          {recipe.name}
                        </h2>
                        <p className="text-xs text-amber-700 italic text-center mb-3">
                          {recipe.description}
                        </p>
                        <h3 className="font-bold text-amber-900 text-sm mb-2">Ingredients:</h3>
                        <div className="mb-3">
                          {recipe.required.map((req, i) => (
                            <div key={i} className="flex items-center gap-2 mb-1">
                              <IngredientSVG type={req.ingredient} state={req.state} size={24} />
                              <span className="text-sm text-amber-800 font-medium">
                                {INGREDIENTS[req.ingredient]?.name}
                              </span>
                              <span className="text-xs text-amber-600">({req.state})</span>
                            </div>
                          ))}
                        </div>
                        {recipe.optional.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-bold text-amber-700 text-xs mb-1">Optional:</h4>
                            <div className="flex gap-2 flex-wrap">
                              {recipe.optional.map((opt, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1 bg-amber-100/50 rounded px-1.5 py-0.5"
                                >
                                  <IngredientSVG
                                    type={opt}
                                    state={INGREDIENTS[opt].states[0]}
                                    size={18}
                                  />
                                  <span className="text-xs text-amber-700">
                                    {INGREDIENTS[opt]?.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-auto p-3 bg-gradient-to-r from-amber-100/80 to-amber-50/80 rounded-lg border border-amber-300">
                          <h3 className="font-bold text-amber-900 text-xs mb-1">Method:</h3>
                          <p className="text-xs text-amber-800">
                            {recipe.action === 'roll' &&
                              '1. Prep ingredients on cutting board\n2. Select rolling mat\n3. Click Roll'}
                            {recipe.action === 'fry' &&
                              '1. Add ingredients to pan\n2. Click Fry to cook'}
                            {recipe.action === 'boil' &&
                              '1. Add ingredients to pot\n2. Click Boil to cook'}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              <div
                className="flex-1 p-5 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(225deg, #FFF8E7 0%, #F5E6C8 100%)' }}
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 24px, #C9B896 24px, #C9B896 25px)',
                  }}
                />
                {currentRecipePage === -1 ? (
                  // Recipe Components Icon Panel
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className="w-36 h-36 rounded-full flex items-center justify-center shadow-xl"
                      style={{
                        background:
                          'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #F5F5F5 50%, #E0E0E0 100%)',
                        border: '4px solid #DDD',
                      }}
                    >
                      <span className="text-6xl">📝</span>
                    </div>
                    <h3 className="text-lg font-bold text-amber-900 mt-4">Recipe Components</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
                      <span className="text-amber-500">✦</span>
                      <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
                    </div>
                    <p className="text-xs text-amber-700 mt-3 text-center max-w-[200px]">
                      Essential ingredient preparations for all recipes
                    </p>
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => setCurrentRecipePage(0)}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all bg-gradient-to-b from-amber-500 to-amber-700 text-white hover:from-amber-400 hover:to-amber-600 shadow"
                      >
                        View Recipes →
                      </button>
                    </div>
                  </div>
                ) : (
                  // Regular Recipe Icon Panel
                  (() => {
                    const [id, recipe] = Object.entries(RECIPES)[currentRecipePage];
                    return (
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className="w-36 h-36 rounded-full flex items-center justify-center shadow-xl"
                          style={{
                            background:
                              'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #F5F5F5 50%, #E0E0E0 100%)',
                            border: '4px solid #DDD',
                          }}
                        >
                          <span className="text-6xl">{recipe.emoji}</span>
                        </div>
                        <h3 className="text-lg font-bold text-amber-900 mt-4">{recipe.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
                          <span className="text-amber-500">✦</span>
                          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
                        </div>
                        <div className="flex gap-3 mt-5">
                          <button
                            onClick={() => setCurrentRecipePage((p) => Math.max(0, p - 1))}
                            disabled={currentRecipePage === 0}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${currentRecipePage === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-b from-amber-500 to-amber-700 text-white hover:from-amber-400 hover:to-amber-600 shadow'}`}
                          >
                            ← Prev
                          </button>
                          <button
                            onClick={() =>
                              setCurrentRecipePage((p) =>
                                Math.min(Object.keys(RECIPES).length - 1, p + 1)
                              )
                            }
                            disabled={currentRecipePage === Object.keys(RECIPES).length - 1}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${currentRecipePage === Object.keys(RECIPES).length - 1 ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-b from-amber-500 to-amber-700 text-white hover:from-amber-400 hover:to-amber-600 shadow'}`}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
