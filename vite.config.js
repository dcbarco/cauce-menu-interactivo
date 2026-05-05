import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(function(req, res, next) {
        if (req.method === 'POST' && req.url === '/api/save') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const content = `// Archivo autogenerado por el backend
export const initialNodes = ${JSON.stringify(data.nodes, null, 2)};

// Configuración inicial de la cámara
export const defaultCameraConfig = ${JSON.stringify(data.cameraConfig, null, 2)};

// Ubicación del avatar "Usted está aquí"
export const defaultUserLocation = ${JSON.stringify(data.userLocation, null, 2)};
`;
              fs.writeFileSync(path.resolve(__dirname, 'src/config/data.js'), content, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    port: 5173,
    open: true
  }
});
