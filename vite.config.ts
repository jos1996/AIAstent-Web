import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Shared session store — settings web app writes here, Tauri chatbot reads
let sessionStore: { access_token: string; refresh_token: string } | null = null;

export default defineConfig(({ mode, command, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gaMeasurementId =
    env.VITE_GA_MEASUREMENT_ID?.trim() || 'G-T3T0N5C7YG'

  // For SSR builds we swap the real Supabase client for a no-op stub. The
  // browser bundle keeps the real client. See `src/lib/supabase.ssr-stub.ts`.
  // AuthContext stays as-is — its `useAuth` already falls back to a SSR-safe
  // default when no provider is mounted (`typeof window === 'undefined'`).
  const ssrAliases = isSsrBuild
    ? {
        '@supabase/supabase-js': path.resolve(__dirname, 'src/lib/supabase.ssr-stub.ts'),
        [path.resolve(__dirname, 'src/lib/supabase.ts')]: path.resolve(
          __dirname,
          'src/lib/supabase.ssr-stub.ts',
        ),
      }
    : {}
  void command

  return {
  resolve: {
    alias: ssrAliases,
  },
  plugins: [
    {
      // Some dependencies (jspdf, canvg) import "@babel/runtime/helpers/<name>"
      // without the .js suffix, which Rollup's exports-field resolution rejects.
      // Resolve them ourselves to the on-disk CommonJS helper file.
      name: 'resolve-babel-runtime-helpers',
      enforce: 'pre' as const,
      resolveId(id: string) {
        if (!id.startsWith('@babel/runtime/helpers/')) return null
        const helper = id
          .slice('@babel/runtime/helpers/'.length)
          .split('?')[0]
        if (!helper || helper.includes('/')) return null
        const root = path.resolve(__dirname, 'node_modules/@babel/runtime/helpers')
        const candidates = [
          path.join(root, 'esm', `${helper}.js`),
          path.join(root, `${helper}.js`),
        ]
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) return candidate
        }
        return null
      },
    },
    react(),
    {
      name: 'inject-ga-measurement-id',
      transformIndexHtml(html: string) {
        return html.replaceAll('%GA_MEASUREMENT_ID%', gaMeasurementId)
      },
    },
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
  build: {
    // Lift the warning ceiling — Core Web Vitals are dominated by LCP, FID,
    // and CLS, not by total bundle size. We code-split the heavy bits
    // (Supabase, Lucide icons, jspdf/html2canvas) into separate chunks below
    // so the initial route only loads what it actually needs.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          // React core stays in the main entry — every page needs it.
          if (id.includes('react-dom') || /node_modules\/react\//.test(id)) return undefined;
          if (id.includes('react-router')) return undefined;
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('lucide-react')) return 'vendor-lucide';
          if (id.includes('jspdf')) return 'vendor-pdf';
          if (id.includes('html2canvas')) return 'vendor-pdf';
          if (id.includes('pdfjs-dist')) return 'vendor-pdf';
          if (id.includes('canvg')) return 'vendor-pdf';
          if (id.includes('date-fns')) return 'vendor-datefns';
          return 'vendor';
        },
      },
    },
  },
  ssr: {
    // Don't try to externalize these for SSR — bundle them so the
    // server-rendered output works as a self-contained ESM module that
    // `scripts/prerender-ssr.mjs` can `import()` from Node. Supabase is
    // intentionally absent here; it's aliased to a no-op stub above.
    noExternal: ['react-router-dom', 'react-router', 'lucide-react'],
  },
}
})
