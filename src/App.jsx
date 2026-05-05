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

function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'radial-gradient(circle at center, #1a2a44 0%, #08111e 50%, #000000 100%)' }}>
      <div className="text-center glass-panel-elevated p-8">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-grotesk text-sm text-white/50 tracking-widest">
          CARGANDO CIRCUITO
        </p>
        <p className="font-mono text-[10px] text-white/25 mt-1">
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
  
  React.useEffect(() => {
    // Don't animate camera when in node edit mode or dragging
    if (isNodeEditMode || draggedNodeId) return;

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

        setTargetParams({ target: nodePos, pos: newPos });
      }
    } else {
      // Return to default
      const defaultTarget = new THREE.Vector3(cameraConfig.target.x, cameraConfig.target.y, cameraConfig.target.z);
      const defaultPos = new THREE.Vector3(cameraConfig.pos.x, cameraConfig.pos.y, cameraConfig.pos.z);
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
      
      if (controlsRef.current.target.distanceTo(targetParams.target) < 0.1 &&
          camera.position.distanceTo(targetParams.pos) < 0.1) {
        setTargetParams(null);
      }
    }
  });

  return null;
}

// Handles smooth transition to top-down view for node editing
function NodeEditCameraController({ controlsRef }) {
  const isNodeEditMode = useStore(s => s.isNodeEditMode);
  const cameraConfig = useStore(s => s.cameraConfig);
  const { camera } = useThree();
  const savedCameraRef = useRef(null);

  // Top-down camera position
  const TOP_DOWN_POS = React.useMemo(() => new THREE.Vector3(0, 35, 0.1), []);
  const TOP_DOWN_TARGET = React.useMemo(() => new THREE.Vector3(0, 0, 0), []);

  React.useEffect(() => {
    if (isNodeEditMode) {
      // Save current camera state before switching
      if (controlsRef.current) {
        savedCameraRef.current = {
          pos: camera.position.clone(),
          target: controlsRef.current.target.clone()
        };
      }
    }
  }, [isNodeEditMode]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    if (isNodeEditMode) {
      // Smoothly animate to top-down
      const step = Math.min(3 * delta, 1);
      camera.position.lerp(TOP_DOWN_POS, step);
      controlsRef.current.target.lerp(TOP_DOWN_TARGET, step);
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
  
  const controlsRef = useRef();
  
  const isDragging = draggedNodeId !== null || draggedAvatar;
  // In node edit mode: lock rotation, allow only pan and zoom
  const disableOrbitRotation = isNodeEditMode;
  const disableOrbitAll = isDragging;

  // Global Inactivity Timer (3 minutes) and initial fetch
  useEffect(() => {
    useStore.getState().fetchData();

    let timeoutId;
    const INACTIVITY_TIME = 3 * 60 * 1000; // 3 minutos

    const handleActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Reset view after 3 minutes of inactivity
        useStore.getState().clearSelection();
        useStore.getState().triggerCameraReset();
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

  return (
    <div className="w-full h-screen overflow-hidden relative" style={{ background: 'radial-gradient(circle at center, #1a2a44 0%, #08111e 50%, #000000 100%)' }} id="app-root">
      
      {/* CAPA 3D - Canvas de pantalla completa */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<LoadingScreen />}>
          <Canvas
            camera={{
              position: [cameraConfig.pos.x, cameraConfig.pos.y, cameraConfig.pos.z],
              fov: 32,
              near: 0.1,
              far: 200
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
              target={[cameraConfig.target.x, cameraConfig.target.y, cameraConfig.target.z]}
              enablePan={true}
              enableZoom={true}
              enableRotate={!disableOrbitRotation}
              maxPolarAngle={disableOrbitRotation ? 0.01 : Math.PI / 2.2}
              minPolarAngle={disableOrbitRotation ? 0 : 0}
              minDistance={5}
              maxDistance={isNodeEditMode ? 120 : 50}
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

      {/* Top-right instruction hint */}
      <div className="absolute top-4 right-48 z-10 pointer-events-none hidden md:block">
        <div className="glass-panel px-3 py-1.5 flex items-center gap-2 text-[11px] font-mono text-white/30">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block"></span>
          Clic y arrastra para rotar | Doble clic para centrar
        </div>
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
    </div>
  );
}