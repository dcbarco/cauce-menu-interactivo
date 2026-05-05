import { create } from 'zustand';
import { initialNodes, defaultCameraConfig, defaultUserLocation } from '../config/data';

export const useStore = create((set, get) => ({
    // State
    isAdminMode: false,
    isAdminAuthenticated: false,
    isNodeEditMode: false, // Top-down node repositioning mode
    selectedNodeId: null,
    draggedNodeId: null,
    globalScale: 1.2,
    nodes: initialNodes,
    cameraConfig: defaultCameraConfig,
    userLocation: defaultUserLocation,
    activeCategory: null, // For bottom category filter
    show3DModel: true,

    // Actions
    fetchData: async () => {
        try {
            const res = await fetch('/api/load');
            if (res.ok) {
                const data = await res.json();
                if (data.nodes) {
                    set({ 
                        nodes: data.nodes, 
                        cameraConfig: data.cameraConfig || defaultCameraConfig, 
                        userLocation: data.userLocation || defaultUserLocation 
                    });
                }
            }
        } catch (e) {
            console.error("Error fetching data from KV:", e);
        }
    },
    setAdminMode: (val) => set({ isAdminMode: val }),
    setAdminAuthenticated: (val) => set({ isAdminAuthenticated: val }),
    toggle3DModel: () => set((state) => ({ show3DModel: !state.show3DModel })),
    setNodeEditMode: (val) => set({ isNodeEditMode: val, selectedNodeId: null, draggedNodeId: null }),
    toggleAdmin: () => {
        const state = get();
        if (state.isAdminMode) {
            // Turning off admin mode
            set({ isAdminMode: false });
        } else {
            // Need authentication first
            set({ isAdminMode: true });
        }
    },
    logout: () => set({ isAdminMode: false, isAdminAuthenticated: false, isNodeEditMode: false }),
    selectNode: (id) => set({ selectedNodeId: id }),
    clearSelection: () => set({ selectedNodeId: null }),
    setDraggedNode: (id) => set({ draggedNodeId: id }),
    draggedAvatar: false,
    setDraggedAvatar: (val) => set({ draggedAvatar: val }),
    updateUserLocation: (loc) => set({ userLocation: loc }),
    
    cameraResetForceTrigger: 0,
    triggerCameraReset: () => set(state => ({ cameraResetForceTrigger: state.cameraResetForceTrigger + 1 })),
    
    setActiveCategory: (cat) => set((state) => ({
        activeCategory: state.activeCategory === cat ? null : cat
    })),

    updateNode: (id, newData) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, ...newData } : n)
    })),

    addNode: (node) => set((state) => ({
        nodes: [...state.nodes, {
            ...node,
            id: Math.max(0, ...state.nodes.map(n => n.id)) + 1
        }]
    })),

    deleteNode: (id) => set((state) => ({
        nodes: state.nodes.filter(n => n.id !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
    })),

    setCameraConfig: (config) => set({ cameraConfig: config }),
    setGlobalScale: (scale) => set({ globalScale: scale }),
    setUserLocation: (loc) => set({ userLocation: loc }),
    getCameraSnapshot: null,
    setGetCameraSnapshot: (fn) => set({ getCameraSnapshot: fn }),

    // Computed helpers
    getNodeById: (id) => get().nodes.find(n => n.id === id),
    getVisibleNodes: () => {
        const state = get();
        if (state.isAdminMode) return state.nodes;
        let filtered = state.nodes.filter(n => !n.disabled);
        if (state.activeCategory) {
            filtered = filtered.filter(n => n.type === state.activeCategory);
        }
        return filtered;
    },

    exportData: () => {
        const state = get();
        const latestCamera = state.getCameraSnapshot ? state.getCameraSnapshot() : state.cameraConfig;
        return JSON.stringify({
            nodes: state.nodes,
            cameraConfig: latestCamera,
            userLocation: state.userLocation,
            globalScale: state.globalScale
        }, null, 2);
    }
}));