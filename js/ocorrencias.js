// Camada de acesso às ocorrências via API (substitui o antigo `db`/localStorage).
// Mantém caches em memória e traduz o vocabulário front <-> API.

// Lista do usuário: cidadão vê as suas, operador vê todas (GET /ocorrencias).
let ocorrencias = [];
// Lista pública para o mapa/entorno, sem dados do autor (GET /ocorrencias/mapa).
let ocorrenciasMapa = [];

// ---- Mapeamento de vocabulário ----
const CAT_TO_API = {
    enchente: 'ENCHENTE', deslizamento: 'DESLIZAMENTO', lixo: 'LIXO',
    arvore: 'QUEDA_ARVORE', infraestrutura: 'INFRAESTRUTURA', outro: 'OUTRO'
};
const CAT_FROM_API = {
    ENCHENTE: 'enchente', DESLIZAMENTO: 'deslizamento', LIXO: 'lixo',
    QUEDA_ARVORE: 'arvore', INFRAESTRUTURA: 'infraestrutura', OUTRO: 'outro'
};
const STATUS_TO_API = { novo: 'RECEBIDO', em_analise: 'EM_ANALISE', resolvido: 'RESOLVIDO', critico: 'CRITICO' };
const STATUS_FROM_API = { RECEBIDO: 'novo', EM_ANALISE: 'em_analise', RESOLVIDO: 'resolvido', CRITICO: 'critico' };

// Converte uma ocorrência vinda da API para o formato usado pelas telas.
function normalizarOcorrencia(api) {
    return {
        id: api.id,
        cat: CAT_FROM_API[api.categoria] || 'outro',
        desc: api.descricao,
        addr: api.endereco,
        lat: api.latitude,
        lng: api.longitude,
        status: STATUS_FROM_API[api.status] || 'novo',
        data: api.createdAt ? new Date(api.createdAt).toLocaleDateString('pt-BR') : '',
        autor: api.autor || null
    };
}

// Carrega a lista do usuário (own/all) para o cache.
async function carregarOcorrencias() {
    const data = await apiFetch('/ocorrencias');
    ocorrencias = (data.ocorrencias || []).map(normalizarOcorrencia);
    return ocorrencias;
}

// Carrega a lista pública (mapa de incidentes / radar de entorno).
async function carregarOcorrenciasMapa() {
    const data = await apiFetch('/ocorrencias/mapa');
    ocorrenciasMapa = (data.ocorrencias || []).map(normalizarOcorrencia);
    return ocorrenciasMapa;
}

async function criarOcorrencia({ cat, desc, addr, lat, lng }) {
    const body = { categoria: CAT_TO_API[cat], descricao: desc, endereco: addr };
    if (lat != null) body.latitude = lat;
    if (lng != null) body.longitude = lng;
    return apiFetch('/ocorrencias', { method: 'POST', body: JSON.stringify(body) });
}

async function atualizarOcorrencia(id, campos) {
    const body = {};
    if (campos.cat) body.categoria = CAT_TO_API[campos.cat];
    if (campos.desc != null) body.descricao = campos.desc;
    if (campos.status) body.status = STATUS_TO_API[campos.status];
    return apiFetch('/ocorrencias/' + id, { method: 'PUT', body: JSON.stringify(body) });
}

async function removerOcorrencia(id) {
    return apiFetch('/ocorrencias/' + id, { method: 'DELETE' });
}
