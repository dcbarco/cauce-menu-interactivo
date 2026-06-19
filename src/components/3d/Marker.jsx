import React, { useRef, useState, useCallback } from 'react';
import { Billboard, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { CATEGORIES, SCENE, ICON_PATHS } from '../../config/constants';
import Tooltip from '../ui/Tooltip';

/* ===== Dark Mode Marker: circular with glow ring ===== */
function MarkerIconDark({ type, scale = 1, isSelected, isGhost }) {
  const cat = CATEGORIES[type] || CATEGORIES.PORTATIL;
  const color = isGhost ? '#666' : (isSelected ? '#ffffff' : cat.color);
  const bgOpacity = isGhost ? 0.15 : (isSelected ? 0.95 : 0.6);
  const ringColor = isSelected ? '#ffffff' : (isGhost ? '#666' : cat.color);

  return (
    <group scale={[scale, scale, scale]}>
      {/* Outer glow ring */}
      <mesh>
        <ringGeometry args={[0.58, 0.68, 32]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={isSelected ? 0.5 : 0.2}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Background circle */}
      <mesh>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial
          color={'#1a2332'}
          transparent
          opacity={bgOpacity}
        />
      </mesh>
      {/* Border ring */}
      <mesh>
        <ringGeometry args={[0.5, 0.55, 32]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={isGhost ? 0.15 : 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ===== Light Mode Marker: rounded square with speech bubble pointer ===== */
function MarkerIconLight({ type, scale = 1, isSelected, isGhost }) {
  const cat = CATEGORIES[type] || CATEGORIES.PORTATIL;
  const markerColor = isGhost ? '#999' : (cat.color || '#e86c1a');
  const bgOpacity = isGhost ? 0.3 : (isSelected ? 1.0 : 0.85);

  return (
    <group scale={[scale, scale, scale]}>
      {/* Rounded square background */}
      <mesh>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={bgOpacity}
        />
      </mesh>
      {/* Selection border glow */}
      {isSelected && (
        <mesh>
          <planeGeometry args={[1.25, 1.25]} />
          <meshBasicMaterial
            color={'#ffffff'}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
      {/* Bottom triangle pointer (speech bubble tail) */}
      <mesh position={[0, -0.7, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([
              -0.15, 0.15, 0,
              0.15, 0.15, 0,
              0, -0.15, 0
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={bgOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function MarkerTooltip({ node }) {
  const cat = CATEGORIES[node.type] || CATEGORIES.PORTATIL;
  const isDarkMode = useStore.getState().isDarkMode;
  
  return (
    <div className={`tooltip-3d px-4 py-2.5 min-w-[140px] text-center cursor-pointer select-none ${
      isDarkMode ? 'glass-panel' : 'tooltip-light'
    }`}
         style={{ borderRadius: '14px' }}>
      <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5"
         style={{ color: isDarkMode ? cat.color : '#e86c1a' }}>
        {cat.label}
      </p>
      <p className={`text-sm font-grotesk font-semibold leading-tight ${
        isDarkMode ? 'text-white/90' : 'text-gray-800'
      }`}>
        {node.tooltipTitle}
      </p>
    </div>
  );
}

export default function Marker({ node }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const didDragRef = useRef(false); // Track if a real drag happened

  const isAdminMode = useStore(s => s.isAdminMode);
  const isNodeEditMode = useStore(s => s.isNodeEditMode);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const draggedNodeId = useStore(s => s.draggedNodeId);
  const globalScale = useStore(s => s.globalScale);
  const selectNode = useStore(s => s.selectNode);
  const updateNode = useStore(s => s.updateNode);
  const setDraggedNode = useStore(s => s.setDraggedNode);
  const isDarkMode = useStore(s => s.isDarkMode);

  const { camera, raycaster, pointer, gl } = useThree();

  const isSelected = selectedNodeId === node.id;
  const isGhost = node.disabled;
  const isDragging = draggedNodeId === node.id;

  // Don't render disabled nodes in user mode
  if (isGhost && !isAdminMode) return null;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    // In node edit mode, clicks are only for dragging, not selection
    if (isNodeEditMode) return;
    // Don't select if we just finished a drag
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (!isDragging) {
      selectNode(node.id);
    }
  }, [node.id, isDragging, selectNode, isNodeEditMode]);

  const handlePointerDown = useCallback((e) => {
    if (isNodeEditMode) {
      // In node edit mode: start dragging immediately, no selection, no camera zoom
      e.stopPropagation();
      didDragRef.current = false;
      setDraggedNode(node.id);
      gl.domElement.style.cursor = 'grabbing';
    } else if (isAdminMode) {
      // In regular admin mode: start drag + select
      e.stopPropagation();
      didDragRef.current = false;
      selectNode(node.id);
      setDraggedNode(node.id);
      gl.domElement.style.cursor = 'grabbing';
    }
  }, [isAdminMode, isNodeEditMode, node.id, setDraggedNode, selectNode, gl]);

  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalUp = () => {
        if (groupRef.current) {
          updateNode(node.id, { x: groupRef.current.position.x, z: groupRef.current.position.z });
          didDragRef.current = true;
        }
        setDraggedNode(null);
        gl.domElement.style.cursor = 'auto';
      };
      window.addEventListener('pointerup', handleGlobalUp);
      return () => window.removeEventListener('pointerup', handleGlobalUp);
    }
  }, [isDragging, node.id, updateNode, setDraggedNode, gl]);

  // Animate hover and pulse
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    // Handle dragging
    if (isDragging && (isAdminMode || isNodeEditMode)) {
      raycaster.setFromCamera(pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        const SNAP_SIZE = 0.5;
        const BOUND_X = 25;
        const BOUND_Z = 20;
        
        let snapX = Math.round(intersection.x / SNAP_SIZE) * SNAP_SIZE;
        let snapZ = Math.round(intersection.z / SNAP_SIZE) * SNAP_SIZE;
        
        snapX = THREE.MathUtils.clamp(snapX, -BOUND_X, BOUND_X);
        snapZ = THREE.MathUtils.clamp(snapZ, -BOUND_Z, BOUND_Z);

        groupRef.current.position.set(snapX, 0, snapZ);
      }
    }

    // Subtle bobbing animation (disabled in node edit mode for clarity)
    const t = state.clock.elapsedTime;
    const bob = isNodeEditMode ? 0 : Math.sin(t * 1.5 + node.id * 0.7) * 0.08;
    meshRef.current.position.y = SCENE.MARKER_Y_OFFSET + bob;

    // Scale animation on hover
    const targetScale = hovered ? globalScale * 1.15 : globalScale;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    meshRef.current.scale.setScalar(newScale);
  });

  // In node edit mode, show a simpler label under each marker
  const showMiniLabel = isNodeEditMode;
  // Tooltips: never show during node edit mode or while dragging
  const showHoverTooltip = !isNodeEditMode && !isDragging && hovered && !isSelected;
  const showFullTooltip = !isNodeEditMode && !isDragging && isSelected;

  const cat = CATEGORIES[node.type] || {};
  const catColor = cat.color || '#4fc3f7';
  const verticalLineColor = isDarkMode ? catColor : catColor;

  return (
    <group ref={groupRef} position={[node.x, 0, node.z]}>
      {/* Vertical line from ground to marker */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0.1, 0, 0, SCENE.MARKER_Y_OFFSET - 0.3, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={verticalLineColor}
          transparent
          opacity={isGhost ? 0.1 : (isDarkMode ? 0.2 : 0.35)}
        />
      </line>

      {/* Ground pulse */}
      {!isGhost && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial
            color={catColor}
            transparent
            opacity={isDarkMode ? 0.12 : 0.15}
            blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Billboard marker */}
      <Billboard
        ref={meshRef}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        position={[0, SCENE.MARKER_Y_OFFSET, 0]}
      >
        <group
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            if (isNodeEditMode) {
              gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
            } else if (isAdminMode) {
              gl.domElement.style.cursor = useStore.getState().draggedNodeId === node.id ? 'grabbing' : 'grab';
            } else {
              gl.domElement.style.cursor = 'pointer';
            }
          }}
          onPointerOut={() => {
            setHovered(false);
            if (!useStore.getState().draggedNodeId && !useStore.getState().draggedAvatar) {
              gl.domElement.style.cursor = 'auto';
            }
          }}
        >
          {isDarkMode ? (
            <MarkerIconDark
              type={node.type}
              scale={globalScale}
              isSelected={isSelected}
              isGhost={isGhost}
            />
          ) : (
            <MarkerIconLight
              type={node.type}
              scale={globalScale}
              isSelected={isSelected}
              isGhost={isGhost}
            />
          )}
        </group>
      </Billboard>

      {/* HTML icon overlay on the billboard marker */}
      <Billboard
        follow={true}
        position={[0, SCENE.MARKER_Y_OFFSET, 0]}
      >
        <Html center style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <div style={{
            width: `${globalScale * 22}px`,
            height: `${globalScale * 22}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {!isDarkMode && cat.iconImage ? (
              <img 
                src={cat.iconImage}
                alt={cat.label || node.type}
                style={{
                  width: globalScale * 18,
                  height: globalScale * 18,
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            ) : (
              <svg
                width={globalScale * 16}
                height={globalScale * 16}
                viewBox="0 0 24 24"
                fill={isGhost ? '#666' : (isSelected ? '#fff' : (isDarkMode ? catColor : '#fff'))}
              >
                <path d={ICON_PATHS[cat.icon] || ICON_PATHS.portatil} />
              </svg>
            )}
          </div>
        </Html>
      </Billboard>

      {/* Mini label in node edit mode (always visible, compact) */}
      {showMiniLabel && (
        <Html
          position={[0, SCENE.MARKER_Y_OFFSET + 1.2, 0]}
          center
          style={{ pointerEvents: 'none' }}
          zIndexRange={[50, 0]}
        >
          <div className={`text-[9px] font-mono text-center whitespace-nowrap px-1.5 py-0.5 rounded ${
            isDarkMode 
              ? 'bg-black/70 border border-white/10' 
              : 'bg-white/80 border border-orange-200'
          }`}
               style={{ color: isDarkMode ? catColor : '#e86c1a' }}>
            {node.tooltipTitle}
          </div>
        </Html>
      )}

      {/* 3D-anchored tooltip (Hover small) */}
      {showHoverTooltip && (
        <Html
          position={[0, SCENE.TOOLTIP_Y_OFFSET, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[50, 0]}
        >
          <MarkerTooltip node={node} />
        </Html>
      )}

      {/* 3D-anchored FULL tooltip (Selected large) */}
      {showFullTooltip && (
        <Html
          position={[0.2, SCENE.MARKER_Y_OFFSET, 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[1000, 0]}
        >
          <Tooltip node={node} />
        </Html>
      )}

      {/* Ghost badge (admin only) */}
      {isGhost && isAdminMode && (
        <Html position={[0.8, SCENE.MARKER_Y_OFFSET + 0.5, 0]} center zIndexRange={[20, 0]}>
          <div className="bg-red-900/80 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
            Suspendido
          </div>
        </Html>
      )}
    </group>
  );
}
