# CIMADEC – Plataforma de Gestão de Crises Urbanas

![Status](https://img.shields.io/badge/status-prot%C3%B3tipo-blue)
![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-orange)
![License](https://img.shields.io/badge/license-Acad%C3%AAmico-green)

## 📌 Sobre o Projeto

O **CIMADEC (Centro Integrado de Monitoramento e Análise de Desastres e Crises)** é uma plataforma web desenvolvida para auxiliar o monitoramento e o gerenciamento de ocorrências urbanas na cidade de **Maceió – AL**.

A proposta do sistema é funcionar como uma ponte entre a população e os órgãos responsáveis pela gestão urbana, permitindo o registro e acompanhamento de situações de risco que afetam diretamente a população.

Entre as ocorrências monitoradas estão:

- 🌊 Enchentes
- ⛰️ Deslizamentos de encostas
- 🗑️ Acúmulo irregular de lixo
- 🌳 Queda de árvores
- 🚧 Problemas de infraestrutura urbana

Além do registro das ocorrências, a plataforma disponibiliza um painel de monitoramento para visualização e análise dos dados coletados.

---

# 🎯 Objetivos

## Objetivo Geral

Desenvolver um protótipo funcional de uma plataforma web para monitoramento de crises urbanas, permitindo o registro, visualização e acompanhamento de ocorrências georreferenciadas.

## Objetivos Específicos

- Facilitar o reporte de problemas urbanos pela população;
- Disponibilizar informações geográficas das ocorrências;
- Permitir a visualização de indicadores em tempo real (simulados);
- Aplicar conceitos de UX/UI e responsividade;
- Demonstrar o uso de mapas interativos em aplicações web.

---

# 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| HTML5 | Estrutura semântica da aplicação |
| CSS3 | Estilização complementar |
| Tailwind CSS | Layout responsivo e utilitário |
| JavaScript ES6+ | Interatividade e lógica da aplicação |
| Leaflet.js | Mapa interativo |
| OpenStreetMap / CartoDB | Provedor dos mapas |
| Chart.js | Visualização de dados |
| Phosphor Icons | Ícones da interface |
| localStorage | Persistência local dos dados |

---

# 🏗️ Arquitetura do Projeto

O sistema segue uma arquitetura totalmente **Client-Side**, ou seja, toda a execução ocorre diretamente no navegador.

### Características

✅ Sem back-end

✅ Sem banco de dados

✅ Sem autenticação real

✅ Compatível com GitHub Pages

✅ Persistência local utilizando localStorage

✅ Sem necessidade de instalação de dependências

---

# 📁 Estrutura do Projeto

```text
/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── README.md
└── .gitignore
```

---

# 👥 Perfis de Usuário

A aplicação foi dividida em dois fluxos principais:

## 👤 Cidadão

Responsável pelo registro das ocorrências.

### Funcionalidades

- Cadastro de ocorrências;
- Registro georreferenciado;
- Upload simulado de evidências;
- Histórico de protocolos;
- Consulta do status da ocorrência.

### Dados registrados

- Categoria;
- Descrição;
- Endereço;
- Coordenadas geográficas;
- Data do registro.

---

## 🏢 Operador / Defesa Civil

Responsável pelo monitoramento e análise das ocorrências registradas.

### Funcionalidades

- Dashboard analítico;
- Visualização de indicadores;
- Mapa de ocorrências;
- Triagem de chamados;
- Atualização de status.

### Indicadores exibidos

- Total de ocorrências;
- Ocorrências em análise;
- Casos resolvidos;
- Casos críticos;
- Distribuição por categoria.

---

# 🌎 Georreferenciamento

A plataforma utiliza:

- **Leaflet.js**
- **OpenStreetMap**
- **CartoDB Voyager**

para exibição dos mapas.

### Recursos implementados

- Visualização de Maceió em mapa interativo;
- Captura de coordenadas através de clique no mapa;
- Exibição de marcadores;
- Associação da ocorrência à localização geográfica.

---

# 🎨 Decisões de Design (UI/UX)

## Interface

Foi adotado o padrão **Flat Design Corporativo**, priorizando:

- Legibilidade;
- Simplicidade;
- Clareza visual;
- Organização das informações.

## Paleta de Cores

A identidade visual utiliza:

- Tons neutros para fundo;
- Azul institucional para ações principais;
- Vermelho para alertas críticos;
- Verde para indicadores positivos.

## Responsividade

O sistema foi projetado para funcionar em:

| Dispositivo | Resolução |
|------------|------------|
| Mobile | até 640px |
| Tablet | 768px ou superior |
| Desktop | 1024px ou superior |

---

# ⚙️ Funcionalidades Implementadas

### Landing Page

- Apresentação do projeto;
- Introdução ao problema urbano;
- Botões de navegação rápida.

### Dashboard

- Painel de monitoramento;
- Exibição de estatísticas;
- Filtro de ocorrências.

### Formulário de Ocorrências

- Validação dinâmica;
- Campos obrigatórios;
- Upload simulado;
- Captura de coordenadas.

### Mapa Interativo

- Navegação livre;
- Seleção de localização;
- Marcadores dinâmicos.

### Armazenamento Local

Utilização do:

```javascript
localStorage
```

para manter os registros após recarregar a página.

---

# 🚀 Como Executar o Projeto

## Método 1 — Abertura Direta

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/cimadec.git
```

2. Entre na pasta do projeto:

```bash
cd cimadec
```

3. Abra o arquivo:

```text
index.html
```

em qualquer navegador moderno.

---

## Método 2 — Live Server (Recomendado)

Caso utilize o VS Code:

1. Instale a extensão **Live Server**;
2. Abra o projeto;
3. Clique com o botão direito em:

```text
index.html
```

4. Selecione:

```text
Open with Live Server
```

---

# 💾 Persistência dos Dados

Os dados são armazenados localmente através da API:

```javascript
localStorage
```

Isso permite que as ocorrências continuem disponíveis mesmo após:

- Atualização da página;
- Fechamento do navegador;
- Reinício da aplicação.

---

# ⚠️ Limitações Conhecidas

Por se tratar de um protótipo acadêmico de front-end:

- Não existe autenticação real;
- Não há banco de dados;
- Não existe API REST;
- O upload de imagens é apenas simulado;
- Não há integração com órgãos públicos;
- Não existe envio real de notificações;
- Os alertas climáticos são estáticos.

---

# 🔮 Trabalhos Futuros

As próximas evoluções previstas incluem:

### Infraestrutura

- PostgreSQL + PostGIS;
- API REST;
- Hospedagem em nuvem.

### Funcionalidades

- Upload real de imagens;
- Cadastro de usuários;
- Sistema de autenticação;
- Painel administrativo completo;
- Notificações em tempo real.

### Integrações

- INMET;
- CEMADEN;
- OpenWeather;
- APIs municipais.

---

# 📚 Referências

- HTML Living Standard
- Tailwind CSS Documentation
- Leaflet Documentation
- OpenStreetMap
- Chart.js Documentation
- W3C Web Accessibility Guidelines (WCAG)

---

# 👨‍💻 Autores

Projeto desenvolvido para fins acadêmicos na disciplina de Desenvolvimento Web, com foco em monitoramento de crises urbanas e participação cidadã.

---

# 📄 Licença

Este projeto possui finalidade exclusivamente acadêmica e educacional.

Uso livre para estudos, demonstrações e apresentações universitárias.

---

**CIMADEC © 2026 – Centro Integrado de Monitoramento e Análise de Desastres e Crises**