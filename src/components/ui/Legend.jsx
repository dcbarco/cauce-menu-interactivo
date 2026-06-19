import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { CATEGORIES } from '../../config/constants';

export default function Legend() {
  const activeCategory = useStore(s => s.activeCategory);
  const setActiveCategory = useStore(s => s.setActiveCategory);
  const isDarkMode = useStore(s => s.isDarkMode);

  useEffect(() => {
    if (!activeCategory) return;

    let timeoutId;
    const FILTER_INACTIVITY_TIME = 45000; // 45 segundos

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Resetear el filtro a "Todos" (null)
        if (useStore.getState().activeCategory) {
          useStore.getState().setActiveCategory(useStore.getState().activeCategory); // Esto hace un toggle a null en el store
        }
      }, FILTER_INACTIVITY_TIME);
    };

    window.addEventListener('pointerdown', resetTimer);
    window.addEventListener('wheel', resetTimer);
    window.addEventListener('pointermove', resetTimer);

    resetTimer(); // Iniciar el timer al montar o al cambiar la categoría

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('wheel', resetTimer);
      window.removeEventListener('pointermove', resetTimer);
    };
  }, [activeCategory]);

  return (
    <div className={`pointer-events-auto px-5 py-3 flex items-center gap-1.5 w-[90vw] md:w-auto overflow-x-auto no-scrollbar ${
      isDarkMode
        ? 'glass-panel'
        : 'legend-light'
    }`}>
      <span className={`text-[10px] font-mono uppercase tracking-widest mr-3 flex-shrink-0 ${
        isDarkMode ? 'text-white/30' : 'text-white/70'
      }`}>
        Categorías:
      </span>
      {Object.entries(CATEGORIES).map(([key, cat], index) => (
        <React.Fragment key={key}>
          {index > 0 && (
            <span className={`text-[10px] mx-0.5 ${isDarkMode ? 'text-white/10' : 'text-white/30'}`}>|</span>
          )}
          <button
            onClick={() => setActiveCategory(key)}
            className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all duration-200 whitespace-nowrap
              ${isDarkMode
                ? (activeCategory === key
                  ? 'text-white glass-panel-subtle'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5')
                : (activeCategory === key
                  ? 'bg-white text-orange-600 font-semibold rounded-full'
                  : 'text-white/80 hover:text-white hover:bg-white/15 rounded-full')
              }`}
            style={isDarkMode && activeCategory === key ? { color: cat.color, boxShadow: `0 0 12px ${cat.color}20` } : {}}
          >
            {cat.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
