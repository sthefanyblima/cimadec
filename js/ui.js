const rolesConfig = {
    'cidadao': { avatar: 'C', name: 'Cidadão', roleLabel: 'Acesso Público', defaultView: 'c-dashboard' },
    'operador': { avatar: 'O', name: 'Matrícula 8092', roleLabel: 'Centro de Operações', defaultView: 'o-dashboard' }
};

// Entra no app com o usuário autenticado pela API. user = { nome, role('cidadao'|'operador') }.
function enterApp(user) {
    const role = user.role;
    currentUserRole = role;
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('app-wrapper').classList.remove('hidden');

    const navContainer = document.getElementById('main-nav');
    navContainer.innerHTML = `<p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3 mt-2">Navegação</p>`;

    const template = document.getElementById('menu-btn-template');

    (menus[role] || menus['cidadao']).forEach(item => {
        const clone = template.content.cloneNode(true);
        const button = clone.querySelector('button');

        button.id = `menu-${item.id}`;
        button.onclick = () => navigate(item.id, item.mock);
        clone.querySelector('i').className = `ph ${item.icon} text-lg`;
        clone.querySelector('span').textContent = item.label;

        navContainer.appendChild(clone);
    });

    const profile = rolesConfig[role] || rolesConfig['cidadao'];
    const nome = user.nome || profile.name;
    document.getElementById('user-avatar').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('user-name').textContent = nome;
    document.getElementById('user-role').textContent = profile.roleLabel;

    navigate(profile.defaultView);

    if (role === 'cidadao' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCitizenLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            calculateSurroundings();
        });
    }
}

// Encerra a sessão no back-end (limpa o cookie) e recarrega para a landing.
async function logout() {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* segue para reload mesmo se a API falhar */ }
    window.location.reload();
}

// Abre/fecha a sidebar no mobile. Sem argumento: alterna. Com booleano: força estado.
function toggleSidebar(open) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar || !backdrop) return;

    const shouldOpen = open === undefined ? sidebar.classList.contains('-translate-x-full') : open;
    sidebar.classList.toggle('-translate-x-full', !shouldOpen);
    backdrop.classList.toggle('hidden', !shouldOpen);
}

function navigate(viewName, isMock = false) {
    // Ações que não trocam de tela (ex.: exportar relatório) são tratadas antes.
    if (viewName === 'o-relatorios') {
        exportarRelatorioCSV();
        toggleSidebar(false);
        return;
    }

    document.querySelectorAll('main > div > div.flex, main > div > div.flex-col, main > div > div.max-w-3xl, main > div > div.overflow-x-auto, main > div > div.bg-white').forEach(div => div.classList.add('hidden'));

    document.querySelectorAll('#main-nav button').forEach(btn => {
        btn.classList.remove('bg-gray-100', 'text-brand-dark');
        btn.classList.add('text-gray-600');
    });

    const activeMenu = document.getElementById(`menu-${viewName}`);
    if(activeMenu) {
        activeMenu.classList.remove('text-gray-600');
        activeMenu.classList.add('bg-gray-100', 'text-brand-dark');
        document.getElementById('page-title').textContent = activeMenu.textContent.trim();
    }

    // No mobile, fecha o menu ao escolher uma seção.
    toggleSidebar(false);

    if (isMock) {
        document.getElementById('view-em-construcao').classList.remove('hidden');
        document.getElementById('view-em-construcao').classList.add('flex');
        return;
    }

    const targetView = document.getElementById(`view-${viewName}`);
    if(targetView) {
        targetView.classList.remove('hidden');
        if (viewName !== 'c-reportar' && viewName !== 'o-triagem') targetView.classList.add('flex');
    }

    if (viewName === 'c-dashboard') renderCitizenDashboard();
    if (viewName === 'c-reportar') setTimeout(initReportMap, 100);
    if (viewName === 'c-historico') renderCitizenHistory();
    if (viewName === 'c-alertas') renderCitizenAlertas();

    if (viewName === 'o-dashboard') renderOperatorDash();
    if (viewName === 'o-mapa') renderOperatorMap();
    if (viewName === 'o-triagem') renderOperatorTable();
}