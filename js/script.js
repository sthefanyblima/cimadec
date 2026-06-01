/**
 * CIMADEC - Lógica Front-end (Design Sóbrio)
 */

// --- 1. CONFIGURAÇÃO VISUAL E DADOS MOCKADOS ROBUSTOS ---
// Sem fundos coloridos, usando indicadores pontuais (dots) e tipografia neutra.
const CATEGORIAS_MAP = {
    'enchente': { nome: 'Alagamento', icon: 'ph-waves' },
    'deslizamento': { nome: 'Deslizamento', icon: 'ph-mountains' },
    'lixo': { nome: 'Resíduos Irregulares', icon: 'ph-trash' },
    'arvore': { nome: 'Queda de Árvore', icon: 'ph-tree' }
};

const STATUS_MAP = {
    'novo': { label: 'Pendente', dot: 'bg-brand-red', text: 'text-brand-dark' },
    'em_analise': { label: 'Em Análise', dot: 'bg-blue-500', text: 'text-brand-dark' },
    'resolvido': { label: 'Resolvido', dot: 'bg-gray-400', text: 'text-gray-500' }
};

// Massa de dados maior espalhada por Maceió (Centro, Farol, Benedito Bentes, Trapiche, etc)
const initialMock = [
    { id: 'PRT-2026-901', cat: 'enchente', desc: 'Rua alagada impedindo tráfego de ônibus no Centro.', data: '31/05/2026', lat: -9.6655, lng: -35.7351, status: 'novo' },
    { id: 'PRT-2026-902', cat: 'deslizamento', desc: 'Sinais de rachadura no asfalto próximo à encosta na Chã da Jaqueira.', data: '30/05/2026', lat: -9.6200, lng: -35.7500, status: 'em_analise' },
    { id: 'PRT-2026-903', cat: 'lixo', desc: 'Descarte de metralha bloqueando calçada no Trapiche.', data: '30/05/2026', lat: -9.6750, lng: -35.7550, status: 'resolvido' },
    { id: 'PRT-2026-904', cat: 'enchente', desc: 'Transbordamento de canal no Benedito Bentes.', data: '29/05/2026', lat: -9.5445, lng: -35.7312, status: 'novo' },
    { id: 'PRT-2026-905', cat: 'arvore', desc: 'Árvore caída rompendo fiação na Av. Fernandes Lima (Farol).', data: '28/05/2026', lat: -9.6450, lng: -35.7300, status: 'resolvido' },
    { id: 'PRT-2026-906', cat: 'deslizamento', desc: 'Deslizamento leve de barreira no Jacintinho.', data: '27/05/2026', lat: -9.6455, lng: -35.7153, status: 'em_analise' },
    { id: 'PRT-2026-907', cat: 'lixo', desc: 'Foco de lixo crônico próximo à praia de Pajuçara.', data: '27/05/2026', lat: -9.6680, lng: -35.7140, status: 'novo' }
];

let db = JSON.parse(localStorage.getItem('cimadec_db_v2')) || initialMock;

// --- 2. CONTROLE DE VIEWS E MENUS ---
function loginAs(role) {
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('app-wrapper').classList.remove('hidden');

    const menus = document.querySelectorAll('#app-wrapper aside nav button');
    menus.forEach(m => m.classList.add('hidden'));

    if (role === 'cidadao') {
        document.getElementById('user-avatar').textContent = 'C';
        document.getElementById('user-name').textContent = 'Cidadão';
        document.getElementById('user-role').textContent = 'Acesso Público';
        
        document.getElementById('menu-reportar').classList.remove('hidden');
        document.getElementById('menu-meus-registros').classList.remove('hidden');
        navigate('reportar');
    } else {
        document.getElementById('user-avatar').textContent = 'O';
        document.getElementById('user-name').textContent = 'Matrícula 8092';
        document.getElementById('user-role').textContent = 'Centro de Operações';
        
        document.getElementById('menu-painel-geral').classList.remove('hidden');
        document.getElementById('menu-triagem').classList.remove('hidden');
        navigate('painel-geral');
    }
}

function logout() {
    document.getElementById('app-wrapper').classList.add('hidden');
    document.getElementById('landing-view').classList.remove('hidden');
}

