import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CATEGORIES } from '../../config/constants';

const ADMIN_PASSWORD = 'admin';

/* ====== Password Gate ====== */
function PasswordGate({ onSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`glass-panel-elevated p-6 w-full max-w-[320px] mx-4 ${shake ? 'animate-shake' : ''}`}
        style={{ borderColor: error ? 'rgba(239, 68, 68, 0.2)' : undefined }}
      >
        <div className="flex items-center gap-2 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f97316">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          <h2 className="font-grotesk font-bold text-white text-lg">Acceso Admin</h2>
        </div>
        <p className="text-xs text-white/40 mb-4 font-mono">
          Ingrese la clave para acceder al modo edición.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña..."
            autoFocus
            className="w-full glass-input px-3 py-2.5 text-sm font-mono mb-3"
          />
          {error && (
            <p className="text-xs text-red-400 font-mono mb-2">✗ Clave incorrecta</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 glass-btn text-orange-400 text-xs font-mono py-2.5 hover:text-orange-300"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="glass-btn text-white/40 text-xs font-mono py-2.5 px-4 hover:text-white/70"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ====== Node Editor Modal (Ficha Técnica + Ficha Contenido) ====== */
function NodeEditor({ node, onClose }) {
  const updateNode = useStore(s => s.updateNode);
  const deleteNode = useStore(s => s.deleteNode);

  const equipmentStr = typeof node.equipment === 'string'
    ? node.equipment
    : Array.isArray(node.equipment) ? node.equipment.join('\n') : '';

  const [form, setForm] = useState({
    title: node.title,
    tooltipTitle: node.tooltipTitle,
    type: node.type,
    concept: node.concept,
    dato: node.dato,
    origen: node.origen,
    equipment: equipmentStr,
    disabled: node.disabled,
  });

  const handleSave = () => {
    updateNode(node.id, {
      ...form,
      equipment: form.equipment, // Kept as string with newlines
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${node.tooltipTitle}" permanentemente?`)) {
      deleteNode(node.id);
      onClose();
    }
  };

  const inputClass = "w-full glass-input px-3 py-2 text-sm font-grotesk";
  const labelClass = "text-[10px] font-mono text-white/35 uppercase tracking-widest mb-1 block";
  const sectionTitleClass = "text-xs font-mono font-bold uppercase tracking-widest mb-3";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="glass-panel-elevated p-5 w-full max-w-[420px] mx-4 max-h-[85vh] overflow-y-auto"
        style={{ borderColor: 'rgba(249, 115, 22, 0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="font-grotesk font-bold text-orange-400 text-sm">
            Editar Estación #{String(node.id).padStart(2, '0')}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg transition-colors">×</button>
        </div>

        {/* ---- FICHA TÉCNICA (IZQUIERDA) ---- */}
        <div className="mb-5">
          <p className={sectionTitleClass} style={{ color: '#4fc3f7' }}>
            Ficha Técnica (Izquierda)
          </p>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Título Principal:</label>
              <input className={inputClass} value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Concepto:</label>
              <textarea className={`${inputClass} h-20 resize-vertical`} value={form.concept}
                onChange={e => setForm({ ...form, concept: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Equipamiento (Saltos de línea):</label>
              <textarea className={`${inputClass} h-24 resize-vertical`} value={form.equipment}
                onChange={e => setForm({ ...form, equipment: e.target.value })}
                placeholder="1 x Tablet&#10;1 x Pedestal" />
            </div>
          </div>
        </div>

        {/* ---- FICHA CONTENIDO (TOOLTIP) ---- */}
        <div className="mb-5">
          <p className={sectionTitleClass} style={{ color: '#4fc3f7' }}>
            Ficha Contenido (Tooltip)
          </p>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Título Tooltip:</label>
              <input className={inputClass} value={form.tooltipTitle}
                onChange={e => setForm({ ...form, tooltipTitle: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Dato:</label>
              <textarea className={`${inputClass} h-20 resize-vertical`} value={form.dato}
                onChange={e => setForm({ ...form, dato: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Origen:</label>
              <input className={inputClass} value={form.origen}
                onChange={e => setForm({ ...form, origen: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ---- Category & Status ---- */}
        <div className="mb-4 space-y-3">
          <div>
            <label className={labelClass}>Categoría (Icono):</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key} style={{ background: '#0a1628' }}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`disabled-${node.id}`}
              checked={form.disabled}
              onChange={e => setForm({ ...form, disabled: e.target.checked })}
              className="rounded border-gray-600"
            />
            <label htmlFor={`disabled-${node.id}`} className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <span className="text-red-400">⊘</span> Suspender Estación (Ocultar)
            </label>
          </div>
        </div>

        {/* ---- Action Buttons ---- */}
        <div className="flex gap-2 pt-3 border-t border-white/5">
          <button onClick={handleSave}
            className="flex-1 bg-cauce-accent-blue/20 hover:bg-cauce-accent-blue/30 border border-cauce-accent-blue/30 text-cauce-accent-blue text-xs font-mono py-2.5 rounded-lg transition-colors">
            ✓ Guardar Cambios
          </button>
          <button onClick={handleDelete}
            className="bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 text-xs font-mono py-2.5 px-4 rounded-lg transition-colors">
            Eliminar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ====== Main Admin Panel ====== */
export default function AdminPanel() {
  const isAdminMode = useStore(s => s.isAdminMode);
  const isAdminAuthenticated = useStore(s => s.isAdminAuthenticated);
  const setAdminMode = useStore(s => s.setAdminMode);
  const setAdminAuthenticated = useStore(s => s.setAdminAuthenticated);
  const logout = useStore(s => s.logout);
  const nodes = useStore(s => s.nodes);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectNode = useStore(s => s.selectNode);
  const addNode = useStore(s => s.addNode);
  const exportData = useStore(s => s.exportData);
  const globalScale = useStore(s => s.globalScale);
  const setGlobalScale = useStore(s => s.setGlobalScale);
  const show3DModel = useStore(s => s.show3DModel);
  const toggle3DModel = useStore(s => s.toggle3DModel);
  const isNodeEditMode = useStore(s => s.isNodeEditMode);
  const setNodeEditMode = useStore(s => s.setNodeEditMode);
  const draggedNodeId = useStore(s => s.draggedNodeId);

  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const editingNode = nodes.find(n => n.id === editingId);
  const draggedNode = nodes.find(n => n.id === draggedNodeId);

  const handleAdminClick = () => {
    if (isAdminMode) {
      logout();
    } else {
      setShowPasswordGate(true);
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordGate(false);
    setAdminAuthenticated(true);
    setAdminMode(true);
  };

  const handleExport = () => {
    const data = exportData();
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveToServer = async () => {
    try {
      const state = useStore.getState();
      const payload = {
        nodes: state.nodes,
        cameraConfig: state.getCameraSnapshot ? state.getCameraSnapshot() : state.cameraConfig,
        userLocation: state.userLocation
      };
      
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Error al guardar en el servidor');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar');
    }
  };

  const handleAddNode = () => {
    addNode({
      type: 'PORTATIL',
      x: Math.random() * 8 - 4,
      z: Math.random() * 8 - 4,
      disabled: false,
      title: 'Nueva Estación',
      tooltipTitle: 'Nuevo Título',
      concept: 'Descripción...',
      equipment: '',
      dato: '',
      origen: '',
    });
  };

  return (
    <div className="pointer-events-auto">
      {/* Admin toggle button (top-right) */}
      <button
        onClick={handleAdminClick}
        className={`fixed top-4 right-4 z-50 glass-panel px-3 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-all
          ${isAdminMode ? 'border-orange-500/30 text-orange-400 admin-pulse' : 'text-white/30 hover:text-white/60'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
        {isAdminMode ? 'Admin ON' : 'Admin'}
      </button>

      {/* Password Gate */}
      <AnimatePresence>
        {showPasswordGate && (
          <PasswordGate
            onSuccess={handlePasswordSuccess}
            onCancel={() => setShowPasswordGate(false)}
          />
        )}
      </AnimatePresence>

      {/* Node Editor Modal */}
      <AnimatePresence>
        {editingNode && (
          <NodeEditor node={editingNode} onClose={() => setEditingId(null)} />
        )}
      </AnimatePresence>

      {/* Dragging Tooltip (Bottom Left) */}
      <AnimatePresence>
        {isNodeEditMode && draggedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 glass-panel p-3 min-w-[200px] border-l-4 pointer-events-none"
            style={{ borderLeftColor: CATEGORIES[draggedNode.type]?.color || '#4fc3f7' }}
          >
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
              Ubicando Estación
            </p>
            <h3 className="font-grotesk font-bold text-white text-sm leading-tight">
              {draggedNode.tooltipTitle}
            </h3>
            {draggedNode.title && draggedNode.title !== draggedNode.tooltipTitle && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                {draggedNode.title}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Side Panel (Modo Edición) */}
      <AnimatePresence>
        {isAdminMode && isAdminAuthenticated && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 right-2 sm:right-4 z-40 glass-panel-elevated p-4 w-[280px] sm:w-80 max-h-[calc(100vh-100px)] overflow-y-auto"
            style={{ borderColor: 'rgba(249, 115, 22, 0.15)' }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-grotesk font-bold text-white text-base">
                Modo Edición
              </h2>
              <button
                onClick={logout}
                className="text-xs font-mono text-orange-400 hover:text-orange-300 transition-colors"
              >
                Cerrar
              </button>
            </div>

            {/* Drag instruction */}
            <p className="text-[10px] font-mono text-gray-500 mb-3">
              Arrastra los iconos o la persona en el 3D para reubicarlos.
            </p>

            {/* Node Edit Mode Toggle */}
            <button
              onClick={() => setNodeEditMode(!isNodeEditMode)}
              className={`w-full mb-3 py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                isNodeEditMode
                  ? 'bg-orange-500/25 border-orange-500/50 text-orange-300 shadow-lg shadow-orange-500/10'
                  : 'bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
              </svg>
              {isNodeEditMode ? '✓ Modo Posición (Vista Top)' : 'Editar Posiciones'}
            </button>

            {isNodeEditMode && (
              <div className="mb-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-[10px] font-mono text-orange-300 leading-relaxed">
                  📐 Vista cenital activa. Arrastra los nodos para reubicarlos en el plano. 
                  Haz scroll para acercar/alejar. Presiona de nuevo para volver a la vista 3D.
                </p>
              </div>
            )}

            {/* Display Options */}
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                 onClick={toggle3DModel}>
              <input
                type="checkbox"
                id="toggle-3d"
                checked={show3DModel}
                onChange={toggle3DModel}
                className="rounded border-gray-600 cursor-pointer pointer-events-none"
              />
              <label htmlFor="toggle-3d" className="text-xs text-gray-300 font-mono flex items-center gap-1 cursor-pointer pointer-events-none">
                Mostrar Plano Base (Grilla)
              </label>
            </div>

            {/* Fullscreen Option */}
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                 onClick={toggleFullscreen}>
              <div className="flex-1 flex items-center justify-between pointer-events-none">
                <label className="text-xs text-gray-300 font-mono flex items-center gap-1 cursor-pointer">
                  {isFullscreen ? '🖥️ Salir de Pantalla Completa' : '🖥️ Pantalla Completa'}
                </label>
              </div>
            </div>

            {/* Save Actions */}
            <div className="flex gap-2 mb-3">
              <button onClick={handleExport}
                title="Copiar JSON al portapapeles"
                className={`flex-1 text-[10px] font-mono py-2 rounded-lg transition-all
                  ${copied
                    ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                    : 'bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400'}`}>
                {copied ? '✓ Copiado' : '📷 Snapshot'}
              </button>
              <button onClick={handleSaveToServer}
                title="Guardar en data.js"
                className={`flex-1 text-[10px] font-mono py-2 rounded-lg transition-all
                  ${saved
                    ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                    : 'bg-cauce-accent-blue/20 hover:bg-cauce-accent-blue/30 border border-cauce-accent-blue/30 text-cauce-accent-blue'}`}>
                {saved ? '✓ Guardado' : '💾 Grabar'}
              </button>
            </div>

            {/* Scale Slider */}
            <div className="mb-4">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 block">
                Tamaño global de iconos:
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={globalScale}
                onChange={e => setGlobalScale(parseFloat(e.target.value))}
                className="w-full accent-cauce-accent-blue h-1"
              />
            </div>

            {/* Add / Delete buttons */}
            <div className="flex gap-2 mb-4">
              <button onClick={handleAddNode}
                className="flex-1 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-mono py-2 rounded-lg transition-colors">
                + Agregar
              </button>
              <button
                onClick={() => {
                  if (selectedNodeId) {
                    const node = nodes.find(n => n.id === selectedNodeId);
                    if (node) {
                      useStore.getState().updateNode(selectedNodeId, { disabled: !node.disabled });
                    }
                  }
                }}
                disabled={!selectedNodeId}
                className={`flex-1 border text-xs font-mono py-2 rounded-lg transition-colors flex items-center justify-center gap-1
                  ${selectedNodeId 
                    ? (nodes.find(n => n.id === selectedNodeId)?.disabled 
                        ? 'bg-blue-900/20 hover:bg-blue-900/30 border-blue-500/30 text-blue-400'
                        : 'bg-orange-900/20 hover:bg-orange-900/30 border-orange-500/30 text-orange-400')
                    : 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed'}`}
              >
                {selectedNodeId && nodes.find(n => n.id === selectedNodeId)?.disabled ? '👁 Activar' : '⊘ Suspender'}
              </button>
              <button
                onClick={() => {
                  if (selectedNodeId) {
                    const node = nodes.find(n => n.id === selectedNodeId);
                    if (node && confirm(`¿Eliminar "${node.tooltipTitle}"?`)) {
                      useStore.getState().deleteNode(selectedNodeId);
                    }
                  }
                }}
                disabled={!selectedNodeId}
                className={`bg-white/5 border border-white/10 text-xs font-mono py-2 px-3 rounded-lg transition-colors flex items-center gap-1
                  ${selectedNodeId ? 'hover:bg-red-900/30 hover:border-red-500/30 hover:text-red-400 text-gray-400' : 'text-gray-600 cursor-not-allowed'}`}
                title="Eliminar permanentemente"
              >
                🗑
              </button>
            </div>

            {/* Station List */}
            <div className="border-t border-white/5 pt-3">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
                Estaciones ({nodes.length})
              </p>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {nodes.map(node => {
                  const cat = CATEGORIES[node.type] || {};
                  return (
                    <div
                      key={node.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors
                        ${selectedNodeId === node.id ? 'bg-white/8 border border-white/10' : ''}`}
                      onClick={() => selectNode(node.id)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || '#4fc3f7', opacity: node.disabled ? 0.3 : 1 }} />
                      <span className={`text-xs flex-1 truncate ${node.disabled ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                        {node.tooltipTitle}
                      </span>
                      <span className="text-[9px] font-mono text-gray-600">
                        {cat.label || node.type}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(node.id); }}
                        className="text-gray-600 hover:text-cauce-accent-blue text-[10px] font-mono transition-colors"
                      >
                        editar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
