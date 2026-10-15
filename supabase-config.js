window.HT_SUPABASE_URL = 'https://zydfwawfpwpgusktxmmm.supabase.co';
window.HT_SUPABASE_ANON_KEY = 'sb_publishable_LU71YeiVAR_9eHYBAKp0oQ_cHRx1YdQ';
window.htSupabase = window.supabase.createClient(
  window.HT_SUPABASE_URL,
  window.HT_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'huetay-admin-auth',
      storage: window.localStorage,
      flowType: 'pkce'
    }
  }
);
