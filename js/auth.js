// Fluxo de autenticação integrado com a API (cadastro, login, sessão).

// Converte o papel do back (CIDADAO/OPERADOR) para o usado no front (cidadao/operador).
function mapRole(apiRole) {
    return apiRole === 'OPERADOR' ? 'operador' : 'cidadao';
}

async function handleLogin(email, senha) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
    enterApp({ nome: data.user.nome, role: mapRole(data.user.role) });
}

async function handleRegister(nome, email, senha) {
    await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha })
    });
    // Cadastro cria um CIDADAO; entra direto (auto-login) para uma UX fluida.
    await handleLogin(email, senha);
    showToast('Cadastro realizado! Bem-vindo(a) ao CIMADEC.', 'success');
}

// Login rápido com a conta de demonstração do operador (para avaliação/apresentação).
async function loginDemoOperador() {
    try {
        await handleLogin('operador@cimadec.gov.br', '123456');
    } catch (e) {
        showToast(e.message || 'Conta de demonstração indisponível. Rode o seed no back-end.', 'error');
    }
}

// Chamado no carregamento: se já houver sessão válida (cookie), entra direto no app.
async function checkSession() {
    try {
        const data = await apiFetch('/auth/me');
        enterApp({ nome: data.user.nome, role: mapRole(data.user.role) });
    } catch {
        // Sem sessão (401) ou API fora: permanece na landing. Silencioso de propósito.
    }
}

// Alterna entre as abas Entrar / Criar conta na tela de acesso.
function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('login-form').classList.toggle('hidden', !isLogin);
    document.getElementById('register-form').classList.toggle('hidden', isLogin);

    const active = 'text-brand-blue border-brand-blue';
    const inactive = 'text-gray-400 border-transparent';
    document.getElementById('tab-login').className = `flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${isLogin ? active : inactive}`;
    document.getElementById('tab-register').className = `flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${isLogin ? inactive : active}`;
}

// Liga os formulários de login/cadastro (chamado após os includes carregarem).
function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type=submit]');
            btn.disabled = true;
            try {
                await handleLogin(
                    document.getElementById('login-email').value,
                    document.getElementById('login-senha').value
                );
            } catch (err) {
                showToast(err.message || 'Falha no login.', 'error');
            } finally {
                btn.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type=submit]');
            btn.disabled = true;
            try {
                await handleRegister(
                    document.getElementById('reg-nome').value,
                    document.getElementById('reg-email').value,
                    document.getElementById('reg-senha').value
                );
            } catch (err) {
                showToast(err.message || 'Falha no cadastro.', 'error');
            } finally {
                btn.disabled = false;
            }
        });
    }
}
