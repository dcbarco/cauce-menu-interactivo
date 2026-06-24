import React, { Suspense } from 'react';
import MapModel from './MapModel';
import Marker from './Marker';
import Avatar from './Avatar';
import HologramBase from './HologramBase';
import { useStore } from '../../store/useStore';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#4fc3f7" wireframe />
    </mesh>
  );
}

export default function Scene() {
  const nodes = useStore(s => s.nodes);
  const isAdminMode = useStore(s => s.isAdminMode);
  const isNodeEditMode = useStore(s => s.isNodeEditMode);
  const clearSelection = useStore(s => s.clearSelection);
  const isDarkMode = useStore(s => s.isDarkMode);

  const show3DModel = useStore(s => s.show3DModel);

  const visibleNodes = React.useMemo(() => {
    if (isAdminMode) return nodes;
    let filtered = nodes.filter(n => !n.disabled);
    const activeCategory = useStore.getState().activeCategory;
    if (activeCategory) {
      filtered = filtered.filter(n => n.type === activeCategory);
    }
    return filtered;
  }, [nodes, isAdminMode, useStore(s => s.activeCategory)]);

  return (
    <group onClick={(e) => {
      // Deselect when clicking on empty space
      if (e.object?.type === 'Mesh' || e.object?.type === 'GridHelper') {
        clearSelection();
      }
    }}>
      {/* Lighting */}
      {isDarkMode ? (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={0.7} />
          <directionalLight position={[-10, 15, -5]} intensity={0.3} color="#4fc3f7" />
          <pointLight position={[0, 10, 0]} intensity={0.3} color="#4fc3f7" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 20, 10]} intensity={1.0} color="#fff5e6" />
          <directionalLight position={[-10, 15, -5]} intensity={0.4} color="#ffd4a8" />
          <pointLight position={[0, 10, 0]} intensity={0.2} color="#e86c1a" />
        </>
      )}

      {/* Environment base */}
      {show3DModel && <HologramBase />}

      {/* 3D Building Model */}
      <Suspense fallback={<LoadingFallback />}>
        <MapModel />
      </Suspense>

      {/* Station Markers */}
      {visibleNodes.map(node => (
        <Marker key={node.id} node={node} />
      ))}

      {/* User Avatar */}
      <Avatar />

      {/* Fog - adapts to theme (disabled in node edit mode so we can zoom out to find lost points) */}
      {!isNodeEditMode && (isDarkMode ? (
        <fog attach="fog" args={['#0a0d14', 30, 60]} />
      ) : (
        <fog attach="fog" args={['#f5f0eb', 40, 80]} />
      ))}
    </group>
  );
}
