CIMADEC - Plataforma Independente de Gestão de Crises Urbanas
Visão Geral

O CIMADEC (Centro Integrado de Monitoramento e Análise de Desastres e Crises) é um protótipo funcional de front-end desenvolvido para simular a gestão e o monitoramento de ocorrências urbanas, com foco geográfico na cidade de Maceió, Alagoas.

O sistema foi projetado para atuar como uma ponte entre a população e os órgãos de controle, facilitando o reporte de alagamentos, deslizamentos de encostas, acúmulo irregular de resíduos e danos à infraestrutura, além de prover um painel analítico para a triagem e tomada de decisão por parte de operadores logísticos e de defesa civil.
Arquitetura e Tecnologias

O projeto foi construído sob uma arquitetura estática (Client-Side) visando alta compatibilidade, ausência de dependências complexas de build e facilidade de deploy em ambientes como GitHub Pages.

    Linguagem Base: HTML5 Semântico e JavaScript (Vanilla/ES6+).

    Estilização: Tailwind CSS (via CDN) para construção de uma interface utilitária, responsiva e alinhada a padrões de design de software governamental (GovTech).

    Mapeamento e Georreferenciamento: Leaflet.js integrado aos tiles do CartoDB (Voyager), escolhido por oferecer estabilidade em ambientes de desenvolvimento local (file:///) sem bloqueios de CORS ou exigência de cabeçalhos de referência estritos.

    Visualização de Dados: Chart.js para renderização do painel de métricas e distribuição espacial no acesso do operador.

    Ícones: Phosphor Icons.

    Armazenamento de Estado: API localStorage do navegador para persistência de dados simulados (mock) durante a sessão e entre recarregamentos.

Estrutura de Arquivos
Plaintext

/
├── index.html        # Estrutura unificada da aplicação (Single Page Application simulada)
├── css/
│   └── style.css     # Regras de sobreposição de Z-index, customização de barras de rolagem e resets
├── js/
│   └── script.js     # Lógica de controle de estado, renderização de UI, geolocalização e gráficos
└── README.md         # Documentação do projeto

Perfis de Acesso e Funcionalidades

A plataforma foi dividida em dois fluxos de usuário distintos para garantir segurança e foco operacional.
1. Acesso Cidadão (Público)

Focado em usabilidade rápida e precisão na coleta de dados.

    Wizard de Registro: Formulário segmentado em etapas (Stepper) para reduzir a carga cognitiva do usuário.

    Geolocalização Inteligente: Utiliza a API navigator.geolocation nativa do HTML5. Possui uma trava de segurança no mock: caso a coordenada retornada pelo provedor de internet do usuário esteja fora do polígono geográfico de Maceió, o sistema faz um "snap" para a coordenada central da cidade para garantir a integridade da demonstração.

    Histórico de Protocolos: Listagem de ocorrências submetidas, exibindo categoria, data, coordenadas e status atualizado.

2. Acesso Operador (Gestão e Defesa Civil)

Focado em análise de dados em massa e triagem de resposta rápida.

    Painel Analítico (Dashboard): Exibição de KPIs críticos (Total de registros, Aguardando triagem, Riscos críticos).

    Distribuição Espacial: Gráfico de barras indicando o volume de ocorrências por classificação e um Heatmap/Mapa de Pinos renderizando todas as ocorrências ativas na malha urbana.

    Fila de Triagem: Tabela de gerenciamento em tempo real permitindo a atualização do status das ocorrências (Novo, Em Análise, Resolvido).

Decisões de Design (UI/UX)

Para este projeto, optou-se por abandonar o conceito de interfaces "Soft UI" (com cores pastéis, sombras exageradas e cantos excessivamente arredondados), adotando o padrão Flat Design Corporativo.

    Paleta de Cores: Focada em tons neutros (escala de cinzas e branco) como fundo, utilizando o Azul Marinho e o Vermelho Escuro (referência indireta às cores da bandeira de Maceió) apenas para ações primárias e indicadores de status críticos.

    Indicadores Visuais: Uso de "Status Dots" (pontos sólidos de cor) combinados com tipografia monocromática para representar o andamento dos processos, evitando a poluição visual comum em painéis de listagem.

Instruções de Execução

Por ser uma aplicação inteiramente executada no lado do cliente (Client-Side), não há necessidade de instalação de pacotes (ex: npm install) ou inicialização de servidores complexos.

    Clone este repositório para sua máquina local.

    Navegue até o diretório raiz do projeto.

    Abra o arquivo index.html em qualquer navegador web moderno.

    (Recomendado): Para uma experiência de desenvolvimento ideal e para evitar restrições estritas de segurança de arquivos locais de alguns navegadores, utilize extensões como o Live Server (VS Code) para rodar o projeto sob um protocolo http://localhost.

Limitações Conhecidas e Escopo Futuro (Roadmap)

Este sistema reflete a Fase 1 (Front-end e Protótipo) de um escopo maior de gestão de crises urbanas. As seguintes limitações estão mapeadas para resolução nas próximas fases:

    Volatilidade dos Dados: Atualmente restritos ao localStorage. O planejamento futuro prevê a migração para um banco de dados relacional (PostgreSQL com extensão PostGIS) via API RESTful (Node.js ou Python).

    Upload de Evidências: A área de anexo fotográfico é apenas visual. A implementação real exigirá integração com serviços de armazenamento em nuvem (ex: AWS S3).

    Integração de APIs de Clima: O "Alerta Amarelo" de chuvas na interface do operador é estático. A versão de produção deverá consumir endpoints públicos (como INMET ou CEMADEN) para atualizar o cabeçalho automaticamente com base na previsão meteorológica local.