// Cliente HTTP para a API do CIMADEC.
// `credentials: 'include'` é essencial: faz o navegador enviar/receber o
// cookie de sessão (httpOnly) definido pelo back-end no login.

const API_BASE = 'http://localhost:3000/api';

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
