/**
 * CIMADEC - Core App Logic
 */

const CATEGORIAS_MAP = {
    'enchente': { nome: 'Alagamento', icon: 'ph-waves', color: '#0B3B60' }, 
    'deslizamento': { nome: 'Deslizamento', icon: 'ph-mountains', color: '#9B1B30' }, 
    'lixo': { nome: 'Resíduos Irregulares', icon: 'ph-trash', color: '#6B7280' }, 
    'arvore': { nome: 'Queda de Árvore', icon: 'ph-tree', color: '#4B5563' }
};

const STATUS_MAP = {
    'novo': { label: 'Pendente', dot: 'bg-brand-red', text: 'text-brand-dark' },
    'em_analise': { label: 'Em Análise', dot: 'bg-blue-500', text: 'text-brand-dark' },
    'resolvido': { label: 'Resolvido', dot: 'bg-gray-400', text: 'text-gray-500' }
};

const initialMock = [
    { id: 'PRT-901', cat: 'enchente', desc: 'Rua alagada impedindo tráfego.', data: '31/05/2026', lat: -9.664448, lng: -35.735075, addr: 'Rua do Comércio, Centro, Maceió', status: 'novo' },
    { id: 'PRT-902', cat: 'deslizamento', desc: 'Rachadura próximo à encosta.', data: '30/05/2026', lat: -9.638682, lng: -35.732646, addr: 'Avenida Fernandes Lima, Farol, Maceió', status: 'em_analise' },
    { id: 'PRT-903', cat: 'lixo', desc: 'Metralha bloqueando calçada.', data: '30/05/2026', lat: -9.673238, lng: -35.753820, addr: 'Avenida Siqueira Campos, Trapiche da Barra, Maceió', status: 'resolvido' },
    { id: 'PRT-904', cat: 'enchente', desc: 'Transbordamento de canal.', data: '29/05/2026', lat: -9.546300, lng: -35.729500, addr: 'Avenida Benedito Bentes, Benedito Bentes, Maceió', status: 'novo' }
];

let db = JSON.parse(localStorage.getItem('cimadec_db_v13')) || initialMock;
let autoAlertsLog = []; // Salva os alertas da sessão para a tela "Alertas Locais"

const menus = {
    cidadao: [
        { id: 'c-dashboard', icon: 'ph-map-trifold', label: 'Painel da Comunidade' },
        { id: 'c-reportar', icon: 'ph-plus-circle', label: 'Novo Registro' },
        { id: 'c-historico', icon: 'ph-folder-simple', label: 'Meu Histórico' },
        { id: 'c-alertas', icon: 'ph-warning', label: 'Alertas Locais', mock: false } // Tirado de Mock!
    ],
    operador: [
        { id: 'o-dashboard', icon: 'ph-chart-bar', label: 'Painel Analítico' },
        { id: 'o-mapa', icon: 'ph-globe-hemisphere-west', label: 'Mapa Operacional' },
        { id: 'o-triagem', icon: 'ph-kanban', label: 'Fila de Triagem' },
        { id: 'o-relatorios', icon: 'ph-file-pdf', label: 'Exportar Relatórios', mock: true }
    ]
};

let currentUserRole = null;
let currentCitizenLocation = { lat: -9.665, lng: -35.735 };

function loginAs(role) {
    currentUserRole = role;
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('app-wrapper').classList.remove('hidden');

    const navContainer = document.getElementById('main-nav');
    navContainer.innerHTML = `<p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3 mt-2">Navegação</p>`;
    
    menus[role].forEach(item => {
        navContainer.innerHTML += `
            <button id="menu-${item.id}" onclick="navigate('${item.id}', ${item.mock})" class="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                <i class="ph ${item.icon} text-lg"></i> ${item.label}
            </button>`;
    });

    if (role === 'cidadao') {
        document.getElementById('user-avatar').textContent = 'C';
        document.getElementById('user-name').textContent = 'Cidadão';
        document.getElementById('user-role').textContent = 'Acesso Público';
        navigate('c-dashboard');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                currentCitizenLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                calculateSurroundings();
            });
        }
    } else {
        document.getElementById('user-avatar').textContent = 'O';
        document.getElementById('user-name').textContent = 'Matrícula 8092';
        document.getElementById('user-role').textContent = 'Centro de Operações';
        navigate('o-dashboard');
    }
}

