import { createClient } from '@supabase/supabase-js';
import { isAdminUser } from '@/lib/admin';

export function createAuthenticatedSupabaseClient(authHeader = '') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

export async function getAdminUserFromRequest(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader) {
    return { user: null, status: 401, error: 'Authentification requise.' };
  }

  const supabase = createAuthenticatedSupabaseClient(authHeader);
  if (!supabase) {
    return { user: null, status: 500, error: 'Configuration Supabase incomplète.' };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return { user: null, status: 401, error: 'Session invalide.' };
  }
  if (!isAdminUser(data.user)) {
    return { user: null, status: 403, error: 'Accès administrateur requis.' };
  }

  return { user: data.user, status: 200, error: null };
}