function navigate(viewName) {
    // Esconde todas as views
    ['reportar', 'meus-registros', 'painel-geral', 'triagem'].forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
    });
    
    const target = document.getElementById(`view-${viewName}`);
    target.classList.remove('hidden');
    if (viewName !== 'reportar' && viewName !== 'triagem') target.classList.add('flex');

    // Títulos
    const titles = {
        'reportar': 'Submeter Novo Registro',
        'meus-registros': 'Histórico de Registros',
        'painel-geral': 'Visão Geral (Centro de Operações)',
        'triagem': 'Fila de Triagem'
    };
    document.getElementById('page-title').textContent = titles[viewName];

    // Menu Styling Sóbrio
    document.querySelectorAll('#app-wrapper aside nav button').forEach(el => {
        el.classList.remove('bg-gray-100', 'text-brand-dark');
        el.classList.add('text-gray-600');
    });
    const activeMenu = document.getElementById(`menu-${viewName}`);
    if(activeMenu) {
        activeMenu.classList.remove('text-gray-600');
        activeMenu.classList.add('bg-gray-100', 'text-brand-dark');
    }

    // Inicializadores de View
    if(viewName === 'reportar') setTimeout(initReportMap, 100);
    if(viewName === 'meus-registros') renderCitizenList();
    if(viewName === 'painel-geral') renderOperatorDash();
    if(viewName === 'triagem') renderOperatorTable();
}

// Binds de Menu
document.getElementById('menu-reportar').addEventListener('click', () => navigate('reportar'));
document.getElementById('menu-meus-registros').addEventListener('click', () => navigate('meus-registros'));
document.getElementById('menu-painel-geral').addEventListener('click', () => navigate('painel-geral'));
document.getElementById('menu-triagem').addEventListener('click', () => navigate('triagem'));

// --- 3. CIDADÃO: FLUXO DE REPORTE E MAPA ---
let reportMap, reportMarker;

function initReportMap() {
    if(reportMap) return;
    reportMap = L.map('map-report').setView([-9.665, -35.735], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(reportMap);
    
    reportMap.on('click', (e) => setMapPin(e.latlng.lat, e.latlng.lng));
}

function setMapPin(lat, lng) {
    document.getElementById('form-lat').value = lat.toFixed(5);
    document.getElementById('form-lng').value = lng.toFixed(5);
    if(reportMarker) reportMap.removeLayer(reportMarker);
    reportMarker = L.marker([lat, lng]).addTo(reportMap);
    reportMap.setView([lat, lng], 14);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                let lat = pos.coords.latitude;
                let lng = pos.coords.longitude;
                
                // MOCK INTELIGENTE: Se a localização do navegador der muito longe de Maceió (comum no PC),
                // força uma coordenada dentro de Maceió para que a demonstração não quebre visualmente.
                const inMaceioLat = lat > -9.8 && lat < -9.4;
                const inMaceioLng = lng > -35.9 && lng < -35.5;
                
                if(!inMaceioLat || !inMaceioLng) {
                    alert("Sua localização real retornou fora de Maceió. Simulando coordenada central para fins de demonstração.");
                    lat = -9.665;
                    lng = -35.735;
                }
                setMapPin(lat, lng);
            },
            (err) => alert("Permissão negada ou erro. Clique no mapa manualmente."),
            { enableHighAccuracy: true }
        );
    }
}

function nextStep(step) {
    if(step === 2 && !document.getElementById('form-lat').value) return alert('Defina a localização no mapa.');
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}
function prevStep(step) {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
    setTimeout(() => reportMap.invalidateSize(), 100);
}

document.getElementById('wizard-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newDoc = {
        id: `PRT-2026-${Math.floor(Math.random() * 900) + 100}`,
        cat: document.getElementById('form-cat').value,
        desc: document.getElementById('form-desc').value,
        data: new Date().toLocaleDateString('pt-BR'),
        lat: parseFloat(document.getElementById('form-lat').value),
        lng: parseFloat(document.getElementById('form-lng').value),
        status: 'novo'
    };
    db.unshift(newDoc);
    localStorage.setItem('cimadec_db_v2', JSON.stringify(db));
    
    alert(`Protocolo gerado: ${newDoc.id}`);
    e.target.reset();
    if(reportMarker) reportMap.removeLayer(reportMarker);
    prevStep(1);
    navigate('meus-registros');
});

