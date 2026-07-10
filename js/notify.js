// Feedback visual da aplicação: toasts e diálogo de confirmação.
// Substitui os alert()/confirm() nativos por uma UI consistente com o resto do sistema.

function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end';
        document.body.appendChild(container);
    }
    return container;
}

// Mostra um toast. type: 'success' | 'error' | 'warning' | 'info'
function showToast(message, type = 'info', duration = 3500) {
    const styles = {
        success: { bg: 'bg-green-600', icon: 'ph-check-circle' },
        error:   { bg: 'bg-brand-red', icon: 'ph-warning-octagon' },
        warning: { bg: 'bg-yellow-500', icon: 'ph-warning' },
        info:    { bg: 'bg-brand-dark', icon: 'ph-info' }
    };
    const style = styles[type] || styles.info;

    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.className = `${style.bg} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 text-sm font-medium max-w-sm translate-x-4 opacity-0 transition-all duration-300`;
    toast.innerHTML = `<i class="ph-fill ${style.icon} text-lg shrink-0"></i><span></span>`;
    // textContent evita XSS caso a mensagem venha de dados do usuário/API.
    toast.querySelector('span').textContent = message;

    getToastContainer().appendChild(toast);
    // força reflow antes de animar a entrada
    requestAnimationFrame(() => toast.classList.remove('translate-x-4', 'opacity-0'));

    setTimeout(() => {
        toast.classList.add('translate-x-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Diálogo de confirmação (substitui confirm()). Chama onConfirm() se o usuário confirmar.
function showConfirm(message, onConfirm, { confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = true } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[210] bg-brand-dark/60 flex items-center justify-center p-4';
    overlay.innerHTML = `
        <div role="alertdialog" aria-modal="true" class="bg-white rounded shadow-xl w-full max-w-sm border border-gray-300">
            <div class="p-5">
                <p class="text-sm text-brand-dark leading-relaxed"></p>
            </div>
            <div class="flex justify-end gap-3 px-5 pb-5">
                <button data-cancel class="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"></button>
                <button data-ok class="px-4 py-2 rounded text-sm font-semibold text-white transition-colors ${danger ? 'bg-brand-red hover:bg-red-800' : 'bg-brand-blue hover:bg-blue-800'}"></button>
            </div>
        </div>`;
    overlay.querySelector('p').textContent = message;
    overlay.querySelector('[data-cancel]').textContent = cancelLabel;
    overlay.querySelector('[data-ok]').textContent = confirmLabel;

    const close = () => overlay.remove();
    overlay.querySelector('[data-cancel]').onclick = close;
    overlay.querySelector('[data-ok]').onclick = () => { close(); onConfirm(); };
    // fecha ao clicar fora do card
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.body.appendChild(overlay);
}
