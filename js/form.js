function nextStep(step) {
    if(step === 2 && !document.getElementById('form-lat').value) {
        showToast('Selecione o local no mapa antes de prosseguir.', 'warning');
        return;
    }
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}

function prevStep(step) {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
    setTimeout(() => reportMap.invalidateSize(), 100);
}

window.openEditModal = function(id) {
    const doc = ocorrencias.find(d => d.id === id);
    if(!doc) return;
    if(doc.status !== 'novo') {
        showToast('Apenas registros pendentes podem ser editados.', 'warning');
        return;
    }
    document.getElementById('edit-id').value = doc.id;
    document.getElementById('edit-cat').value = doc.cat;
    document.getElementById('edit-desc').value = doc.desc;
    document.getElementById('edit-modal').classList.remove('hidden');
}

window.closeEditModal = function() { document.getElementById('edit-modal').classList.add('hidden'); }

window.deleteRecord = function(id) {
    showConfirm(`Deseja cancelar o protocolo ${id.slice(0, 8)}? Esta ação não pode ser desfeita.`, async () => {
        try {
            await removerOcorrencia(id);
            showToast('Protocolo cancelado.', 'info');
            renderCitizenHistory();
        } catch (e) {
            showToast(e.message || 'Não foi possível cancelar o protocolo.', 'error');
        }
    }, { confirmLabel: 'Cancelar protocolo', cancelLabel: 'Voltar' });
}

function initForms() {
    const wizardForm = document.getElementById('wizard-form');
    if (wizardForm) {
        wizardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = wizardForm.querySelector('button[type=submit]');
            btn.disabled = true;
            try {
                await criarOcorrencia({
                    cat: document.getElementById('form-cat').value,
                    desc: document.getElementById('form-desc').value,
                    addr: document.getElementById('form-address').value,
                    lat: parseFloat(document.getElementById('form-lat').value),
                    lng: parseFloat(document.getElementById('form-lng').value)
                });
            } catch (err) {
                showToast(err.message || 'Não foi possível registrar a ocorrência.', 'error');
                btn.disabled = false;
                return;
            }
            btn.disabled = false;
            showToast('Ocorrência registrada com sucesso!', 'success');

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
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = editForm.querySelector('button[type=submit]');
            btn.disabled = true;
            try {
                await atualizarOcorrencia(document.getElementById('edit-id').value, {
                    cat: document.getElementById('edit-cat').value,
                    desc: document.getElementById('edit-desc').value
                });
            } catch (err) {
                showToast(err.message || 'Não foi possível salvar as alterações.', 'error');
                btn.disabled = false;
                return;
            }
            btn.disabled = false;
            closeEditModal();
            renderCitizenHistory();
            showToast('Registro atualizado.', 'success');
        });
    }
}
