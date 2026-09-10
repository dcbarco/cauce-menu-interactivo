import React, { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from './store/useStore';
import Scene from './components/3d/Scene';
import Sidebar from './components/ui/Sidebar';
import Tooltip from './components/ui/Tooltip';
import AdminPanel from './components/ui/AdminPanel';
import Legend from './components/ui/Legend';
import ThemeToggle from './components/ui/ThemeToggle';
import Screensaver from './components/ui/Screensaver';

function LoadingScreen() {
  const isDarkMode = useStore(s => s.isDarkMode);
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" 
         style={{ background: isDarkMode 
           ? 'radial-gradient(circle at center, #1a2a44 0%, #08111e 50%, #000000 100%)' 
           : 'radial-gradient(ellipse at 30% 20%, #faf7f3 0%, #f5ede4 40%, #efe5d8 100%)'
         }}>
      <div className={`text-center p-8 ${isDarkMode ? 'glass-panel-elevated' : 'tooltip-light'}`}>
        <div className={`w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4 ${
          isDarkMode 
            ? 'border-white/10 border-t-white/60' 
            : 'border-orange-200 border-t-orange-500'
        }`} />
        <p className={`font-grotesk text-sm tracking-widest ${isDarkMode ? 'text-white/50' : 'text-orange-600/60'}`}>
          CARGANDO CIRCUITO
        </p>
        <p className={`font-mono text-[10px] mt-1 ${isDarkMode ? 'text-white/25' : 'text-gray-400'}`}>
          Preparando escena 3D...
        </p>
      </div>
    </div>
  );
}

function CameraSyncer({ controlsRef }) {
  const { camera } = useThree();
  useEffect(() => {
    useStore.getState().setGetCameraSnapshot(() => {
      if (controlsRef.current && camera) {
        return {
          pos: { x: parseFloat(camera.position.x.toFixed(2)), y: parseFloat(camera.position.y.toFixed(2)), z: parseFloat(camera.position.z.toFixed(2)) },
          target: { x: parseFloat(controlsRef.current.target.x.toFixed(2)), y: parseFloat(controlsRef.current.target.y.toFixed(2)), z: parseFloat(controlsRef.current.target.z.toFixed(2)) }
        };
      }
      return useStore.getState().cameraConfig;
    });
  }, [camera, controlsRef]);
  return null;
}

