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

window.openEditModal = function(id) {
    const doc = db.find(d => d.id === id);
    if(doc.status !== 'novo') return alert('Apenas registros pendentes podem ser editados.');
    document.getElementById('edit-id').value = doc.id;
    document.getElementById('edit-cat').value = doc.cat;
    document.getElementById('edit-desc').value = doc.desc;
    document.getElementById('edit-modal').classList.remove('hidden');
}

window.closeEditModal = function() { document.getElementById('edit-modal').classList.add('hidden'); }

window.deleteRecord = function(id) {
    if(confirm(`Cancelar protocolo ${id}?`)) {
        db = db.filter(d => d.id !== id);
        saveDb();
        renderCitizenHistory();
    }
}

function initForms() {
    const wizardForm = document.getElementById('wizard-form');
    if (wizardForm) {
        wizardForm.addEventListener('submit', (e) => {
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
            saveDb();
            alert(`Protocolo submetido: ${newDoc.id}`);
            
            e.target.reset();
            document.getElementById('address-display').textContent = "Nenhum local selecionado.";
            if(reportMarker) reportMap.removeLayer(reportMarker);
            if(reportCircle) reportMap.removeLayer(reportCircle);
            prevStep(1);
            navigate('c-historico');
        });
    }

    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const docIndex = db.findIndex(d => d.id === id);
            db[docIndex].cat = document.getElementById('edit-cat').value;
            db[docIndex].desc = document.getElementById('edit-desc').value;
            saveDb();
            closeEditModal();
            renderCitizenHistory();
        });
    }
}