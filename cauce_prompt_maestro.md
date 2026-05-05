# PROMPT MAESTRO: Proyecto CAUCE - Circuito Interactivo 3D

## 1. Contexto del Proyecto
Eres un desarrollador experto (Senior Frontend, UX/UI, Creative Developer) especializado en React, Three.js (React Three Fiber) y Tailwind CSS. Tu objetivo es migrar y escalar un prototipo de mapa interactivo 3D para un museo a una arquitectura modular y profesional.

## 2. Stack Tecnológico (Infraestructura)
- **Framework:** React 18+ (construido con Vite).
- **3D Engine:** `@react-three/fiber` y `@react-three/drei`.
- **State Management:** `zustand` (Crucial para sincronizar la UI HTML con el Canvas 3D).
- **Estilos:** Tailwind CSS + `framer-motion` (para animaciones fluidas).
- **Iconografía:** SVG puro integrado en componentes.

## 3. Lógica de Estado (Zustand `useStore`)
El proyecto necesita un estado global para evitar "prop drilling" entre el Canvas 3D y la UI 2D HTML. El store debe manejar:
- `isAdminMode`: booleano.
- `selectedNodeId`: ID del nodo actualmente seleccionado.
- `draggedNodeId`: ID del nodo siendo arrastrado (solo admin).
- `globalScale`: Tamaño de los íconos.
- `nodes`: Array de objetos con la data de las estaciones.
- `cameraView`: Objeto con `position` y `target` para el snapshot de la cámara.

## 4. Arquitectura de Diseño (Estilos)
- **Tipografías:** `Space Grotesk` (Principal), `Roboto Mono` (Subtítulos).
- **Paleta de Colores (Fondo Dark Técnico):**
  - Background radial: `#1e2532` a `#0a0d14`.
  - Accent Blue (Glow & Active): `#4fc3f7`.
  - Accent Orange (Avatar & Warnings): `#f97316`.
  - Soft Red (Delete/Ghost): `#e74c3c`.
  - UI Panels: `rgba(15, 20, 30, 0.98)` con `backdrop-filter: blur(20px)`.

## 5. Módulos Críticos a Desarrollar

### A. Escena 3D (`src/components/3d/Scene.jsx`)
- Canvas de pantalla completa con `OrbitControls`.
- **MapModel:** Debe cargar un archivo `/modelo.glb` usando `useGLTF`. 
- **Efecto Glass Técnico:** Al modelo cargado se le debe sobreescribir el material por un `MeshPhysicalMaterial` oscuro translúcido (`color: 0x0f172a`, `transmission: 0.4`, `roughness: 0.1`) y agregarle `LineSegments` en los bordes usando `LineBasicMaterial` color `#4fc3f7` con `AdditiveBlending`.

### B. Sistema de Marcadores y Avatar (`src/components/3d/Marker.jsx`)
- Elementos "Billboard" que siempre miran a la cámara (`<Billboard>` de Drei).
- **Estado Ghost:** Si un nodo tiene `disabled: true`, no se renderiza en modo usuario. En modo Admin se renderiza con `opacity: 0.3`.
- **Drag & Drop:** Implementar lógica de arrastre en el plano XZ usando `useThree` y el puntero si `isAdminMode` está activo.

### C. Sistema UI HTML (`src/components/ui/`)
- Creado sobre el Canvas usando `pointer-events-none` en el contenedor padre, reactivando `pointer-events-auto` solo en los paneles.
- **Sidebar Dinámico:** Muestra el nombre de las estaciones (usando `tooltipTitle` de la data). Si la estación está deshabilitada, se oculta (excepto en admin).
- **Ficha Técnica & Tooltip:** Componentes animados con `framer-motion` que reaccionan a `selectedNodeId`. El Tooltip debe usar `Html` de `@react-three/drei` anclado al objeto 3D para que lo siga en el espacio con un offset en Y.
- **Admin Panel:** Un panel z-index altísimo que permita editar el JSON de los nodos (título, concepto, equipamiento, origen, toggle de estado "suspendido"), guardar la vista de la cámara actual, y un botón para exportar la data (copiar al portapapeles).

## 6. Instrucción de Inicio
Inicializa los archivos base (`App.jsx`, `useStore.js`, y la configuración inicial de `data.js`) aplicando estas directrices estrictamente. Prioriza un código limpio, uso de Hooks de React, y modularidad.