function renderCitizenList() {
    const container = document.getElementById('c-list-container');
    container.innerHTML = '';
    
    db.forEach(doc => {
        const cat = CATEGORIAS_MAP[doc.cat];
        const stat = STATUS_MAP[doc.status];
        
        container.innerHTML += `
            <div class="border border-gray-300 bg-white rounded p-5 flex flex-col justify-between">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="font-bold text-brand-dark text-sm">${cat.nome}</span>
                        <p class="text-xs font-mono text-gray-500 mt-0.5">${doc.id} • ${doc.data}</p>
                    </div>
                    <div class="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider ${stat.text}">
                        <span class="w-2 h-2 rounded-full ${stat.dot}"></span>
                        ${stat.label}
                    </div>
                </div>
                <p class="text-sm text-gray-700 leading-relaxed mb-4">${doc.desc}</p>
                <div class="text-[10px] text-gray-400 font-mono border-t pt-3">
                    Lat: ${doc.lat} / Lng: ${doc.lng}
                </div>
            </div>
        `;
    });
}

// --- 4. OPERADOR: GRÁFICOS E TRIAGEM ---
let chartInstance, overviewMap;

function renderOperatorDash() {
    document.getElementById('kpi-total').textContent = db.length;
    document.getElementById('kpi-pendentes').textContent = db.filter(o => o.status === 'novo').length;
    document.getElementById('kpi-criticos').textContent = db.filter(o => o.cat === 'enchente' || o.cat === 'deslizamento').length;

    // Gráfico Monocromático / Sóbrio
    const counts = { enchente:0, deslizamento:0, lixo:0, arvore:0 };
    db.forEach(o => { if(counts[o.cat] !== undefined) counts[o.cat]++; });
    
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if(chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Alagamento', 'Deslizamento', 'Resíduos', 'Árvore'],
            datasets: [{
                data: [counts.enchente, counts.deslizamento, counts.lixo, counts.arvore],
                backgroundColor: ['#0B3B60', '#374151', '#9CA3AF', '#D1D5DB'], // Cores neutras
                borderWidth: 0,
                borderRadius: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Mapa Overview
    setTimeout(() => {
        if(!overviewMap) {
            overviewMap = L.map('map-overview').setView([-9.62, -35.73], 11); // View mais ampla pra pegar B.Bentes
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(overviewMap);
        }
        overviewMap.eachLayer((layer) => { if (layer instanceof L.Marker) overviewMap.removeLayer(layer); });
        
        db.forEach(o => {
            L.marker([o.lat, o.lng]).addTo(overviewMap).bindPopup(`
                <div class="text-sm font-sans">
                    <b>${o.id}</b><br>
                    <span class="text-xs text-gray-600">${CATEGORIAS_MAP[o.cat].nome}</span>
                </div>
            `);
        });
        overviewMap.invalidateSize();
    }, 200);
}

function renderOperatorTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    db.forEach((doc, index) => {
        const cat = CATEGORIAS_MAP[doc.cat];
        const stat = STATUS_MAP[doc.status];
        
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <td class="p-4 font-mono text-xs font-bold text-gray-700">${doc.id}</td>
                <td class="p-4 text-xs text-gray-500">${doc.data}</td>
                <td class="p-4 flex items-center gap-2">
                    <i class="${cat.icon} text-gray-400 text-lg"></i>
                    <span class="text-sm text-gray-800">${cat.nome}</span>
                </td>
                <td class="p-4">
                    <select onchange="updateStatus(${index}, this.value)" class="text-xs border border-gray-300 rounded p-1.5 outline-none font-semibold text-gray-700 bg-white">
                        <option value="novo" ${doc.status === 'novo' ? 'selected' : ''}>Pendente</option>
                        <option value="em_analise" ${doc.status === 'em_analise' ? 'selected' : ''}>Em Análise</option>
                        <option value="resolvido" ${doc.status === 'resolvido' ? 'selected' : ''}>Resolvido</option>
                    </select>
                </td>
                <td class="p-4 text-xs text-gray-400 font-mono">${doc.lat}<br>${doc.lng}</td>
            </tr>
        `;
    });
}

function updateStatus(index, newStatus) {
    db[index].status = newStatus;
    localStorage.setItem('cimadec_db_v2', JSON.stringify(db));
}