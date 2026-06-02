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
        banner.className = "bg-brand-red text-white p-5 rounded shadow-sm flex items-center gap-4 border border-red-800";
        banner.querySelector('div').className = "p-3 bg-red-900 rounded-full";
        banner.querySelector('h4').textContent = "Alerta de Entorno";
        msg.textContent = `Atenção: O sistema identificou ${countInRadius} ocorrência(s) de risco não-resolvidas em um raio de ${raioBuscaKm}km da sua localização atual.`;
    } else {
        banner.className = "bg-green-600 text-white p-5 rounded shadow-sm flex items-center gap-4 border border-green-800";
        banner.querySelector('div').className = "p-3 bg-green-800 rounded-full";
        banner.querySelector('h4').textContent = "Entorno Seguro";
        msg.textContent = `A princípio, não existem ocorrências graves registradas próximas a você no momento.`;
    }
}

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
        if (!feedContainer) return;
        feedContainer.innerHTML = '';
        
        const template = document.getElementById('feed-item-template');

        db.forEach(doc => {
            const cat = CATEGORIAS_MAP[doc.cat];
            L.circle([doc.lat, doc.lng], { radius: 150, color: '#9B1B30', fillColor: '#9B1B30', fillOpacity: 0.2, weight: 1 }).addTo(cDashMap);
            L.marker([doc.lat, doc.lng]).addTo(cDashMap).bindPopup(`<b>${cat.nome}</b><br><span class="text-xs">${doc.addr}</span>`);
            
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('div');
            
            card.onclick = () => focusMap(doc.lat, doc.lng);
            clone.querySelector('i').className = `${cat.icon} text-gray-500`;
            clone.querySelector('.item-cat-name').textContent = cat.nome;
            clone.querySelector('.item-date').textContent = doc.data;
            
            const addrParam = clone.querySelector('.item-addr');
            addrParam.textContent = doc.addr;
            addrParam.title = doc.addr;
            
            const statusDiv = clone.querySelector('.item-status');
            statusDiv.className = `text-[10px] font-mono font-bold uppercase tracking-wider ${STATUS_MAP[doc.status].text}`;
            statusDiv.textContent = STATUS_MAP[doc.status].label;

            feedContainer.appendChild(clone);
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
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const template = document.getElementById('history-row-template');
    
    db.forEach(doc => {
        const cat = CATEGORIAS_MAP[doc.cat];
        const stat = STATUS_MAP[doc.status];
        
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.row-id').textContent = doc.id;
        clone.querySelector('.row-date').textContent = doc.data;
        clone.querySelector('.row-cat').textContent = cat.nome;
        
        const addrCell = clone.querySelector('.row-addr');
        addrCell.textContent = doc.addr;
        addrCell.title = doc.addr;
        
        const containerStatus = clone.querySelector('.row-status-container');
        containerStatus.className = `flex items-center gap-1.5 text-[10px] font-bold uppercase ${stat.text}`;
        containerStatus.querySelector('.row-status-dot').className = `w-1.5 h-1.5 rounded-full ${stat.dot}`;
        clone.querySelector('.row-status-label').textContent = stat.label;
        
        clone.querySelector('.btn-edit').onclick = () => openEditModal(doc.id);
        clone.querySelector('.btn-delete').onclick = () => deleteRecord(doc.id);

        tbody.appendChild(clone);
    });
}

function renderCitizenAlertas() {
    const container = document.getElementById('c-alertas-lista');
    if(!container) return;
    container.innerHTML = '';
    
    if(autoAlertsLog.length === 0) {
        container.innerHTML = `<div class="p-8 text-center bg-white border border-gray-200 rounded text-gray-400 text-sm">Nenhum alerta autônomo registrado na sua região hoje.</div>`;
        return;
    }
    
    const template = document.getElementById('alert-card-template');
    autoAlertsLog.forEach(alerta => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.alert-time').textContent = alerta.hora;
        clone.querySelector('.alert-msg').textContent = alerta.msg;
        container.appendChild(clone);
    });
}