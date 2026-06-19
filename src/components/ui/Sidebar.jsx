import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CATEGORIES, ICON_PATHS } from '../../config/constants';

function CategoryIcon({ type, size = 18, color = '#fff', isDarkMode = true }) {
  const cat = CATEGORIES[type];
  const iconKey = cat ? cat.icon : 'portatil';
  const path = ICON_PATHS[iconKey] || ICON_PATHS.portatil;

  // In light mode, try to use PNG icon image
  if (!isDarkMode && cat?.iconImage) {
    return (
      <img
        src={cat.iconImage}
        alt={cat.label}
        style={{ width: size, height: size, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={0.85}>
      <path d={path} />
    </svg>
  );
}

function StationDetail({ node, isDarkMode }) {
  if (!node) return null;
  const cat = CATEGORIES[node.type] || {};

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`pointer-events-auto mt-auto p-3 ${isDarkMode ? 'glass-panel' : 'bg-white/30 rounded-2xl border border-white/30'}`}
    >
      <div className="mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ 
               background: isDarkMode ? `${cat.color || '#4fc3f7'}15` : `rgba(255,255,255,0.3)`,
               border: `1px solid ${isDarkMode ? `${cat.color || '#4fc3f7'}30` : 'rgba(255,255,255,0.4)'}`
             }}>
          <CategoryIcon type={node.type} size={16} color={isDarkMode ? (cat.color || '#4fc3f7') : '#fff'} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Dato */}
      {node.dato && (
        <div className="mb-2.5">
          <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5"
             style={{ color: isDarkMode ? (cat.color || '#4fc3f7') : 'rgba(255,255,255,0.7)' }}>
            Dato
          </p>
          <p className={`text-[11px] font-mono leading-snug ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
            {node.dato}
          </p>
        </div>
      )}

      {/* Origen */}
      {node.origen && (
        <div>
          <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5"
             style={{ color: isDarkMode ? (cat.color || '#4fc3f7') : 'rgba(255,255,255,0.7)' }}>
            Origen
          </p>
          <p className={`text-[11px] font-mono leading-snug ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
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
      className="pointer-events-auto m-2 sm:m-4 flex flex-col h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)] w-[240px] sm:w-[280px] md:w-[320px]"
    >
      {/* Header */}
      <div className="mb-4">
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

            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => selectNode(node.id)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 group
                  ${isDarkMode
                    ? `sidebar-node ${isSelected ? 'active' : ''}`
                    : `sidebar-node-light ${isSelected ? 'active' : ''}`
                  }
                  ${node.disabled ? 'opacity-40' : ''}`}
              >
                {/* Category icon */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{
                       background: isDarkMode
                         ? (isSelected ? `${cat.color || '#4fc3f7'}20` : 'rgba(255,255,255,0.05)')
                         : (isSelected ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)'),
                       border: isDarkMode
                         ? `1px solid ${isSelected ? `${cat.color || '#4fc3f7'}40` : 'rgba(255,255,255,0.08)'}`
                         : `1px solid ${isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`
                     }}>
                  <CategoryIcon 
                    type={node.type} 
                    size={14} 
                    color={isDarkMode ? (isSelected ? '#fff' : (cat.color || '#4fc3f7')) : '#fff'} 
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Node info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-grotesk font-medium truncate leading-tight group-hover:text-white ${
                    isDarkMode ? 'text-white/85' : 'text-white/90'
                  }`}>
                    {node.title}
                  </p>
                  <p className="text-[9px] font-mono uppercase tracking-wider mt-0.5"
                     style={{ color: isDarkMode ? (cat.color || '#4fc3f7') : 'rgba(255,255,255,0.6)' }}>
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
        {selectedNode && <StationDetail node={selectedNode} isDarkMode={isDarkMode} />}
      </AnimatePresence>
    </motion.div>
  );
}
