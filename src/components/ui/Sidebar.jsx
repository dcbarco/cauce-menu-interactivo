import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CATEGORIES, ICON_PATHS } from '../../config/constants';

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

function getLightModeCategoryColor(type) {
  switch (type) {
    case 'VR':
      return '#3b0764'; // Deep purple/violet
    case 'TACTIL':
      return '#064e3b'; // Deep green
    case 'PORTATIL':
      return '#083344'; // Deep cyan
    case 'AUDIO':
      return '#78350f'; // Deep amber/brown
    case 'AR':
      return '#831843'; // Deep pink/maroon
    case 'REPOSITORIO':
      return '#1e1b4b'; // Deep indigo
    case 'PANTALLA':
      return '#115e59'; // Deep teal
    case 'TOTEM':
      return '#7f1d1d'; // Deep red
    case 'ANALOGICO':
      return '#4c1d95'; // Deep violet
    case 'OBJETO3D':
      return '#831843'; // Deep pink
    default:
      return '#7c2d12'; // Default deep orange/red
  }
}

function CategoryIcon({ type, size = 18, color = '#fff', isDarkMode = true, isSelected = false }) {
  const cat = CATEGORIES[type];
  const iconKey = cat ? cat.icon : 'portatil';
  const path = ICON_PATHS[iconKey] || ICON_PATHS.portatil;

  // In light mode, try to use PNG icon image if NOT selected
  if (!isDarkMode && cat?.iconImage && !isSelected) {
    return (
      <img
        src={cat.iconImage}
        alt={cat.label}
        style={{ width: size, height: size, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={0.95}>
      <path d={path} />
    </svg>
  );
}

function StationDetail({ node, isDarkMode, showAdvancedInfo }) {
  if (!node || !showAdvancedInfo) return null;
  const cat = CATEGORIES[node.type] || {};

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`pointer-events-auto mt-auto p-3 transition-all duration-300 ${
        isDarkMode 
          ? 'glass-panel' 
          : 'bg-white/15 backdrop-blur-[6px] rounded-2xl border border-white/25'
      }`}
    >
      <div className="mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ 
               background: isDarkMode ? `${cat.color || '#4fc3f7'}15` : 'rgba(232, 108, 26, 0.15)',
               border: `1px solid ${isDarkMode ? `${cat.color || '#4fc3f7'}30` : 'rgba(232, 108, 26, 0.25)'}`
             }}>
          <CategoryIcon 
            type={node.type} 
            size={16} 
            color={isDarkMode ? (cat.color || '#4fc3f7') : getLightModeCategoryColor(node.type)} 
            isDarkMode={isDarkMode} 
            isSelected={true} 
          />
        </div>
      </div>

      {/* Dato */}
      {showAdvancedInfo && node.dato && (
        <div className="mb-2.5">
          <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5"
             style={{ color: isDarkMode ? (cat.color || '#4fc3f7') : '#c2410c' }}>
            Dato
          </p>
          <p className={`text-[11px] font-mono leading-snug ${isDarkMode ? 'text-white/80' : 'text-[#431407] font-medium'}`}>
            {node.dato}
          </p>
        </div>
      )}

      {/* Origen */}
      {showAdvancedInfo && node.origen && (
        <div>
          <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5"
             style={{ color: isDarkMode ? (cat.color || '#4fc3f7') : '#c2410c' }}>
            Origen
          </p>
          <p className={`text-[11px] font-mono leading-snug ${isDarkMode ? 'text-white/80' : 'text-[#431407] font-medium'}`}>
            {node.origen}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function Sidebar() {
  const nodes = useStore(s => s.nodes);
  const isAdminMode = useStore(s => s.isAdminMode);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectNode = useStore(s => s.selectNode);
  const activeCategory = useStore(s => s.activeCategory);
  const isDarkMode = useStore(s => s.isDarkMode);
  const showAdvancedInfo = useStore(s => s.showAdvancedInfo);

  const visibleNodes = React.useMemo(() => {
    if (isAdminMode) return nodes;
    let filtered = nodes.filter(n => !n.disabled);
    if (activeCategory) {
      filtered = filtered.filter(n => n.type === activeCategory);
    }
    return filtered;
  }, [nodes, isAdminMode, activeCategory]);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="pointer-events-auto m-2 sm:mx-4 sm:mb-4 sm:mt-2 flex flex-col h-[calc(100vh-16px)] sm:h-[calc(100vh-24px)] w-[240px] sm:w-[280px] md:w-[320px]"
    >
      {/* Header */}
      <div className="mb-3 -mt-1 sm:-mt-3">
        <img 
          src="/logo/logo cauce blanco completo.png" 
          alt="CAUCE menú interactivo" 
          className="w-full h-auto max-w-[160px] sm:max-w-[190px] md:max-w-[220px] object-contain"
        />
      </div>

      {/* Station List (compact scrollable) */}
      <div className={`p-2 mb-3 max-h-[220px] overflow-y-auto flex-shrink-0 rounded-2xl ${
        isDarkMode
          ? 'glass-panel'
          : 'sidebar-light'
      }`}>
        <div className="space-y-0.5">
          {visibleNodes.map((node, index) => {
            const cat = CATEGORIES[node.type] || {};
            const isSelected = selectedNodeId === node.id;
            const catColor = cat.color || '#4fc3f7';
            const rgb = hexToRgb(catColor);

            // Selected item background gradient and border styles
            const selectedStyle = isSelected
              ? isDarkMode
                ? {
                    background: `linear-gradient(90deg, rgba(255, 255, 255, 0.12) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18) 35%, rgba(255, 255, 255, 0.02) 100%)`,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderTopColor: 'rgba(255, 255, 255, 0.35)',
                    boxShadow: `0 4px 16px rgba(0, 0, 0, 0.25), 0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                  }
                : {
                    background: `linear-gradient(90deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 65%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 100%)`,
                    border: '1px solid rgba(255, 255, 255, 0.55)',
                    borderTopColor: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }
              : {};

            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => selectNode(node.id)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 group transition-all duration-300
                  ${isDarkMode
                    ? `sidebar-node ${isSelected ? 'active' : ''}`
                    : `sidebar-node-light ${isSelected ? 'active' : ''}`
                  }
                  ${node.disabled ? 'opacity-40' : ''}`}
                style={selectedStyle}
              >
                {/* Category icon */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                     style={{
                       background: isDarkMode
                         ? (isSelected ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)` : 'rgba(255,255,255,0.05)')
                         : (isSelected ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.15)'),
                       border: isDarkMode
                         ? `1px solid ${isSelected ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)` : 'rgba(255,255,255,0.08)'}`
                         : `1px solid ${isSelected ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)'}`
                     }}>
                  <CategoryIcon 
                    type={node.type} 
                    size={14} 
                    color={
                      isDarkMode 
                        ? (isSelected ? catColor : '#fff') 
                        : (isSelected ? getLightModeCategoryColor(node.type) : '#fff')
                    } 
                    isDarkMode={isDarkMode}
                    isSelected={isSelected}
                  />
                </div>

                {/* Node info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-grotesk font-medium truncate leading-tight group-hover:text-white transition-colors duration-300 ${
                    isSelected ? 'font-bold' : ''
                  }`}
                     style={{
                       color: isSelected
                         ? isDarkMode
                           ? catColor
                           : getLightModeCategoryColor(node.type)
                         : isDarkMode ? '#ffffffdf' : '#fffffffa'
                     }}
                  >
                    {node.title}
                  </p>
                  <p className="text-[9px] font-mono uppercase tracking-wider mt-0.5 transition-colors duration-300"
                     style={{
                       color: isSelected
                         ? isDarkMode
                           ? `${catColor}cc`
                           : `${getLightModeCategoryColor(node.type)}d0`
                         : isDarkMode ? `${catColor}b3` : 'rgba(255,255,255,0.65)'
                     }}
                  >
                    {cat.label || node.type}
                    {node.disabled && (
                      <span className="text-red-400 ml-1">· suspendido</span>
                    )}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Station Detail Card (bottom-left, like prototype) */}
      <AnimatePresence mode="wait">
        {selectedNode && <StationDetail node={selectedNode} isDarkMode={isDarkMode} showAdvancedInfo={showAdvancedInfo} />}
      </AnimatePresence>
    </motion.div>
  );
}
