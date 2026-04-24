/* global SUPABASE_URL, SUPABASE_ANON_KEY, supabase */

const _supabaseClient = (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL &&
                         typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY)
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

async function getAuthHeaders() {
    if (!_supabaseClient) return {};
    const { data } = await _supabaseClient.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

window._supabaseClient = _supabaseClient;
window.getAuthHeaders  = getAuthHeaders;
