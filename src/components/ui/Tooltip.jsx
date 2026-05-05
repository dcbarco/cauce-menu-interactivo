import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CATEGORIES, ICON_PATHS } from '../../config/constants';

export default function Tooltip({ node }) {
  if (!node) return null;

  const clearSelection = useStore(s => s.clearSelection);
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 10, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto glass-panel-elevated w-[270px] sm:w-[320px] relative"
      style={{ transform: 'translate(20px, -50%)' }}
    >
      {/* Visual connector line back to the point origin */}
      <div className="absolute top-1/2 -left-5 w-5 h-px" style={{ background: `${catColor}50` }} />
      <div className="absolute top-1/2 -left-5 w-1.5 h-1.5 rounded-full -translate-y-1/2" style={{ background: catColor }} />

      {/* Progress Bar Container */}
      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div 
          className="h-full rounded-full transition-none"
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${catColor}, ${catColor}80)`
          }}
        />
      </div>

      {/* Scrollable Content Container */}
      <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto no-scrollbar">
        {/* Title row with icon */}
        <div className="flex items-center gap-3 mb-4 mt-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: `${catColor}15`, border: `1px solid ${catColor}25` }}>
            <svg width="18" height="18" viewBox="0 0 24 24"
                 fill={catColor}>
              <path d={ICON_PATHS[CATEGORIES[node.type]?.icon] || ICON_PATHS.portatil} />
            </svg>
          </div>
          <div>
            <h3 className="font-grotesk text-lg font-bold leading-tight text-white">
              {node.tooltipTitle}
            </h3>
            <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5"
               style={{ color: catColor }}>
              {CATEGORIES[node.type]?.label || node.type}
            </p>
          </div>
        </div>

        {/* Concept */}
        {node.concept && (
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest mb-1.5"
               style={{ color: catColor }}>
              Concepto
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {node.concept}
            </p>
          </div>
        )}

        {/* Equipment */}
        {equipmentLines.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-1.5"
               style={{ color: catColor }}>
              Equipamiento
            </p>
            <ul className="space-y-1">
              {equipmentLines.map((item, i) => (
                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0" style={{ color: catColor }}>•</span>
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
