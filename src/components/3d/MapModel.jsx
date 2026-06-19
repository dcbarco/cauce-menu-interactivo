import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, COLORS_LIGHT } from '../../config/constants';
import { useStore } from '../../store/useStore';

export default function MapModel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/CCUModelo4piso_salmona.glb');
  const isDarkMode = useStore(s => s.isDarkMode);

  const processedScene = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        if (isDarkMode) {
          // Dark mode: glass-tech blue wireframe
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0x0a1628),
            metalness: 0.1,
            roughness: 0.15,
            transmission: 0.5,
            thickness: 0.3,
            transparent: true,
            opacity: 0.6,
            envMapIntensity: 0.3,
            side: THREE.DoubleSide,
          });

          // Wireframe edges - bright blue glow
          const edges = new THREE.EdgesGeometry(child.geometry, 15);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(0x4fc3f7),
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
          });
          const lineSegments = new THREE.LineSegments(edges, lineMaterial);
          child.add(lineSegments);

          // Second glow layer
          const glowLines = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: new THREE.Color(0x29b6f6),
              transparent: true,
              opacity: 0.25,
              blending: THREE.AdditiveBlending,
              linewidth: 2,
            })
          );
          glowLines.scale.multiplyScalar(1.001);
          child.add(glowLines);
        } else {
          // Light mode: warm terracotta/orange wireframe on pinkish body
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(COLORS_LIGHT.MODEL_BODY),
            metalness: 0.0,
            roughness: 0.4,
            transmission: 0.3,
            thickness: 0.2,
            transparent: true,
            opacity: 0.35,
            envMapIntensity: 0.2,
            side: THREE.DoubleSide,
          });

          // Wireframe edges - orange/terracotta
          const edges = new THREE.EdgesGeometry(child.geometry, 15);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(COLORS_LIGHT.MODEL_WIRE),
            transparent: true,
            opacity: 0.55,
          });
          const lineSegments = new THREE.LineSegments(edges, lineMaterial);
          child.add(lineSegments);

          // Second softer glow layer
          const glowLines = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: new THREE.Color(0xe8956a),
              transparent: true,
              opacity: 0.15,
              linewidth: 2,
            })
          );
          glowLines.scale.multiplyScalar(1.001);
          child.add(glowLines);
        }
      }
    });

    return cloned;
  }, [scene, isDarkMode]);

  return (
    <group ref={groupRef}>
      <primitive object={processedScene} scale={1} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/CCUModelo4piso_salmona.glb');
