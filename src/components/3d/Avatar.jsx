import React, { useRef, useState, useCallback } from 'react';
import { Billboard, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { COLORS, SCENE } from '../../config/constants';

export default function Avatar() {
  const ringRef = useRef();
  const groupRef = useRef();
  const userLocation = useStore(s => s.userLocation);
  const isAdminMode = useStore(s => s.isAdminMode);
  const draggedAvatar = useStore(s => s.draggedAvatar);
  const setDraggedAvatar = useStore(s => s.setDraggedAvatar);
  const setUserLocation = useStore(s => s.setUserLocation);

  const [hovered, setHovered] = useState(false);
  const { camera, raycaster, pointer, gl } = useThree();

  const handlePointerDown = useCallback((e) => {
    if (isAdminMode) {
      e.stopPropagation();
      setDraggedAvatar(true);
      gl.domElement.style.cursor = 'grabbing';
    }
  }, [isAdminMode, setDraggedAvatar, gl]);

  React.useEffect(() => {
    if (draggedAvatar) {
      const handleGlobalUp = () => {
        if (groupRef.current) {
          setUserLocation({ x: groupRef.current.position.x, z: groupRef.current.position.z });
        }
        setDraggedAvatar(false);
        gl.domElement.style.cursor = 'auto';
      };
      window.addEventListener('pointerup', handleGlobalUp);
      return () => window.removeEventListener('pointerup', handleGlobalUp);
    }
  }, [draggedAvatar, setUserLocation, setDraggedAvatar, gl]);

  useFrame((state) => {
    if (!ringRef.current || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Pulsing ring animation
    const scale = 1 + Math.sin(t * 2) * 0.15;
    ringRef.current.scale.set(scale, scale, scale);
    ringRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.15;

    // Handle drag
    if (draggedAvatar && isAdminMode) {
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

        groupRef.current.position.set(snapX, SCENE.AVATAR_Y_OFFSET, snapZ);
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      position={[userLocation.x, SCENE.AVATAR_Y_OFFSET, userLocation.z]}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        if (isAdminMode) {
          e.stopPropagation();
          setHovered(true);
          gl.domElement.style.cursor = draggedAvatar ? 'grabbing' : 'grab';
        }
      }}
      onPointerOut={() => {
        if (isAdminMode) {
          setHovered(false);
          if (!useStore.getState().draggedNodeId && !useStore.getState().draggedAvatar) {
            gl.domElement.style.cursor = 'auto';
          }
        }
      }}
    >
      {/* Pulse ring on ground */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[0.6, 0.9, 32]} />
        <meshBasicMaterial
          color={COLORS.ACCENT_ORANGE}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial
          color={COLORS.ACCENT_ORANGE}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Vertical indicator line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 1.8, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={COLORS.ACCENT_ORANGE} transparent opacity={0.4} />
      </line>

      {/* Billboard label */}
      <Billboard position={[0, 2.2, 0]}>
        <mesh>
          <circleGeometry args={[0.35, 6]} />
          <meshBasicMaterial color={COLORS.ACCENT_ORANGE} transparent opacity={0.9} />
        </mesh>
      </Billboard>

      {/* Label HTML */}
      <Html position={[0, 3, 0]} center>
        <div className="glass-panel px-2 py-1 text-center whitespace-nowrap select-none"
             style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}>
          <p className="text-[9px] font-mono uppercase tracking-widest text-orange-400">
            Usted está aquí
          </p>
        </div>
      </Html>
    </group>
  );
}
