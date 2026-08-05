// Cliente HTTP para a API do CIMADEC.
// `credentials: 'include'` é essencial: faz o navegador enviar/receber o
// cookie de sessão (httpOnly) definido pelo back-end no login.

// Em desenvolvimento usa a API local; publicado (GitHub Pages) usa o Cloud Run.
// >>> Após o deploy, substitua a URL de produção pela do seu serviço no Cloud Run. <<<
const rodandoLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
const API_BASE = rodandoLocal
    ? 'http://localhost:3000/api'
    : 'https://SEU-BACKEND.run.app/api';

async function apiFetch(path, options = {}) {
    let response;
    try {
        response = await fetch(API_BASE + path, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options
        });
    } catch (err) {
        // Falha de rede: API fora do ar, CORS bloqueado, etc.
        throw { status: 0, message: 'Não foi possível conectar à API. O back-end está rodando na porta 3000?' };
    }

    // Algumas respostas (ex.: logout 204) podem vir sem corpo.
    const text = await response.text();
    let data = null;
    if (text) {
        try { data = JSON.parse(text); } catch { data = null; }
    }

    if (!response.ok) {
        throw { status: response.status, message: (data && data.error) || 'Erro na requisição.', data };
    }
    return data;
}
