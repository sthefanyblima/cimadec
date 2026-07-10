const CATEGORIAS_MAP = {
    'enchente': { nome: 'Alagamento', icon: 'ph-waves', color: '#0B3B60' },
    'deslizamento': { nome: 'Deslizamento', icon: 'ph-mountains', color: '#9B1B30' },
    'lixo': { nome: 'Resíduos Irregulares', icon: 'ph-trash', color: '#6B7280' },
    'arvore': { nome: 'Queda de Árvore', icon: 'ph-tree', color: '#4B5563' }
};

const STATUS_MAP = {
    'novo': { label: 'Pendente', dot: 'bg-brand-red', text: 'text-brand-dark' },
    'em_analise': { label: 'Em Análise', dot: 'bg-blue-500', text: 'text-brand-dark' },
    'resolvido': { label: 'Resolvido', dot: 'bg-gray-400', text: 'text-gray-500' }
};

const initialMock = [
    { id: 'PRT-901', cat: 'enchente', desc: 'Rua alagada impedindo tráfego.', data: '31/05/2026', lat: -9.664448, lng: -35.735075, addr: 'Rua do Comércio, Centro, Maceió', status: 'novo' },
    { id: 'PRT-902', cat: 'deslizamento', desc: 'Rachadura próximo à encosta.', data: '30/05/2026', lat: -9.638682, lng: -35.732646, addr: 'Avenida Fernandes Lima, Farol, Maceió', status: 'em_analise' },
    { id: 'PRT-903', cat: 'lixo', desc: 'Metralha bloqueando calçada.', data: '30/05/2026', lat: -9.673238, lng: -35.753820, addr: 'Avenida Siqueira Campos, Trapiche da Barra, Maceió', status: 'resolvido' },
    { id: 'PRT-904', cat: 'enchente', desc: 'Transbordamento de canal.', data: '29/05/2026', lat: -9.546300, lng: -35.729500, addr: 'Avenida Benedito Bentes, Benedito Bentes, Maceió', status: 'novo' }
];

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