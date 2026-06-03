/* client.ts — Supabase client placeholder.
 *
 * The UI never imports Supabase directly; everything goes through the stub
 * modules in this directory. This file is where the real client will live.
 *
 * MOCK SHAPE: there is no mock here — just a typed `null` placeholder so other
 * stub modules can `import { supabase }` without breaking once it's real.
 *
 * TODO(sean): create the real client. Read the URL + key from SvelteKit's
 * build-time public env (this is a static-SPA, so use $env/static/public — only
 * PUBLIC_-prefixed vars reach the client; that's correct, the publishable/anon
 * key is meant to be public and RLS protects the data). Set them in .env (see
 * .env.example). Then:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
 *   export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);
 *
 * Prefer the new sb_publishable_… key over the legacy anon key (PRD §4). NEVER
 * import the secret/service_role key here — there is no server to hide it.
 */

// Until wired, this is null. Stub modules must not actually call it.
export const supabase: unknown = null;
