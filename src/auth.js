/* global SUPABASE_URL, SUPABASE_ANON_KEY, BACKEND_URL, supabase */

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
    const btn     = document.getElementById('authBtn');
    const name    = document.getElementById('authUserName');
    const histBtn = document.getElementById('historyBtn');
    if (user) {
        btn.textContent = 'Logout';
        name.textContent = user.email;
        name.classList.remove('hidden');
        histBtn.classList.remove('hidden');
    } else {
        btn.textContent = 'Login / Sign up';
        name.classList.add('hidden');
        histBtn.classList.add('hidden');
    }
}

// ── Auth state listener ───────────────────────────────────────────────────────

_supabase.auth.onAuthStateChange((_, session) => {
    setAuthUI(session?.user ?? null);
});

// ── Auth modal ────────────────────────────────────────────────────────────────

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
    document.getElementById('authTitle').textContent     = isLogin ? 'Sign up' : 'Login';
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

// ── History modal ─────────────────────────────────────────────────────────────

const STATUS_LABELS = {
    true:    { text: 'Verified',       cls: 'bg-emerald-100 text-emerald-700' },
    partial: { text: 'Partial',        cls: 'bg-amber-100 text-amber-700'    },
    false:   { text: 'False',          cls: 'bg-rose-100 text-rose-700'      },
    no_data: { text: 'No Data',        cls: 'bg-stone-100 text-stone-500'    },
};

async function loadHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '<p class="text-stone-400 text-sm text-center py-8">Loading...</p>';
    try {
        const res  = await fetch(`${BACKEND_URL}/api/history`, { headers: await getAuthHeaders() });
        const data = await res.json();
        if (!data.searches?.length) {
            list.innerHTML = '<p class="text-stone-400 text-sm text-center py-8">No searches yet.</p>';
            return;
        }
        list.innerHTML = data.searches.map(s => {
            const st    = STATUS_LABELS[s.result_status] || STATUS_LABELS.no_data;
            const date  = new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const tab   = s.tab === 'web' ? 'Web' : 'Official';
            return `<div class="flex items-start justify-between gap-4 py-3 border-b border-stone-100 last:border-0">
                <div class="flex-1 min-w-0">
                    <p class="text-stone-800 font-medium truncate">${s.query}</p>
                    <p class="text-xs text-stone-400 mt-0.5">${date} · ${tab}</p>
                </div>
                <span class="shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${st.cls}">${st.text}</span>
            </div>`;
        }).join('');
    } catch {
        list.innerHTML = '<p class="text-rose-500 text-sm text-center py-8">Failed to load history.</p>';
    }
}

document.getElementById('historyBtn').addEventListener('click', () => {
    document.getElementById('historyModal').classList.remove('hidden');
    loadHistory();
});

document.getElementById('closeHistoryModal').addEventListener('click', () => {
    document.getElementById('historyModal').classList.add('hidden');
});

document.getElementById('historyModal').addEventListener('click', e => {
    if (e.target === document.getElementById('historyModal'))
        document.getElementById('historyModal').classList.add('hidden');
});

window.getAuthHeaders = getAuthHeaders;