function CameraAnimator({ controlsRef }) {
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const nodes = useStore(s => s.nodes);
  const cameraConfig = useStore(s => s.cameraConfig);
  const cameraResetForceTrigger = useStore(s => s.cameraResetForceTrigger);
  const isNodeEditMode = useStore(s => s.isNodeEditMode);
  const draggedNodeId = useStore(s => s.draggedNodeId);
  const { camera } = useThree();

  const [targetParams, setTargetParams] = React.useState(null);
  const forcedResetRef = useRef(false); // Prevents user events from cancelling inactivity resets
  
  React.useEffect(() => {
    const handleUserInteraction = () => {
      // Don't cancel the animation if it's a forced inactivity reset
      if (forcedResetRef.current) return;
      setTargetParams(null);
    };
    window.addEventListener('pointerdown', handleUserInteraction);
    window.addEventListener('wheel', handleUserInteraction);
    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('wheel', handleUserInteraction);
    };
  }, []);

  // Track previous cameraResetForceTrigger to detect forced resets
  const prevTriggerRef = useRef(cameraResetForceTrigger);

  React.useEffect(() => {
    // Don't animate camera when in node edit mode or dragging
    if (isNodeEditMode || draggedNodeId) return;

    // Detect if this was triggered by a forced inactivity reset
    const isForced = cameraResetForceTrigger !== prevTriggerRef.current;
    prevTriggerRef.current = cameraResetForceTrigger;

    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const nodePos = new THREE.Vector3(node.x, 0, node.z);
        const defaultTarget = new THREE.Vector3(cameraConfig.target.x, cameraConfig.target.y, cameraConfig.target.z);
        const defaultPos = new THREE.Vector3(cameraConfig.pos.x, cameraConfig.pos.y, cameraConfig.pos.z);
        
        // Direction from target to camera (maintains the same viewing angle)
        const dir = new THREE.Vector3().subVectors(defaultPos, defaultTarget).normalize();
        
        const ZOOM_DISTANCE = 28; // reduced zoom (increased distance)
        const newPos = new THREE.Vector3().copy(nodePos).add(dir.multiplyScalar(ZOOM_DISTANCE));
        newPos.y = Math.max(newPos.y, 12); // Ensure it doesn't go below ground level too much

        forcedResetRef.current = false;
        setTargetParams({ target: nodePos, pos: newPos });
      }
    } else {
      // Return to default
      const defaultTarget = new THREE.Vector3(cameraConfig.target.x, cameraConfig.target.y, cameraConfig.target.z);
      const defaultPos = new THREE.Vector3(cameraConfig.pos.x, cameraConfig.pos.y, cameraConfig.pos.z);
      forcedResetRef.current = isForced;
      setTargetParams({ target: defaultTarget, pos: defaultPos });
    }
  }, [selectedNodeId, nodes, cameraConfig, cameraResetForceTrigger, isNodeEditMode, draggedNodeId]);

  useFrame((state, delta) => {
    // Don't animate when in node edit mode
    if (isNodeEditMode) return;

    if (targetParams && controlsRef.current) {
      const step = Math.min(4 * delta, 1);
      controlsRef.current.target.lerp(targetParams.target, step);
      camera.position.lerp(targetParams.pos, step);
      controlsRef.current.update(); // Keep OrbitControls in sync with animated values
      
      if (controlsRef.current.target.distanceTo(targetParams.target) < 0.3 &&
          camera.position.distanceTo(targetParams.pos) < 0.3) {
        // Snap to exact position for precision
        camera.position.copy(targetParams.pos);
        controlsRef.current.target.copy(targetParams.target);
        controlsRef.current.update();
        forcedResetRef.current = false;
        setTargetParams(null);
      }
    }
  });

  return null;
}

// Handles smooth transition to top-down view for node editing
function NodeEditCameraController({ controlsRef }) {
  const isNodeEditMode = useStore(s => s.isNodeEditMode);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const nodes = useStore(s => s.nodes);
  const { camera } = useThree();
  const savedCameraRef = useRef(null);
  const transitionTargetRef = useRef(null);

  // Top-down default camera position height
  const TOP_DOWN_HEIGHT = 45;

  React.useEffect(() => {
    const handleUserInteraction = () => {
      // If user interacts, instantly abort any ongoing transition
      savedCameraRef.current = null;
      transitionTargetRef.current = null;
    };
    window.addEventListener('pointerdown', handleUserInteraction);
    window.addEventListener('wheel', handleUserInteraction);
    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('wheel', handleUserInteraction);
    };
  }, []);

  React.useEffect(() => {
    if (isNodeEditMode) {
      // Save current camera state before switching
      if (controlsRef.current) {
        savedCameraRef.current = {
          pos: camera.position.clone(),
          target: controlsRef.current.target.clone()
        };
      }
      
      // Determine initial top-down focus: if a node is selected, focus on it, otherwise center
      const selectedNode = nodes.find(n => n.id === selectedNodeId);
      const targetX = selectedNode ? selectedNode.x : 0;
      const targetZ = selectedNode ? selectedNode.z : 0;
      
      transitionTargetRef.current = {
        pos: new THREE.Vector3(targetX, TOP_DOWN_HEIGHT, targetZ + 0.1),
        target: new THREE.Vector3(targetX, 0, targetZ)
      };
    } else {
      transitionTargetRef.current = null;
    }
  }, [isNodeEditMode]);

  // Center on node if selected from the list during node edit mode
  React.useEffect(() => {
    if (isNodeEditMode && selectedNodeId) {
      const selectedNode = nodes.find(n => n.id === selectedNodeId);
      if (selectedNode) {
        // Keep current camera height if reasonable, otherwise use default height
        const currentY = camera.position.y > 5 ? camera.position.y : TOP_DOWN_HEIGHT;
        transitionTargetRef.current = {
          pos: new THREE.Vector3(selectedNode.x, currentY, selectedNode.z + 0.1),
          target: new THREE.Vector3(selectedNode.x, 0, selectedNode.z)
        };
      }
    }
  }, [selectedNodeId, isNodeEditMode, nodes]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Ensure mouse mapping is correct dynamically without passing it as a reactive prop to OrbitControls
    if (isNodeEditMode) {
      controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.PAN;
      controlsRef.current.touches.ONE = THREE.TOUCH.PAN;
    } else {
      controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      controlsRef.current.touches.ONE = THREE.TOUCH.ROTATE;
    }

    if (isNodeEditMode) {
      if (transitionTargetRef.current) {
        const step = Math.min(4 * delta, 1);
        camera.position.lerp(transitionTargetRef.current.pos, step);
        controlsRef.current.target.lerp(transitionTargetRef.current.target, step);

        if (camera.position.distanceTo(transitionTargetRef.current.pos) < 0.2 &&
            controlsRef.current.target.distanceTo(transitionTargetRef.current.target) < 0.1) {
          transitionTargetRef.current = null;
        }
      }
    } else if (savedCameraRef.current) {
      // Smoothly return to saved position
      const step = Math.min(3 * delta, 1);
      camera.position.lerp(savedCameraRef.current.pos, step);
      controlsRef.current.target.lerp(savedCameraRef.current.target, step);

      if (camera.position.distanceTo(savedCameraRef.current.pos) < 0.2) {
        savedCameraRef.current = null;
      }
    }
  });

  return null;
}

