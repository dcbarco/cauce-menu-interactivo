import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CATEGORIES, ICON_PATHS } from '../../config/constants';

export default function Tooltip({ node }) {
  if (!node) return null;

  const clearSelection = useStore(s => s.clearSelection);
  const isDarkMode = useStore(s => s.isDarkMode);
  const showAdvancedInfo = useStore(s => s.showAdvancedInfo);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    let startTime = Date.now();
    let animationFrameId;
    const TOTAL_TIME = 30000; // 30 segundos

    const resetTimer = () => {
      startTime = Date.now();
    };

    window.addEventListener('pointerdown', resetTimer);
    window.addEventListener('wheel', resetTimer);

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = TOTAL_TIME - elapsed;
      
      if (remaining <= 0) {
        setProgress(0);
        clearSelection();
      } else {
        setProgress((remaining / TOTAL_TIME) * 100);
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('wheel', resetTimer);
    };
  }, [node.id, clearSelection]);

  const equipmentLines = typeof node.equipment === 'string'
    ? node.equipment.split('\n').filter(Boolean)
    : Array.isArray(node.equipment) ? node.equipment : [];

  const catColor = CATEGORIES[node.type]?.color || '#4fc3f7';
  const cat = CATEGORIES[node.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 10, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto w-[270px] sm:w-[320px] relative ${
        isDarkMode ? 'glass-panel-elevated' : 'bg-white/15 backdrop-blur-[6px] rounded-2xl border border-white/25 shadow-xl'
      }`}
      style={{ transform: 'translate(60px, -50%)' }}
    >
      {/* Visual connector line back to the point origin */}
      <div className="absolute top-1/2 h-px" style={{ left: '-40px', width: '40px', background: isDarkMode ? `${catColor}50` : `${catColor}40` }} />
      <div className="absolute top-1/2 w-1.5 h-1.5 rounded-full -translate-y-1/2" style={{ left: '-40px', background: catColor }} />

      {/* Progress Bar Container */}
      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full overflow-hidden" 
           style={{ background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
        <div 
          className="h-full rounded-full transition-none"
          style={{ 
            width: `${progress}%`,
            background: isDarkMode 
              ? `linear-gradient(90deg, ${catColor}, ${catColor}80)`
              : `linear-gradient(90deg, #e86c1a, #f59e0b)`
          }}
        />
      </div>

      {/* Scrollable Content Container */}
      <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto no-scrollbar">
        {/* Title row with icon */}
        <div className="flex items-center gap-3 mb-4 mt-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ 
                 background: isDarkMode ? `${catColor}15` : `${catColor}12`,
                 border: `1px solid ${isDarkMode ? `${catColor}25` : `${catColor}20`}` 
               }}>
            {!isDarkMode && cat?.iconImage ? (
              <img 
                src={cat.iconImage} 
                alt={cat.label} 
                style={{ width: 18, height: 18, objectFit: 'contain', filter: `brightness(0) saturate(100%) sepia(100%) hue-rotate(${getHueRotation(catColor)}deg)` }} 
              />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24"
                   fill={catColor}>
                <path d={ICON_PATHS[CATEGORIES[node.type]?.icon] || ICON_PATHS.portatil} />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`font-grotesk text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-[#431407]'}`}>
              {node.tooltipTitle}
            </h3>
            <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5"
               style={{ color: isDarkMode ? catColor : '#c2410c' }}>
              {CATEGORIES[node.type]?.label || node.type}
            </p>
          </div>
        </div>

        {/* Concept */}
        {node.concept && (
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest mb-1.5"
               style={{ color: isDarkMode ? catColor : '#c2410c' }}>
              Explora
            </p>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/70' : 'text-[#431407] font-medium'}`}>
              {node.concept}
            </p>
          </div>
        )}

        {/* Equipment */}
        {showAdvancedInfo && equipmentLines.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-1.5"
               style={{ color: isDarkMode ? catColor : '#c2410c' }}>
              Equipamiento
            </p>
            <ul className="space-y-1">
              {equipmentLines.map((item, i) => (
                <li key={i} className={`text-sm flex items-start gap-2 ${isDarkMode ? 'text-white/70' : 'text-[#431407] font-medium'}`}>
                  <span className="mt-1 flex-shrink-0" style={{ color: isDarkMode ? catColor : '#c2410c' }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper to approximate hue rotation for icon tinting
function getHueRotation(hexColor) {
  // Simple mapping for known category colors
  const map = {
    '#8b5cf6': 260,  // purple (VR)
    '#10b981': 160,  // green (TACTIL)
    '#06b6d4': 190,  // cyan (PORTATIL)
    '#f59e0b': 40,   // amber (AUDIO)
    '#ec4899': 330,  // pink (AR)
    '#6366f1': 240,  // indigo (REPOSITORIO)
    '#14b8a6': 170,  // teal (PANTALLA)
    '#ef4444': 0,    // red (TOTEM)
  };
  return map[hexColor] || 0;
}
