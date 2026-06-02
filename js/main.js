async function loadIncludes() {
    const elements = document.querySelectorAll('[data-include]');
    const promises = Array.from(elements).map(async (el) => {
        const file = el.getAttribute('data-include');
        try {
            const response = await fetch(`${file}?v=${new Date().getTime()}`);
            if (response.ok) {
                el.innerHTML = await response.text();
            }
        } catch (error) {
            console.error(`Erro ao carregar o componente: ${file}`, error);
        }
    });
    
    await Promise.all(promises);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadIncludes();
    initForms();
    startIoTSimulation();
});