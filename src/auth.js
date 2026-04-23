/* global SUPABASE_URL, SUPABASE_ANON_KEY, supabase */

// ─── AUTH ─────────────────────────────────────────────────────────────────────
// Initialises the Supabase client and wires up the login/signup/logout UI.

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getAuthHeaders() {
    const { data } = await _supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function setAuthUI(user) {
    const btn  = document.getElementById('authBtn');
    const name = document.getElementById('authUserName');
    if (user) {
        btn.textContent  = 'Logout';
        name.textContent = user.email;
        name.classList.remove('hidden');
    } else {
        btn.textContent = 'Login / Sign up';
        name.classList.add('hidden');
    }
}

// ── Auth state listener ───────────────────────────────────────────────────────

_supabase.auth.onAuthStateChange((_, session) => {
    setAuthUI(session?.user ?? null);
});

// ── Modal logic ───────────────────────────────────────────────────────────────

function openAuthModal() { document.getElementById('authModal').classList.remove('hidden'); }
function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authError').classList.add('hidden');
    document.getElementById('authError').textContent = '';
}

document.getElementById('authBtn').addEventListener('click', async () => {
    const { data } = await _supabase.auth.getSession();
    if (data?.session) {
        await _supabase.auth.signOut();
    } else {
        openAuthModal();
    }
});

document.getElementById('closeAuthModal').addEventListener('click', closeAuthModal);
document.getElementById('authModal').addEventListener('click', e => {
    if (e.target === document.getElementById('authModal')) closeAuthModal();
});

document.getElementById('authSwitchLink').addEventListener('click', () => {
    const isLogin = document.getElementById('authTitle').textContent === 'Login';
    document.getElementById('authTitle').textContent    = isLogin ? 'Sign up' : 'Login';
    document.getElementById('authSubmitBtn').textContent = isLogin ? 'Create account' : 'Login';
    document.getElementById('authSwitchText').textContent = isLogin ? 'Already have an account? ' : "Don't have an account? ";
    document.getElementById('authSwitchLink').textContent = isLogin ? 'Login' : 'Sign up';
    document.getElementById('authError').classList.add('hidden');
});

document.getElementById('authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const isSignup = document.getElementById('authTitle').textContent === 'Sign up';
    const errEl    = document.getElementById('authError');

    const { error } = isSignup
        ? await _supabase.auth.signUp({ email, password })
        : await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errEl.textContent = error.message;
        errEl.classList.remove('hidden');
    } else {
        closeAuthModal();
    }
});

window.getAuthHeaders = getAuthHeaders;
