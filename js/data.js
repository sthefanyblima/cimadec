const CATEGORIAS_MAP = {
    'enchente': { nome: 'Alagamento', icon: 'ph-waves', color: '#0B3B60' },
    'deslizamento': { nome: 'Deslizamento', icon: 'ph-mountains', color: '#9B1B30' },
    'lixo': { nome: 'Resíduos Irregulares', icon: 'ph-trash', color: '#6B7280' },
    'arvore': { nome: 'Queda de Árvore', icon: 'ph-tree', color: '#4B5563' },
    'infraestrutura': { nome: 'Infraestrutura', icon: 'ph-warning-circle', color: '#B45309' },
    'outro': { nome: 'Outro', icon: 'ph-dots-three-circle', color: '#6B7280' }
};

const STATUS_MAP = {
    'novo': { label: 'Pendente', dot: 'bg-brand-red', text: 'text-brand-dark' },
    'em_analise': { label: 'Em Análise', dot: 'bg-blue-500', text: 'text-brand-dark' },
    'resolvido': { label: 'Resolvido', dot: 'bg-gray-400', text: 'text-gray-500' },
    'critico': { label: 'Crítico', dot: 'bg-red-600', text: 'text-red-700' }
};

const menus = {
    cidadao: [
        { id: 'c-dashboard', icon: 'ph-map-trifold', label: 'Painel da Comunidade' },
        { id: 'c-reportar', icon: 'ph-plus-circle', label: 'Novo Registro' },
        { id: 'c-historico', icon: 'ph-folder-simple', label: 'Meu Histórico' },
        { id: 'c-alertas', icon: 'ph-warning', label: 'Alertas Locais', mock: false }
    ],
    operador: [
        { id: 'o-dashboard', icon: 'ph-chart-bar', label: 'Painel Analítico' },
        { id: 'o-mapa', icon: 'ph-globe-hemisphere-west', label: 'Mapa Operacional' },
        { id: 'o-triagem', icon: 'ph-kanban', label: 'Fila de Triagem' },
        { id: 'o-relatorios', icon: 'ph-file-csv', label: 'Exportar Relatórios', mock: false }
    ]
};