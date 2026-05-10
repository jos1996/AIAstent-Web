import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import SsrRoutes from './SsrRoutes';

/**
 * Build-time SSR entrypoint.
 *
 * Vite builds this with `--ssr` into `dist-ssr/entry-server.js`. The
 * `scripts/prerender-ssr.mjs` script imports the resulting `render` function
 * and calls it once per route to produce static HTML for the body.
 *
 * Important: we deliberately do NOT mount `AuthProvider` here. SEO pages are
 * public marketing pages that don't depend on auth state, and `AuthProvider`
 * pulls in `@supabase/supabase-js` whose `GoTrueClient` does a runtime
 * `require()` that crashes under pure Node ESM. The browser bundle still
 * mounts `AuthProvider` at hydration time via `App.tsx`, so the client
 * experience is unchanged.
 *
 * Head metadata (title / meta / canonical / JSON-LD) is composed separately
 * by the prerender script using `src/lib/routeMetadata.ts` — that gives us
 * a single source of truth and keeps the SSR output focused on body markup.
 */
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <SsrRoutes />
    </StaticRouter>,
  );
}
