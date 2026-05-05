import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../../config/constants';
import { useStore } from '../../store/useStore';

export default function HologramBase() {
  const gridRef = useRef();
  const isAdminMode = useStore(s => s.isAdminMode);
  const isNodeEditMode = useStore(s => s.isNodeEditMode);

  const showGrid = isAdminMode || isNodeEditMode;

  useFrame((state) => {
    if (gridRef.current) {
      // Brighter grid in node edit mode for easier positioning
      const baseOpacity = isNodeEditMode ? 0.06 : 0.004;
      const pulse = isNodeEditMode ? 0 : Math.sin(state.clock.elapsedTime * 0.5) * 0.002;
      gridRef.current.material.opacity = baseOpacity + pulse;
    }
  });

  return (
    <group>
      {/* Ground plane (subtle dark) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={COLORS.BG_DARK}
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Grid overlay */}
      {showGrid && (
        <gridHelper
          ref={gridRef}
          args={[200, 200, COLORS.GLASS_LINE, COLORS.GLASS_LINE]}
          position={[0, 0.01, 0]}
        />
      )}

      {/* Circular boundary rings */}
      {[10, 15, 20].map((radius, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
          <meshBasicMaterial
            color={COLORS.GLASS_LINE}
            transparent
            opacity={0.02 - i * 0.005}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
