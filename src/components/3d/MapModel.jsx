import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../../config/constants';

export default function MapModel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/CCUModelo4piso_salmona.glb');

  const processedScene = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        // Apply glass-tech material - slightly more transparent to let wireframe stand out
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

        // Add wireframe edges with BRIGHTER glow - key change for visibility
        const edges = new THREE.EdgesGeometry(child.geometry, 15);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(0x4fc3f7),
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
        });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        child.add(lineSegments);

        // Add a second, wider glow layer for the wireframe bloom effect
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
        glowLines.scale.multiplyScalar(1.001); // Slightly offset to create bloom
        child.add(glowLines);
      }
    });

    return cloned;
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={processedScene} scale={1} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/CCUModelo4piso_salmona.glb');
