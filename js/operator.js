let chartInstance = null;

async function renderOperatorDash() {
    try {
        await carregarOcorrencias();
    } catch (e) {
        showToast(e.message || 'Não foi possível carregar os dados.', 'error');
        return;
    }

    document.getElementById('kpi-total').textContent = ocorrencias.length;
    document.getElementById('kpi-pendentes').textContent = ocorrencias.filter(o => o.status === 'novo').length;
    document.getElementById('kpi-criticos').textContent = ocorrencias.filter(o => o.status === 'critico').length;
    document.getElementById('kpi-resolvidos').textContent = ocorrencias.filter(o => o.status === 'resolvido').length;

    const tentarDesenharGrafico = () => {
        const chartCanvas = document.getElementById('categoryChart');
        if (!chartCanvas) return;

        if (chartCanvas.offsetParent === null || chartCanvas.parentElement.clientHeight === 0) {
            requestAnimationFrame(tentarDesenharGrafico);
            return;
        }

        const ctx = chartCanvas.getContext('2d');
        const counts = { enchente: 0, deslizamento: 0, lixo: 0, arvore: 0, infraestrutura: 0, outro: 0 };
        ocorrencias.forEach(o => { if (counts[o.cat] !== undefined) counts[o.cat]++; });

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Alagamento', 'Deslizamento', 'Resíduos', 'Árvore', 'Infraestrutura', 'Outro'],
                datasets: [{
                    data: [counts.enchente, counts.deslizamento, counts.lixo, counts.arvore, counts.infraestrutura, counts.outro],
                    backgroundColor: ['#0B3B60', '#374151', '#9CA3AF', '#4B5563', '#B45309', '#D1D5DB'],
                    borderWidth: 0, borderRadius: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    };

    tentarDesenharGrafico();
}

async function renderOperatorMap() {
    try {
        await carregarOcorrencias();
    } catch (e) {
        showToast(e.message || 'Não foi possível carregar o mapa.', 'error');
    }

    setTimeout(() => {
        if (!oMap) {
            oMap = L.map('o-main-map').setView([-9.64, -35.73], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(oMap);
        }
        oMap.invalidateSize();
        oMap.eachLayer((l) => { if (l instanceof L.Marker || l instanceof L.Circle) oMap.removeLayer(l); });

        ocorrencias.forEach(o => {
            const cat = CATEGORIAS_MAP[o.cat];
            L.circle([o.lat, o.lng], { radius: 150, color: '#9B1B30', fillColor: '#9B1B30', fillOpacity: 0.2, weight: 1 }).addTo(oMap);
            L.marker([o.lat, o.lng]).addTo(oMap).bindPopup(`<b>${escapeHtml(o.id.slice(0, 8))}</b><br><span class="text-xs">${escapeHtml(cat.nome)}</span>`);
        });

        const isRadarOn = document.getElementById('toggle-radar') && document.getElementById('toggle-radar').checked;
        if (isRadarOn) window.toggleRadar(true);
    }, 100);
}

async function renderOperatorTable() {
    const tbody = document.getElementById('table-triagem');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-gray-400 text-sm">Carregando...</td></tr>';
    try {
        await carregarOcorrencias();
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-red-500 text-sm">Não foi possível carregar a fila.</td></tr>';
        showToast(e.message || 'Erro ao carregar a fila de triagem.', 'error');
        return;
    }

    tbody.innerHTML = '';
    if (!ocorrencias.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-gray-400 text-sm">Nenhuma ocorrência na fila.</td></tr>';
        return;
    }

    const template = document.getElementById('triagem-row-template');

    ocorrencias.forEach(doc => {
        const cat = CATEGORIAS_MAP[doc.cat];
        const clone = template.content.cloneNode(true);

        clone.querySelector('.row-id').textContent = doc.id.slice(0, 8);
        clone.querySelector('.row-date').textContent = doc.data;
        clone.querySelector('.row-addr').textContent = doc.addr;
        clone.querySelector('.row-cat').textContent = cat.nome;

        const select = clone.querySelector('.row-select');
        select.value = doc.status;
        select.onchange = (e) => updateStatus(doc.id, e.target.value);

        tbody.appendChild(clone);
    });
}

window.updateStatus = async function(id, newStatus) {
    try {
        await atualizarOcorrencia(id, { status: newStatus });
        showToast('Status atualizado.', 'success');
    } catch (e) {
        showToast(e.message || 'Não foi possível atualizar o status.', 'error');
        renderOperatorTable();
        return;
    }
    if (document.getElementById('view-o-dashboard').classList.contains('flex')) renderOperatorDash();
}

// Escapa um valor para uma célula CSV (aspas duplas quando há vírgula/aspas/quebra).
function csvCell(value) {
    const s = String(value ?? '');
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// Exporta as ocorrências carregadas como CSV (download client-side).
window.exportarRelatorioCSV = function() {
    if (!ocorrencias.length) {
        showToast('Não há ocorrências para exportar.', 'warning');
        return;
    }

    const headers = ['Protocolo', 'Categoria', 'Status', 'Data', 'Endereço', 'Latitude', 'Longitude', 'Descrição'];
    const linhas = ocorrencias.map(o => [
        o.id,
        CATEGORIAS_MAP[o.cat]?.nome || o.cat,
        STATUS_MAP[o.status]?.label || o.status,
        o.data,
        o.addr,
        o.lat,
        o.lng,
        o.desc
    ]);

    const csv = [headers, ...linhas].map(row => row.map(csvCell).join(',')).join('\r\n');
    // '﻿' (BOM) faz o Excel reconhecer os acentos em UTF-8.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `cimadec-ocorrencias-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showToast(`Relatório exportado (${ocorrencias.length} ocorrência(s)).`, 'success');
};