function logout() { window.location.reload(); }

function navigate(viewName, isMock = false) {
    document.querySelectorAll('main > div > div.flex, main > div > div.flex-col, main > div > div.max-w-3xl').forEach(div => div.classList.add('hidden'));
    
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

async function fetchAddress(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&_t=${Date.now()}`);
        const data = await res.json();
        if (!data || !data.address) return "Logradouro não mapeado.";

        const a = data.address;
        const logradouro = a.road || a.pedestrian || a.path || a.footway || a.square || "";
        const numero = a.house_number || "";
        const bairro = a.suburb || a.neighbourhood || a.village || a.city_district || "";
        const cidade = a.city || a.town || a.municipality || "Maceió";

        let enderecoCompleto = "";
        if (logradouro) enderecoCompleto += numero ? `${logradouro}, ${numero}` : logradouro;
        if (bairro) enderecoCompleto += enderecoCompleto ? ` - ${bairro}` : bairro;
        if (cidade) enderecoCompleto += enderecoCompleto ? ` - ${cidade}` : cidade;

        return enderecoCompleto || "Coordenada sem endereço oficial associado";
    } catch (error) { return "Erro na busca via satélite."; }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
}

function calculateSurroundings() {
    let countInRadius = 0;
    const raioBuscaKm = 3; 

    db.forEach(doc => {
        if(doc.status !== 'resolvido') {
            const dist = getDistanceFromLatLonInKm(currentCitizenLocation.lat, currentCitizenLocation.lng, doc.lat, doc.lng);
            if(dist <= raioBuscaKm) countInRadius++;
        }
    });

    const banner = document.getElementById('c-entorno-banner');
    const msg = document.getElementById('c-entorno-msg');
    
    if(!banner || !msg) return;

    if(countInRadius > 0) {
        banner.className = "bg-brand-red text-white p-5 rounded shadow-sm flex items-center gap-4";
        banner.querySelector('div').className = "p-3 bg-red-900 rounded-full";
        banner.querySelector('h4').textContent = "Alerta de Entorno";
        msg.textContent = `Atenção: O sistema identificou ${countInRadius} ocorrência(s) de risco não-resolvidas em um raio de ${raioBuscaKm}km da sua localização atual.`;
        msg.className = "text-xs text-red-200 mt-1";
    } else {
        banner.className = "bg-green-600 text-white p-5 rounded shadow-sm flex items-center gap-4";
        banner.querySelector('div').className = "p-3 bg-green-800 rounded-full";
        banner.querySelector('h4').textContent = "Entorno Seguro";
        msg.textContent = `A princípio, não existem ocorrências graves registradas próximas a você no momento.`;
        msg.className = "text-xs text-green-200 mt-1";
    }
}

// --- FLUXOS CIDADÃO ---
let reportMap, reportMarker, reportCircle, cDashMap;

function initReportMap() {
    if(reportMap) { reportMap.invalidateSize(); return; }
    reportMap = L.map('map-report').setView([-9.665, -35.735], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(reportMap);
    reportMap.on('click', async (e) => setMapPin(e.latlng.lat, e.latlng.lng));
}

async function setMapPin(lat, lng) {
    document.getElementById('form-lat').value = lat.toFixed(5);
    document.getElementById('form-lng').value = lng.toFixed(5);
    document.getElementById('address-display').innerHTML = "<span class='text-gray-500'>Sincronizando...</span>";
    
    if(reportMarker) reportMap.removeLayer(reportMarker);
    if(reportCircle) reportMap.removeLayer(reportCircle);
    
    reportCircle = L.circle([lat, lng], { radius: 150, color: '#9B1B30', fillColor: '#9B1B30', fillOpacity: 0.2, weight: 1 }).addTo(reportMap);
    reportMarker = L.marker([lat, lng], { draggable: true }).addTo(reportMap);
    reportMap.setView([lat, lng], 16); 

    reportMarker.on('drag', function(event) {
        reportCircle.setLatLng(event.target.getLatLng());
    });

    reportMarker.on('dragend', async function(event) {
        const position = event.target.getLatLng();
        document.getElementById('form-lat').value = position.lat.toFixed(5);
        document.getElementById('form-lng').value = position.lng.toFixed(5);
        document.getElementById('address-display').innerHTML = "<span class='text-gray-500'>Recalculando logradouro...</span>";
        
        const address = await fetchAddress(position.lat, position.lng);
        document.getElementById('address-display').textContent = address;
        document.getElementById('form-address').value = address;
    });

    const address = await fetchAddress(lat, lng);
    document.getElementById('address-display').textContent = address;
    document.getElementById('form-address').value = address;
}

function getLocation() {
    if (navigator.geolocation) {
        const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        document.getElementById('address-display').innerHTML = "<span class='text-gray-500'>Buscando sinal preciso...</span>";

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                let lat = pos.coords.latitude;
                let lng = pos.coords.longitude;
                const inMaceioLat = lat > -9.8 && lat < -9.4;
                const inMaceioLng = lng > -35.9 && lng < -35.5;
                if(!inMaceioLat || !inMaceioLng) {
                    alert("Localização imprecisa. O pino será posicionado no centro. Arraste-o para o local.");
                    lat = -9.664448; lng = -35.735075;
                }
                setMapPin(lat, lng);
            },
            (err) => {
                alert("Sinal GPS indisponível. Clique diretamente no mapa.");
                document.getElementById('address-display').textContent = "Defina o local no mapa.";
            },
            geoOptions
        );
    }
}

function nextStep(step) {
    if(step === 2 && !document.getElementById('form-lat').value) return alert('Selecione o local no mapa.');
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
        id: `PRT-${Math.floor(Math.random() * 900) + 100}`,
        cat: document.getElementById('form-cat').value,
        desc: document.getElementById('form-desc').value,
        data: new Date().toLocaleDateString('pt-BR'),
        lat: parseFloat(document.getElementById('form-lat').value),
        lng: parseFloat(document.getElementById('form-lng').value),
        addr: document.getElementById('form-address').value,
        status: 'novo'
    };
    db.unshift(newDoc);
    localStorage.setItem('cimadec_db_v13', JSON.stringify(db));
    alert(`Protocolo submetido: ${newDoc.id}`);
    
    e.target.reset();
    document.getElementById('address-display').textContent = "Nenhum local selecionado.";
    if(reportMarker) reportMap.removeLayer(reportMarker);
    if(reportCircle) reportMap.removeLayer(reportCircle);
    prevStep(1);
    navigate('c-historico');
});

function renderCitizenDashboard() {
    calculateSurroundings(); 
    
    setTimeout(() => {
        if(!cDashMap) {
            cDashMap = L.map('c-main-map').setView([-9.64, -35.72], 12);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(cDashMap);
        }
        cDashMap.invalidateSize();
        cDashMap.eachLayer((l) => { if (l instanceof L.Marker || l instanceof L.Circle) cDashMap.removeLayer(l); });
        
        const feedContainer = document.getElementById('c-feed-list');
        feedContainer.innerHTML = '';

        db.forEach(doc => {
            const cat = CATEGORIAS_MAP[doc.cat];
            L.circle([doc.lat, doc.lng], { radius: 150, color: '#9B1B30', fillColor: '#9B1B30', fillOpacity: 0.2, weight: 1 }).addTo(cDashMap);
            L.marker([doc.lat, doc.lng]).addTo(cDashMap).bindPopup(`<b>${cat.nome}</b><br><span class="text-xs">${doc.addr}</span>`);
            
            feedContainer.innerHTML += `
                <div class="border border-gray-200 bg-white rounded p-3 cursor-pointer hover:border-brand-blue hover:shadow-sm transition-all" onclick="focusMap(${doc.lat}, ${doc.lng})">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="${cat.icon} text-gray-500"></i>
                        <span class="font-bold text-xs text-brand-dark">${cat.nome}</span>
                        <span class="ml-auto text-[10px] text-gray-400 font-mono">${doc.data}</span>
                    </div>
                    <p class="text-xs text-gray-600 line-clamp-1 mb-1" title="${doc.addr}">${doc.addr}</p>
                    <div class="text-[10px] font-mono font-bold uppercase tracking-wider ${STATUS_MAP[doc.status].text}">
                        ${STATUS_MAP[doc.status].label}
                    </div>
                </div>
            `;
        });
    }, 100);
}

window.focusMap = function(lat, lng) {
    if(cDashMap) {
        cDashMap.flyTo([lat, lng], 16, { duration: 1 });
        cDashMap.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                const pos = layer.getLatLng();
                if(pos.lat === lat && pos.lng === lng) layer.openPopup();
            }
        });
    }
}

function renderCitizenHistory() {
    const tbody = document.getElementById('c-historico-table');
    tbody.innerHTML = '';
    
    db.forEach(doc => {
        const cat = CATEGORIAS_MAP[doc.cat];
        const stat = STATUS_MAP[doc.status];
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 font-mono text-xs font-bold text-gray-700">${doc.id}</td>
                <td class="p-4 text-xs text-gray-500">${doc.data}</td>
                <td class="p-4 text-xs font-semibold text-gray-800">${cat.nome}</td>
                <td class="p-4 text-xs text-gray-600 truncate max-w-[200px]" title="${doc.addr}">${doc.addr}</td>
                <td class="p-4"><div class="flex items-center gap-1.5 text-[10px] font-bold uppercase ${stat.text}"><span class="w-1.5 h-1.5 rounded-full ${stat.dot}"></span>${stat.label}</div></td>
                <td class="p-4 text-right">
                    <button onclick="openEditModal('${doc.id}')" class="text-brand-blue hover:underline text-xs font-semibold mr-3">Editar</button>
                    <button onclick="deleteRecord('${doc.id}')" class="text-brand-red hover:underline text-xs font-semibold">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// Renderiza aba de Alertas (Cidadão)
function renderCitizenAlertas() {
    const container = document.getElementById('c-alertas-lista');
    if(!container) return;
    
    if(autoAlertsLog.length === 0) {
        container.innerHTML = `<div class="p-8 text-center bg-white border border-gray-200 rounded text-gray-400 text-sm">Nenhum alerta autônomo registrado na sua região hoje.</div>`;
    } else {
        container.innerHTML = '';
        autoAlertsLog.forEach(alerta => {
            container.innerHTML += `
                <div class="border border-red-200 bg-red-50 p-4 rounded shadow-sm">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="ph-fill ph-siren text-red-600 text-lg"></i>
                        <h4 class="font-bold text-red-800 text-sm">Disparo de Sensor IoT</h4>
                        <span class="ml-auto text-[10px] font-mono text-red-500">${alerta.hora}</span>
                    </div>
                    <p class="text-sm text-red-700 font-medium">${alerta.msg}</p>
                </div>
            `;
        });
    }
}

window.openEditModal = function(id) {
    const doc = db.find(d => d.id === id);
    if(doc.status !== 'novo') return alert('Apenas registros pendentes podem ser editados.');
    document.getElementById('edit-id').value = doc.id;
    document.getElementById('edit-cat').value = doc.cat;
    document.getElementById('edit-desc').value = doc.desc;
    document.getElementById('edit-modal').classList.remove('hidden');
}

window.closeEditModal = function() { document.getElementById('edit-modal').classList.add('hidden'); }

document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const docIndex = db.findIndex(d => d.id === id);
    db[docIndex].cat = document.getElementById('edit-cat').value;
    db[docIndex].desc = document.getElementById('edit-desc').value;
    localStorage.setItem('cimadec_db_v13', JSON.stringify(db));
    closeEditModal();
    renderCitizenHistory();
});

window.deleteRecord = function(id) {
    if(confirm(`Cancelar protocolo ${id}?`)) {
        db = db.filter(d => d.id !== id);
        localStorage.setItem('cimadec_db_v13', JSON.stringify(db));
        renderCitizenHistory();
    }
}

// --- FLUXOS DO OPERADOR E AUTOMAÇÃO IOT ---
let chartInstance, oMap, rainLayer, iotInterval;

function renderOperatorDash() {
    document.getElementById('kpi-total').textContent = db.length;
    document.getElementById('kpi-pendentes').textContent = db.filter(o => o.status === 'novo').length;
    document.getElementById('kpi-criticos').textContent = db.filter(o => o.cat === 'enchente' || o.cat === 'deslizamento').length;
    document.getElementById('kpi-resolvidos').textContent = db.filter(o => o.status === 'resolvido').length;

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
                backgroundColor: ['#0B3B60', '#374151', '#9CA3AF', '#D1D5DB'],
                borderWidth: 0, borderRadius: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function renderOperatorMap() {
    setTimeout(() => {
        if(!oMap) {
            oMap = L.map('o-main-map').setView([-9.64, -35.73], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(oMap);
        }
        oMap.invalidateSize();
        oMap.eachLayer((l) => { if (l instanceof L.Marker || l instanceof L.Circle) oMap.removeLayer(l); });
        
        db.forEach(o => {
            const cat = CATEGORIAS_MAP[o.cat];
            L.circle([o.lat, o.lng], { radius: 150, color: '#9B1B30', fillColor: '#9B1B30', fillOpacity: 0.2, weight: 1 }).addTo(oMap);
            L.marker([o.lat, o.lng]).addTo(oMap).bindPopup(`<b>${o.id}</b><br><span class="text-xs">${cat.nome}</span>`);
        });

        const isRadarOn = document.getElementById('toggle-radar') && document.getElementById('toggle-radar').checked;
        if(isRadarOn) window.toggleRadar(true);
    }, 100);
}

function renderOperatorTable() {
    const tbody = document.getElementById('table-triagem');
    tbody.innerHTML = '';
    
    db.forEach((doc, index) => {
        const cat = CATEGORIAS_MAP[doc.cat];
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <td class="p-4 font-mono text-xs font-bold text-brand-dark">${doc.id}</td>
                <td class="p-4 text-xs text-gray-500">${doc.data}</td>
                <td class="p-4 text-xs text-gray-600 truncate max-w-[250px]">${doc.addr}</td>
                <td class="p-4 text-xs font-semibold text-gray-800">${cat.nome}</td>
                <td class="p-4">
                    <select onchange="updateStatus(${index}, this.value)" class="text-xs border border-gray-300 rounded p-1.5 bg-white text-gray-700 outline-none cursor-pointer">
                        <option value="novo" ${doc.status === 'novo' ? 'selected' : ''}>Pendente / Novo</option>
                        <option value="em_analise" ${doc.status === 'em_analise' ? 'selected' : ''}>Em Análise / Triagem</option>
                        <option value="resolvido" ${doc.status === 'resolvido' ? 'selected' : ''}>Resolvido / Arquivado</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

window.updateStatus = function(index, newStatus) {
    db[index].status = newStatus;
    localStorage.setItem('cimadec_db_v13', JSON.stringify(db));
    if(currentUserRole === 'operador' && document.getElementById('view-o-dashboard').classList.contains('flex')) renderOperatorDash();
}

window.toggleRadar = async function(isOn) {
    if(!oMap) return;
    if(rainLayer) oMap.removeLayer(rainLayer);
    if(isOn) {
        try {
            const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            const data = await res.json();
            const latestFrame = data.radar.past[data.radar.past.length - 1].path;
            rainLayer = L.tileLayer(`https://tilecache.rainviewer.com${latestFrame}/256/{z}/{x}/{y}/2/1_1.png`, { opacity: 0.6, zIndex: 20 }).addTo(oMap);
        } catch (e) {
            alert("Radar indisponível.");
            document.getElementById('toggle-radar').checked = false;
        }
    }
}

