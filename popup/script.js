// URL do backend — deve ser igual à constante BACKEND_URL em utils.js
// Desenvolvimento local: 'http://localhost:3000'
// Produção: 'https://SEU-APP.up.railway.app'
const BACKEND_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const togglePrint = document.getElementById('togglePrintMode');
    const toggleIncognito = document.getElementById('toggleIncognitoMode');
    const toggleChatIA = document.getElementById('toggleChatIA');
    const btnConfigPages = document.getElementById('btnConfigPages');
    const configPanel = document.getElementById('configPanel');
    const configPagesList = document.getElementById('configPagesList');
    const btnSelectAll = document.getElementById('btnSelectAll');
    const btnSelectNone = document.getElementById('btnSelectNone');

    // Lista de todas as páginas disponíveis (espelhado do utils.js)
    const TODAS_PAGINAS = [
        { id: "colaboradores", nome: "Colaboradores", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/></svg>' },
        { id: "clientes", nome: "Clientes", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/><path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.653a5.4 5.4 0 0 1 1.066-2H1V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9h-2.219c.554.654.89 1.373 1.066 2h.653a1.5 1.5 0 0 0 1.5-1.5V3a2 2 0 0 0-2-2z"/></svg>' },
        { id: "tarefas", nome: "Rel. Tarefas", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/></svg>' },
        { id: "notafiscal", nome: "Nota Fiscal", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z"/></svg>' },
        { id: "config", nome: "Config. Gerais", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52z"/></svg>' },
        { id: "orcamentos", nome: "Orcamentos", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M2 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/></svg>' },
        { id: "equipamentos", nome: "Equipamentos", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242l-.914.305-.968-.968 5.478-5.478a1 1 0 0 0-.707-1.707H10.5L9.086.586A2 2 0 0 0 7.672 0H7zM4.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-2-8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/></svg>' },
        { id: "produtos", nome: "Produtos", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/></svg>' },
        { id: "servicos", nome: "Servicos", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5M8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3m0 3a.5.5 0 0 1 .5.5v3.707l1.646 1.647a.5.5 0 0 1-.708.708l-1.792-1.793A.5.5 0 0 1 7.5 10V6.5A.5.5 0 0 1 8 6"/></svg>' },
        { id: "questionario", nome: "Questionarios", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/></svg>' },
        { id: "fatura", nome: "Faturas", icone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1"/></svg>' }
    ];

    // Páginas habilitadas por padrão (TODAS ativas)
    const PAGINAS_PADRAO = ['colaboradores', 'clientes', 'tarefas', 'notafiscal', 'config', 'orcamentos', 'equipamentos', 'produtos', 'servicos', 'questionario', 'fatura'];

    // ============================================
    // BANCO DE DADOS — CREDENCIAIS
    // ============================================

    const btnConfigDB = document.getElementById('btnConfigDB');
    const dbConfigPanel = document.getElementById('dbConfigPanel');
    const btnSalvarDB = document.getElementById('btnSalvarDB');
    const btnTestarDB = document.getElementById('btnTestarDB');
    const dbTestResult = document.getElementById('dbTestResult');
    const dbStatusBadge = document.getElementById('dbStatusBadge');

    // Toggle painel
    btnConfigDB.addEventListener('click', () => {
        dbConfigPanel.classList.toggle('open');
    });

    function getDbForm() {
        return {
            host: document.getElementById('dbHost').value.trim(),
            user: document.getElementById('dbUser').value.trim(),
            password: document.getElementById('dbPassword').value,
            database: document.getElementById('dbName').value.trim(),
            port: Number(document.getElementById('dbPort').value) || 3306
        };
    }

    function setDbForm(config) {
        if (!config) return;
        document.getElementById('dbHost').value = config.host || '';
        document.getElementById('dbUser').value = config.user || '';
        document.getElementById('dbPassword').value = config.password || '';
        document.getElementById('dbName').value = config.database || '';
        document.getElementById('dbPort').value = config.port || 3306;
    }

    function atualizarBadge(config) {
        if (config && config.host) {
            dbStatusBadge.textContent = config.user + '@' + config.host.split('.')[0];
            dbStatusBadge.className = 'db-status-badge db-badge-ok';
        } else {
            dbStatusBadge.textContent = 'Não configurado';
            dbStatusBadge.className = 'db-status-badge db-badge-vazio';
        }
    }

    // Salvar credenciais
    btnSalvarDB.addEventListener('click', () => {
        const config = getDbForm();
        chrome.storage.local.set({ auvo_db_config: config }, () => {
            atualizarBadge(config);
            dbTestResult.innerHTML = '<span style="color:#2f9e44;font-weight:600;">✓ Salvo!</span>';
            setTimeout(() => { dbTestResult.innerHTML = ''; }, 2000);
        });
    });

    // Testar conexão
    btnTestarDB.addEventListener('click', async () => {
        const config = getDbForm();
        if (!config.host || !config.user || !config.database) {
            dbTestResult.innerHTML = '<span style="color:#c92a2a;">Preencha host, usuário e banco.</span>';
            return;
        }
        btnTestarDB.textContent = 'Testando...';
        btnTestarDB.disabled = true;
        dbTestResult.innerHTML = '';
        try {
            const resp = await fetch(`${BACKEND_URL}/api/nf/testar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dbCredentials: config })
            });
            const data = await resp.json();
            if (resp.ok) {
                dbTestResult.innerHTML = '<span style="color:#2f9e44;font-weight:600;">✓ Conexão bem-sucedida!</span>';
            } else {
                dbTestResult.innerHTML = `<span style="color:#c92a2a;">✗ ${data.erro}</span>`;
            }
        } catch (e) {
            dbTestResult.innerHTML = '<span style="color:#c92a2a;">✗ Backend offline. Rode npm run dev na pasta backend.</span>';
        } finally {
            btnTestarDB.textContent = 'Testar conexão';
            btnTestarDB.disabled = false;
        }
    });

    // 1. Carregar estados salvos ao abrir
    chrome.storage.local.get([
        'auvo_config_print_mode',
        'auvo_config_incognito_mode',
        'chatIAHabilitado',
        'manuaisIndexados',
        'auvo_paginas_habilitadas',
        'auvo_db_config'
    ], async (result) => {
        togglePrint.checked = result.auvo_config_print_mode || false;
        toggleIncognito.checked = result.auvo_config_incognito_mode || false;
        toggleChatIA.checked = result.chatIAHabilitado || false;

        setDbForm(result.auvo_db_config);
        atualizarBadge(result.auvo_db_config);

        // Carregar páginas habilitadas (ou usar padrão)
        const paginasHabilitadas = result.auvo_paginas_habilitadas || PAGINAS_PADRAO;
        renderizarListaPaginas(paginasHabilitadas);

        // Carregar manuais automaticamente se ainda não existirem
        if (!result.manuaisIndexados || result.manuaisIndexados.length === 0) {
            const manuais = await carregarManuaisAutomaticamente();
            await chrome.storage.local.set({ manuaisIndexados: manuais });
            console.log('Manuais carregados automaticamente:', manuais.length);
        }
    });

    // ============================================
    // CONFIGURAÇÃO DE PÁGINAS
    // ============================================

    // Toggle do painel de configuração
    btnConfigPages.addEventListener('click', () => {
        configPanel.classList.toggle('open');
    });

    // Renderizar lista de páginas
    function renderizarListaPaginas(paginasHabilitadas) {
        configPagesList.innerHTML = '';

        TODAS_PAGINAS.forEach(pagina => {
            const isSelected = paginasHabilitadas.includes(pagina.id);

            const item = document.createElement('div');
            item.className = `config-page-item${isSelected ? ' selected' : ''}`;
            item.dataset.pageId = pagina.id;

            item.innerHTML = `
                <div class="config-checkbox">
                    <input type="checkbox" id="chk_${pagina.id}" ${isSelected ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </div>
                <div class="config-page-icon">${pagina.icone}</div>
                <span class="config-page-name">${pagina.nome}</span>
            `;

            const checkbox = item.querySelector('input[type="checkbox"]');

            // Click no item inteiro (exceto no checkbox que já funciona)
            item.addEventListener('click', (e) => {
                // Evita duplo toggle quando clica direto no checkbox
                if (e.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked;
                }
                item.classList.toggle('selected', checkbox.checked);
                salvarPaginasHabilitadas();
                mostrarBtnSalvar();
            });

            configPagesList.appendChild(item);
        });
    }

    // Salvar páginas habilitadas
    function salvarPaginasHabilitadas() {
        const paginasHabilitadas = [];
        configPagesList.querySelectorAll('.config-page-item').forEach(item => {
            if (item.querySelector('input').checked) {
                paginasHabilitadas.push(item.dataset.pageId);
            }
        });

        chrome.storage.local.set({ 'auvo_paginas_habilitadas': paginasHabilitadas }, () => {
            console.log('Páginas habilitadas salvas:', paginasHabilitadas);
        });
    }

    // Mostrar botão de salvar
    function mostrarBtnSalvar() {
        const btnSalvar = document.getElementById('btnSalvarConfig');
        if (btnSalvar) {
            btnSalvar.classList.add('visible');
        }
    }

    // Botão Salvar - Atualiza a página
    const btnSalvar = document.getElementById('btnSalvarConfig');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => {
            // Envia mensagem para atualizar a aba ativa do Auvo
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].url && tabs[0].url.includes('auvo.com.br')) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
            // Fecha o popup
            window.close();
        });
    }

    // Selecionar todas
    btnSelectAll.addEventListener('click', () => {
        configPagesList.querySelectorAll('.config-page-item').forEach(item => {
            item.classList.add('selected');
            item.querySelector('input').checked = true;
        });
        salvarPaginasHabilitadas();
        mostrarBtnSalvar();
    });

    // Desmarcar todas
    btnSelectNone.addEventListener('click', () => {
        configPagesList.querySelectorAll('.config-page-item').forEach(item => {
            item.classList.remove('selected');
            item.querySelector('input').checked = false;
        });
        salvarPaginasHabilitadas();
        mostrarBtnSalvar();
    });

    // 2. Salvar estado do Modo Print ao mudar
    togglePrint.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        chrome.storage.local.set({ 'auvo_config_print_mode': isChecked }, () => {
            console.log('Modo Print alterado para:', isChecked);
        });
    });

    // 3. Salvar estado do Modo Anônimo ao mudar
    toggleIncognito.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        chrome.storage.local.set({ 'auvo_config_incognito_mode': isChecked }, () => {
            console.log('Modo Anônimo alterado para:', isChecked);

            // Exibe mensagem informativa e redireciona para configurações
            if (isChecked) {
                const confirmar = confirm('Para que a extensão funcione em guias anônimas, você também precisa:\n\n1. Clicar com botão direito no ícone da extensão\n2. Selecionar "Gerenciar extensão"\n3. Ativar a opção "Permitir no modo de navegação anônima"\n\nEsta configuração ficará salva para facilitar o uso.\n\nClique em OK para abrir as configurações da extensão.');

                if (confirmar) {
                    chrome.tabs.create({ url: 'chrome://extensions/?id=migmfcadmmjfmnlkbbijmehdbljkpelh' });
                }
            }
        });
    });

    // 4. Toggle do Chat IA
    toggleChatIA.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        chrome.storage.local.set({ 'chatIAHabilitado': isChecked }, () => {
            console.log('Chat IA alterado para:', isChecked);
        });
    });

    // 5. Link para o Guia do Usuário
    const linkGuia = document.getElementById('linkGuiaUsuario');
    if (linkGuia) {
        linkGuia.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: chrome.runtime.getURL('GUIA_DO_USUARIO.html') });
        });
    }

    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================

    async function carregarManuaisAutomaticamente() {
        const manuaisData = [
            {
                nome: 'Comportamentos Auvo',
                chunks: await extrairChunksSimulados('comportamentos')
            },
            {
                nome: 'Conteúdo IA',
                chunks: await extrairChunksSimulados('conteudo_ia')
            },
            {
                nome: 'Integração Conta Azul',
                chunks: await extrairChunksSimulados('conta_azul')
            },
            {
                nome: 'Integração Omie',
                chunks: await extrairChunksSimulados('omie')
            },
            {
                nome: 'Integração Bling',
                chunks: await extrairChunksSimulados('bling')
            },
            {
                nome: 'Inutilização de NF',
                chunks: await extrairChunksSimulados('inutilizacao')
            },
            {
                nome: 'Manual de Contratos',
                chunks: await extrairChunksSimulados('contratos')
            },
            {
                nome: 'Manual do Usuário',
                chunks: await extrairChunksSimulados('manual_usuario')
            },
            {
                nome: 'Informações Omie',
                chunks: await extrairChunksSimulados('info_omie')
            }
        ];

        return manuaisData;
    }

    // Base de conhecimento dos manuais
    async function extrairChunksSimulados(tipo) {
        // Base de conhecimento hardcoded (será substituída por PDFs reais)
        const baseConhecimento = {
            comportamentos: [
                { texto: 'O sistema Auvo é uma plataforma de gestão de serviços que permite controle de tarefas, clientes e notas fiscais.' },
                { texto: 'A interface principal possui menu lateral com acesso a Colaboradores, Clientes, Tarefas e Notas Fiscais.' }
            ],
            conteudo_ia: [
                { texto: 'A IA do Auvo analisa erros de nota fiscal e fornece explicações em linguagem simples.' },
                { texto: 'Para análise de erros, clique no botão roxo "Analisar Erro IA" que aparece ao lado de mensagens de erro.' }
            ],
            conta_azul: [
                { texto: 'Para ativar a integração com Conta Azul: 1) Acesse Configurações > Integrações, 2) Selecione Conta Azul, 3) Autorize a conexão, 4) Configure o mapeamento de contas.' },
                { texto: 'A sincronização com Conta Azul inclui: clientes, produtos, notas fiscais e lançamentos financeiros.' }
            ],
            omie: [
                { texto: 'Integração Omie requer App Key e App Secret fornecidos pela Omie.' },
                { texto: 'Para configurar Omie: vá em Configurações > Integrações > Omie e insira as credenciais.' },
                { texto: 'A sincronização pode ser automática (em tempo real) ou manual (sob demanda).' }
            ],
            bling: [
                { texto: 'Bling se integra para sincronizar produtos, clientes e notas fiscais.' },
                { texto: 'Configuração Bling: acesse Integrações > Bling > Conectar com sua conta Bling.' }
            ],
            inutilizacao: [
                { texto: 'Inutilização de NF-e é necessária quando uma numeração foi pulada.' },
                { texto: 'Para inutilizar: 1) Acesse Notas Fiscais > Inutilizar, 2) Informe a série e números, 3) Justificativa mínima de 15 caracteres.' }
            ],
            contratos: [
                { texto: 'Contratos permitem faturamento recorrente automático.' },
                { texto: 'Para criar contrato: Clientes > Selecionar cliente > aba Contratos > Novo Contrato.' },
                { texto: 'Configure periodicidade (mensal, trimestral, anual) e serviços incluídos.' }
            ],
            manual_usuario: [
                { texto: 'Para criar uma tarefa: Menu > Tarefas > Nova Tarefa > Preencher cliente, serviços e colaborador responsável.' },
                { texto: 'Relatório de tarefas está em Relatórios > Tarefas, com filtros por período, status e colaborador.' }
            ],
            info_omie: [
                { texto: 'Omie permite emissão de NF-e, NFS-e e controle financeiro integrado.' },
                { texto: 'Erros comuns Omie: credenciais inválidas, produtos sem código, clientes sem CNPJ/CPF.' }
            ]
        };

        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 300));

        return baseConhecimento[tipo] || [];
    }
});
