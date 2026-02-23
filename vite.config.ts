import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Shared session store — settings web app writes here, Tauri chatbot reads
let sessionStore: { access_token: string; refresh_token: string } | null = null;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'session-bridge',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url!, 'http://localhost:5174');

          // Tauri chatbot GETs session from here
          if (url.pathname === '/api/session') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

            // POST — settings web app pushes tokens here
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  if (data.access_token && data.refresh_token) {
                    sessionStore = { access_token: data.access_token, refresh_token: data.refresh_token };
                  } else if (data.clear) {
                    sessionStore = null;
                  }
                } catch { /* ignore bad JSON */ }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true }));
              });
              return;
            }

            // GET — Tauri chatbot reads tokens
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sessionStore));
            return;
          }

          next();
        });
      },
    },
  ],
  server: {
    port: 5174,
  },
})