// SIMULAÇÃO GLOBAL DE SENSORES
let sensor1Level = 45; 
let sensor2Level = 12; 

function startIoTSimulation() {
    if(iotInterval) clearInterval(iotInterval);
    
    iotInterval = setInterval(() => {
        sensor1Level += Math.floor(Math.random() * 15) - 3; 
        sensor2Level += Math.floor(Math.random() * 10) - 2; 
        
        if(sensor1Level < 10) sensor1Level = 10;
        if(sensor2Level < 0) sensor2Level = 0;

        updateSensorUI('c-iot-bar-1', 'c-iot-val-1', sensor1Level, true);
        updateSensorUI('c-iot-bar-2', 'c-iot-val-2', sensor2Level, false);
        updateSensorUI('o-iot-bar-1', 'o-iot-val-1', sensor1Level, true);
        updateSensorUI('o-iot-bar-2', 'o-iot-val-2', sensor2Level, false);

        if(sensor1Level > 95) {
            sensor1Level = 30; 
            const msgAlerta = 'ALERTA AUTOMÁTICO: Sensor registrou nível hídrico acima da cota de segurança.';
            
            const autoDoc = {
                id: `IOT-ANA-${Math.floor(Math.random() * 900) + 100}`,
                cat: 'enchente',
                desc: msgAlerta,
                data: new Date().toLocaleDateString('pt-BR'),
                lat: -9.6580, lng: -35.7280, 
                addr: 'Via Expressa, Riacho Salgadinho (Sensor IoT)',
                status: 'novo'
            };
            
            db.unshift(autoDoc);
            localStorage.setItem('cimadec_db_v13', JSON.stringify(db));
            
            // Grava no log de alertas do Cidadão
            autoAlertsLog.unshift({ hora: new Date().toLocaleTimeString('pt-BR'), msg: msgAlerta });

            const banner = document.getElementById('global-alert-banner');
            const msg = document.getElementById('global-alert-msg');
            if(banner && msg) {
                msg.textContent = autoDoc.desc;
                banner.classList.remove('hidden');
            }

            if(currentUserRole === 'operador') {
                const log = document.getElementById('iot-log');
                if(log) { log.innerHTML += `<span class="text-red-400">> [ALERTA] Risco Inundação</span>`; log.scrollTop = log.scrollHeight; }
                if(!document.getElementById('view-o-dashboard').classList.contains('hidden')) renderOperatorDash();
            } else if (currentUserRole === 'cidadao') {
                if(!document.getElementById('view-c-dashboard').classList.contains('hidden')) renderCitizenDashboard();
                if(!document.getElementById('view-c-alertas').classList.contains('hidden')) renderCitizenAlertas();
            }
        }
    }, 4000); 
}

function updateSensorUI(barId, valId, value, isPercentage) {
    const bar = document.getElementById(barId);
    const val = document.getElementById(valId);
    if(bar && val) {
        bar.style.width = `${value > 100 ? 100 : value}%`;
        val.textContent = isPercentage ? `${value}%` : `${value}mm/h`;
        
        let colorClass = "bg-green-400";
        let textClass = "text-green-400";
        if(isPercentage) {
            if(value > 85) { colorClass = "bg-red-500 animate-pulse"; textClass = "text-red-500 animate-pulse"; }
            else if(value > 60) { colorClass = "bg-yellow-400"; textClass = "text-yellow-400"; }
            else { colorClass = "bg-blue-400"; textClass = "text-blue-400"; }
        } else {
            if(value > 50) { colorClass = "bg-red-500 animate-pulse"; textClass = "text-red-500 animate-pulse"; }
        }
        bar.className = `${colorClass} h-1.5 md:h-2 rounded-full transition-all duration-1000`;
        val.className = `font-mono font-bold ${textClass}`;
    }
}

startIoTSimulation();