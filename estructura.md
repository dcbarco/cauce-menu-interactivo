/Cauce_menu_interactivo
├── public/
│   └── modelo.glb             <-- Tu modelo 3D va aquí
├── src/
│   ├── components/
│   │   ├── 3d/                <-- Todo lo de Three.js
│   │   │   ├── Scene.jsx
│   │   │   ├── MapModel.jsx   <-- Carga el GLB y aplica el material Glass
│   │   │   ├── Marker.jsx     <-- Componente del icono 3D
│   │   │   ├── Avatar.jsx     <-- Componente "Usted está aquí"
│   │   │   └── HologramBase.jsx
│   │   ├── ui/                <-- Interfaz 2D (HTML/CSS)
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── Legend.jsx
│   ├── store/
│   │   └── useStore.js        <-- Estado global (Zustand)
│   ├── config/
│   │   ├── data.js            <-- JSON inicial exportable
│   │   └── constants.js       <-- Colores, SVGs y categorías
│   ├── App.jsx                <-- Orquestador principal
│   ├── index.css              <-- Estilos globales (Tailwind)
│   └── main.jsx               <-- Punto de entrada
├── package.json
└── vite.config.js