export default function App() {
  const cameraConfig = useStore(state => state.cameraConfig);
  const isAdminMode = useStore(state => state.isAdminMode);
  const isNodeEditMode = useStore(state => state.isNodeEditMode);
  const draggedNodeId = useStore(state => state.draggedNodeId);
  const draggedAvatar = useStore(state => state.draggedAvatar);
  const isDarkMode = useStore(state => state.isDarkMode);
  
  const controlsRef = useRef();
  
  const isDragging = draggedNodeId !== null || draggedAvatar;
  // In node edit mode: lock rotation, allow only pan and zoom
  const disableOrbitRotation = isNodeEditMode;
  const disableOrbitAll = isDragging;

  const [batteryLevel, setBatteryLevel] = React.useState(null);
  const [isCharging, setIsCharging] = React.useState(true);

  // Wake Lock & Battery Monitor
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLock.addEventListener('release', () => {
            if (document.visibilityState === 'visible') {
              requestWakeLock();
            }
          });
        }
      } catch (err) {
        console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Battery
    let battery = null;
    const updateBatteryInfo = () => {
      if (battery) {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
      }
    };

    if ('getBattery' in navigator) {
      navigator.getBattery().then((b) => {
        battery = b;
        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
      });
    }

    return () => {
      if (wakeLock !== null) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (battery) {
        battery.removeEventListener('levelchange', updateBatteryInfo);
        battery.removeEventListener('chargingchange', updateBatteryInfo);
      }
    };
  }, []);

  // Global Inactivity Timer (3 minutes) and initial fetch
  useEffect(() => {
    useStore.getState().fetchData();

    let timeoutId;
    const INACTIVITY_TIME = 3 * 60 * 1000; // 3 minutos

    const handleActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Reset everything to default state after inactivity
        const store = useStore.getState();
        store.clearSelection();
        if (store.isAdminMode) store.logout();
        if (store.activeCategory) store.setActiveCategory(null);
        store.triggerCameraReset();
      }, INACTIVITY_TIME);
    };

    window.addEventListener('pointermove', handleActivity);
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('wheel', handleActivity);
    
    handleActivity(); // Init

    return () => {
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('wheel', handleActivity);
      clearTimeout(timeoutId);
    };
  }, []);

  const bgStyle = isDarkMode
    ? { background: 'radial-gradient(circle at center, #1a2a44 0%, #08111e 50%, #000000 100%)' }
    : { background: 'radial-gradient(circle at center, #ffffff 0%, #faf6f0 40%, #ebdcc8 100%)' };

  return (
    <div className={`w-full h-screen overflow-hidden relative ${isDarkMode ? '' : 'light-mode'}`} 
         style={bgStyle} 
         id="app-root">
      
      {/* CAPA 3D - Canvas de pantalla completa */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<LoadingScreen />}>
          <Canvas
            camera={{
              position: [cameraConfig.pos.x, cameraConfig.pos.y, cameraConfig.pos.z],
              fov: 32,
              near: 0.1,
              far: 2000
            }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
            onPointerUp={(e) => {
              useStore.getState().setDraggedNode(null);
              useStore.getState().setDraggedAvatar(false);
              if (e && e.target && e.target.style) e.target.style.cursor = 'auto';
            }}
            onPointerMissed={(e) => {
              useStore.getState().setDraggedNode(null);
              useStore.getState().setDraggedAvatar(false);
              if (e && e.target && e.target.style) e.target.style.cursor = 'auto';
            }}
          >
            {/* background handled by CSS gradient in container */}
            <CameraSyncer controlsRef={controlsRef} />
            <CameraAnimator controlsRef={controlsRef} />
            <NodeEditCameraController controlsRef={controlsRef} />
            <OrbitControls
              ref={controlsRef}
              enabled={!disableOrbitAll}
              enablePan={true}
              enableZoom={true}
              enableRotate={!disableOrbitRotation}
              maxPolarAngle={disableOrbitRotation ? 0.01 : Math.PI / 2.2}
              minPolarAngle={disableOrbitRotation ? 0 : 0}
              minDistance={5}
              maxDistance={isNodeEditMode ? 1000 : 50}
              dampingFactor={0.05}
              enableDamping={true}
            />
            <Scene />
          </Canvas>
        </Suspense>
      </div>

      {/* CAPA UI (HTML/CSS sobre el Canvas) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex">
        
        {/* Columna izquierda: Sidebar */}
        {!isNodeEditMode && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Espacio central flexible */}
        <div className="flex-1" />

        {/* Right column: removed, now shows inside 3D scene directly */}
        <div className="flex-shrink-0 flex flex-col justify-center p-4 mr-2">
        </div>
      </div>

      {/* Top-right area: Theme Toggle + Instruction hint */}
      <div className="absolute top-4 right-4 z-[100] pointer-events-auto flex items-center gap-3">
        {/* Instruction hint */}
        <div className={`px-3 py-1.5 flex items-center gap-2 text-[11px] font-mono pointer-events-none hidden md:flex ${
          isDarkMode 
            ? 'glass-panel text-white/30' 
            : 'tooltip-light text-gray-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${
            isDarkMode ? 'bg-white/20' : 'bg-orange-400'
          }`}></span>
          Clic y arrastra para rotar | Doble clic para centrar
        </div>
        <ThemeToggle />
      </div>

      {/* Footer: Category Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-full flex justify-center px-4">
        <Legend />
      </div>

      {/* Admin Panel (capa superior) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AdminPanel />
      </div>

      {/* Admin mode indicator bar */}
      {isAdminMode && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent z-30" />
      )}

      {/* Battery Low Warning Overlay */}
      {batteryLevel !== null && batteryLevel <= 10 && !isCharging && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10000] bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-pulse flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Batería baja ({batteryLevel}%) - Conecte el cargador
        </div>
      )}

      {/* Screensaver (kiosco - capa máxima, 5 min inactividad) */}
      <Screensaver
        onWake={() => {
          // Al despertar del screensaver, asegurarse de que la UI esté limpia
          useStore.getState().clearSelection();
          useStore.getState().triggerCameraReset();
        }}
      />
    </div>
  );
}