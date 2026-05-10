/**
 * Build-time SSR stub for `@/lib/supabase`.
 *
 * Aliased into the SSR bundle by `vite.config.ts` (only when `--ssr` is
 * active, never in the browser bundle). It exports the same shape as the
 * real Supabase client so any module-level imports (e.g.
 * `import { supabase, supabaseConfigured } from '../lib/supabase'`) succeed
 * at server-render time without trying to load `@supabase/auth-js`'s
 * problematic CJS `GoTrueClient` (which has a runtime
 * `require('./lib/web3/ethereum')` that crashes in pure Node ESM).
 *
 * Every method is a no-op that returns benign values — SSR pages are public
 * marketing surfaces that don't actually call Supabase, so we just need to
 * not crash on import.
 */

const noop = async () => ({ data: null, error: null });
const noopList = async () => ({ data: [], error: null });

const tableProxy = {
  select: () => tableProxy,
  insert: () => noop(),
  upsert: () => noop(),
  update: () => noop(),
  delete: () => noop(),
  eq: () => tableProxy,
  in: () => tableProxy,
  single: () => noop(),
  maybeSingle: () => noop(),
  order: () => tableProxy,
  limit: () => tableProxy,
  then: (resolve: (v: { data: never[]; error: null }) => unknown) =>
    Promise.resolve({ data: [], error: null }).then(resolve),
};

const stubClient = {
  auth: {
    getSession: noop,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    setSession: noop,
    refreshSession: noop,
    signUp: noop,
    signInWithPassword: noop,
    signInWithOAuth: noop,
    resetPasswordForEmail: noop,
    signOut: async () => ({ error: null }),
  },
  from: () => tableProxy,
  rpc: noop,
  storage: { from: () => ({ upload: noop, download: noopList, remove: noop }) },
} as const;

export const supabase = stubClient;
export const supabaseConfigured = false;

// Mirror the `@supabase/supabase-js` named export so direct imports
// (`import { createClient } from '@supabase/supabase-js'`) resolve cleanly
// after the alias rewrite — they all return the same noop client.
export function createClient() {
  return stubClient;
}
