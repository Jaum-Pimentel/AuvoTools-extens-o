// =================================================================
// 1. AUTOMAÇÃO DE PREENCHIMENTO (CS.AUVO & CS.2WORKERS)
// =================================================================
if (window.location.href.includes("GerenciadorDeProcedimentos")) {
    const preencherCampo = (storageKey, elementId) => {
        chrome.storage.local.get([storageKey], function(result) {
            if (result[storageKey]) {
                const valor = result[storageKey];
                const tentar = () => {
                    const el = document.getElementById(elementId);
                    if (el) {
                        el.value = valor;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        chrome.storage.local.remove(storageKey);
                    } else {
                        requestAnimationFrame(tentar);
                    }
                };
                tentar();
            }
        });
    };
    preencherCampo('auvo_proc_tarefa', 'codigoTarefa');
}

// =================================================================
// 2. INICIALIZAÇÃO DA UI E REDIRECIONAMENTO (ANTI-FLICKER)
// =================================================================

if (verificarDominioSuportado() && !window.location.href.includes("GerenciadorDeProcedimentos")) {
    
    // Verifica redirecionamento pendente
    chrome.storage.local.get(['auvo_destino'], function(result) {
        if (result.auvo_destino) {
            
            // --- TRUQUE VISUAL (ANTI-FLICKER) ---
            // Oculta a página inicial imediatamente para o usuário não ver a "piscada"
            // Isso dá a sensação de que o login foi direto para o destino
            document.documentElement.style.display = 'none';
            
            const baseUrlDinamica = window.location.origin;
            const destino = result.auvo_destino.startsWith('http') ? result.auvo_destino : baseUrlDinamica + result.auvo_destino;
            
            // Remove o destino do storage e redireciona
            chrome.storage.local.remove('auvo_destino', function() {
                window.location.replace(destino);
            });
            return; // Interrompe o resto do script para economizar recurso
        }
        
        // Se não tiver redirecionamento, carrega a UI normal da extensão
        iniciarInterface();
    });
}

function iniciarInterface() {
    tentarInjetarVisual();
    const observer = new MutationObserver(() => tentarInjetarVisual());
    observer.observe(document, { childList: true, subtree: true });
}

function tentarInjetarVisual() {
    const botaoOriginal = document.getElementById('AcessarConta');
    if (botaoOriginal && !botaoOriginal.classList.contains('auvo-ext-processed') && botaoOriginal.offsetWidth > 0) {
        criarBotaoSplit(botaoOriginal);
    } else {
        requestAnimationFrame(tentarInjetarVisual);
    }
}

// =================================================================
// 3. CONSTRUÇÃO DA INTERFACE (BOTÃO SPLIT & MENU)
// =================================================================
function criarBotaoSplit(botaoOriginal) {
    // Garante limpeza de qualquer resquício antigo
    chrome.storage.local.remove('auvo_destino'); 
    
    const estilos = window.getComputedStyle(botaoOriginal);
    const larguraOriginal = estilos.width;
    const margemSuperior = estilos.marginTop;
    
    if (parseInt(larguraOriginal) === 0) return; 

    botaoOriginal.classList.add('auvo-ext-processed');
    
    // Estiliza o botão original
    botaoOriginal.style.borderTopRightRadius = "0";
    botaoOriginal.style.borderBottomRightRadius = "0";
    botaoOriginal.style.borderRight = "none"; 
    botaoOriginal.style.marginRight = "0"; 
    
    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'auvo-ext-wrapper';
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'stretch';
    wrapper.style.gap = '0';
    wrapper.style.verticalAlign = 'top';
    wrapper.style.marginTop = margemSuperior;
    wrapper.style.marginBottom = estilos.marginBottom;
    wrapper.style.marginLeft = estilos.marginLeft;
    wrapper.style.marginRight = estilos.marginRight;
    wrapper.style.backgroundColor = estilos.backgroundColor;
    wrapper.style.borderRadius = estilos.borderRadius; 

    if (larguraOriginal.includes('%') || estilos.display === 'block') {
         wrapper.style.width = '100%';
    } else {
         wrapper.style.width = larguraOriginal; 
    }

    botaoOriginal.parentNode.insertBefore(wrapper, botaoOriginal);
    wrapper.appendChild(botaoOriginal);

    // Seta e Menu Container
    const containerExtensao = document.createElement('div');
    containerExtensao.className = 'auvo-ext-container'; 
    containerExtensao.style.display = 'flex';
    containerExtensao.style.position = 'relative';
    containerExtensao.style.margin = '0';
    
    const btnSeta = document.createElement('div');
    btnSeta.className = 'auvo-ext-trigger';
    btnSeta.style.backgroundColor = estilos.backgroundColor;
    btnSeta.style.color = estilos.color;
    btnSeta.style.cursor = 'pointer';
    btnSeta.style.display = 'flex';
    btnSeta.style.alignItems = 'center';
    btnSeta.style.justifyContent = 'center';
    btnSeta.style.width = '40px';
    btnSeta.style.minWidth = '40px';

    const raio = estilos.borderTopRightRadius || estilos.borderRadius || '4px';
    btnSeta.style.borderTopRightRadius = raio;
    btnSeta.style.borderBottomRightRadius = raio;
    btnSeta.style.borderTopLeftRadius = "0";
    btnSeta.style.borderBottomLeftRadius = "0";
    btnSeta.style.marginLeft = "0";
    btnSeta.style.borderLeft = "1px solid rgba(255, 255, 255, 0.3)"; 
    
    btnSeta.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

    btnSeta.addEventListener('click', (e) => {
        e.stopPropagation();
        containerExtensao.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
        if (!containerExtensao.contains(e.target)) {
            containerExtensao.classList.remove('is-open');
        }
    });
    
    // --- MENU DROPDOWN ---
    const menuBox = document.createElement('div');
    menuBox.className = 'auvo-ext-menu';
    menuBox.addEventListener('click', (e) => e.stopPropagation());

    // Tabs Header
    const tabsHeader = document.createElement('div');
    tabsHeader.className = 'auvo-tabs-header';
    
    const tabAcesso = document.createElement('div');
    tabAcesso.className = 'auvo-tab-btn active';
    tabAcesso.innerText = "Geral";
    
    const tabProcedimentos = document.createElement('div');
    tabProcedimentos.className = 'auvo-tab-btn';
    tabProcedimentos.innerText = "Proced.";

    const tabServidores = document.createElement('div');
    tabServidores.className = 'auvo-tab-btn';
    tabServidores.innerText = "Servidor";
    
    tabsHeader.appendChild(tabAcesso);
    tabsHeader.appendChild(tabProcedimentos);
    tabsHeader.appendChild(tabServidores);
    menuBox.appendChild(tabsHeader);

    // Views
    const viewAcesso = document.createElement('div');
    viewAcesso.className = 'auvo-view active';
    renderizarViewPadrao(viewAcesso, botaoOriginal);
    menuBox.appendChild(viewAcesso);

    const viewProcedimentos = document.createElement('div');
    viewProcedimentos.className = 'auvo-view';
    renderizarViewProcedimentos(viewProcedimentos);
    menuBox.appendChild(viewProcedimentos);

    const viewServidores = document.createElement('div');
    viewServidores.className = 'auvo-view';
    renderizarViewServidores(viewServidores, botaoOriginal);
    menuBox.appendChild(viewServidores);

    // Lógica de Troca de Abas
    const alternarAbas = (aba) => {
        [tabAcesso, tabProcedimentos, tabServidores].forEach(t => t.classList.remove('active'));
        [viewAcesso, viewProcedimentos, viewServidores].forEach(v => v.classList.remove('active'));

        if (aba === 'acesso') {
            tabAcesso.classList.add('active');
            viewAcesso.classList.add('active');
        } else if (aba === 'procedimentos') {
            tabProcedimentos.classList.add('active');
            viewProcedimentos.classList.add('active');
        } else if (aba === 'servidores') {
            tabServidores.classList.add('active');
            viewServidores.classList.add('active');
        }
    };

    tabAcesso.addEventListener('click', () => alternarAbas('acesso'));
    tabProcedimentos.addEventListener('click', () => alternarAbas('procedimentos'));
    tabServidores.addEventListener('click', () => alternarAbas('servidores'));

    containerExtensao.appendChild(btnSeta);
    containerExtensao.appendChild(menuBox);
    wrapper.appendChild(containerExtensao);
    
    ajustarVizinho(wrapper);
}

// =================================================================
// 4. RENDERIZAÇÃO DAS VIEWS & LÓGICA DE AÇÃO
// =================================================================

function renderizarViewPadrao(container, botaoOriginal) {
    const todosInputs = [];
    const btnAcaoGlobal = document.createElement('button');
    btnAcaoGlobal.innerText = "Acessar";
    btnAcaoGlobal.className = 'auvo-ext-action-btn';

    btnAcaoGlobal.addEventListener('click', (e) => {
        e.stopPropagation();
        const inputPreenchido = todosInputs.find(input => input.value.trim() !== "");
        if (inputPreenchido) {
            const urlBase = inputPreenchido.dataset.urlBase;
            const codigo = inputPreenchido.value.trim();
            realizarLoginComDestino(urlBase + codigo, botaoOriginal);
        }
    });

    const validarEntradas = () => {
        const preenchidos = todosInputs.filter(input => input.value.trim() !== "");
        if (preenchidos.length === 1) {
            btnAcaoGlobal.style.display = 'block';
            btnAcaoGlobal.disabled = false;
            btnAcaoGlobal.innerText = "Acessar código";
        } else {
            btnAcaoGlobal.style.display = 'none';
        }
    };

    // Páginas padrão habilitadas (caso não tenha config salva)
    const PAGINAS_PADRAO = ['colaboradores', 'clientes', 'tarefas', 'notafiscal', 'config', 'orcamentos', 'equipamentos'];

    // Carregar configuração de páginas habilitadas
    chrome.storage.local.get(['auvo_paginas_habilitadas'], (result) => {
        const paginasHabilitadas = result.auvo_paginas_habilitadas || PAGINAS_PADRAO;

        // Filtrar apenas as páginas habilitadas
        const paginasFiltradas = PAGINAS_ALVO.filter(p => paginasHabilitadas.includes(p.id));

        paginasFiltradas.forEach(pagina => {
            const itemRow = document.createElement('div');
            itemRow.className = 'auvo-ext-item';

            const labelBtn = document.createElement('div');
            labelBtn.className = 'auvo-ext-label-btn';

            // Usar ícone SVG ao invés de emoji
            const iconeSVG = getIconeSVG(pagina.icone);
            labelBtn.innerHTML = `<span class="auvo-ext-icon-spacer">${iconeSVG}</span> ${pagina.nome}`;

            labelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('[AuvoExt] Clicou em:', pagina.nome, 'URL:', pagina.url);

                // Verificar se é URL externa (como Faturas)
                if (pagina.external) {
                    window.open(pagina.url, '_blank');
                } else {
                    realizarLoginComDestino(pagina.url, botaoOriginal);
                }
            });

            itemRow.appendChild(labelBtn);

            if (pagina.urlId) {
                const input = document.createElement('input');
                input.type = "text";
                input.className = 'auvo-ext-input';
                input.placeholder = "Cód.";
                input.dataset.urlBase = pagina.urlId;
                input.addEventListener('keyup', validarEntradas);
                input.addEventListener('change', validarEntradas);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); e.stopPropagation();
                        const codigo = input.value.trim();
                        if (codigo) realizarLoginComDestino(pagina.urlId + codigo, botaoOriginal);
                    }
                });
                itemRow.appendChild(input);
                todosInputs.push(input);
            }
            container.appendChild(itemRow);
        });
        container.appendChild(btnAcaoGlobal);
    });
}

function renderizarViewProcedimentos(container) {
    const isLatam = isSystemLatam(); // Função do utils.js

    const criarBtnProc = (texto, title, acao) => {
        const btn = document.createElement('button');
        btn.innerText = texto;
        btn.className = 'auvo-btn-proc';
        btn.title = title;
        btn.addEventListener('click', acao);
        return btn;
    };

    // --- GRUPO: Tarefas ---
    const groupTarefas = document.createElement('div');
    groupTarefas.className = 'auvo-proc-group';
    groupTarefas.innerHTML = `<span class="auvo-proc-title">Gestão de Tarefas</span>`;
    
    const bodyTarefas = document.createElement('div');
    bodyTarefas.className = 'auvo-proc-body';
    const inputTarefa = document.createElement('input');
    inputTarefa.type = 'text';
    inputTarefa.className = 'auvo-proc-input';
    inputTarefa.placeholder = "Cód. Tarefa";
    
    const actionsTarefas = document.createElement('div');
    actionsTarefas.className = 'auvo-proc-actions';
    
    // Botões Comuns
    actionsTarefas.appendChild(criarBtnProc("Recuperar", "Recuperar", () => executarProcedimentoTarefa(inputTarefa.value, ':5')));
    actionsTarefas.appendChild(criarBtnProc("Mudar Cliente", "Mover", () => executarProcedimentoTarefa(inputTarefa.value, ':7')));
    
    // Botão Exclusivo Auvo BR
    if (!isLatam) {
        actionsTarefas.appendChild(criarBtnProc("Reabrir", "Reabrir", () => executarProcedimentoTarefa(inputTarefa.value, ':16')));
    }
    
    bodyTarefas.appendChild(inputTarefa);
    bodyTarefas.appendChild(actionsTarefas);
    groupTarefas.appendChild(bodyTarefas);

    // --- GRUPO: Clientes ---
    const groupClientes = document.createElement('div');
    groupClientes.className = 'auvo-proc-group';
    groupClientes.innerHTML = `<span class="auvo-proc-title">Unificar Cliente</span>`;
    const bodyClientes = document.createElement('div');
    bodyClientes.className = 'auvo-proc-body';
    const actionsClientes = document.createElement('div');
    actionsClientes.className = 'auvo-proc-actions';
    
    // Botão Exclusivo Auvo BR
    if (!isLatam) {
        actionsClientes.appendChild(criarBtnProc("Por CNPJ", "Por CNPJ", () => executarProcedimentoDireto(':15')));
    }
    
    // Botão Comum
    actionsClientes.appendChild(criarBtnProc("Por Nome", "Por Nome", () => executarProcedimentoDireto(':8')));
    
    bodyClientes.appendChild(actionsClientes);
    groupClientes.appendChild(bodyClientes);

    container.appendChild(groupTarefas);
    container.appendChild(groupClientes);
}

function renderizarViewServidores(container, botaoOriginal) {
    const msg = document.createElement('div');
    msg.style.cssText = 'font-size: 12px; color: #666; margin-bottom: 10px; text-align: center;';
    msg.innerText = "Selecione o servidor de destino:";
    container.appendChild(msg);

    SERVIDORES_ALVO.forEach(serv => {
        const itemRow = document.createElement('div');
        itemRow.className = 'auvo-ext-item'; 
        const btnServ = document.createElement('div');
        btnServ.className = 'auvo-ext-label-btn'; 
        btnServ.style.width = "100%"; 
        btnServ.innerHTML = `<span class="auvo-ext-icon-spacer">🌐</span> ${serv.nome}`;
        btnServ.addEventListener('click', (e) => {
            e.stopPropagation();
            irParaServidor(serv.id, botaoOriginal);
        });
        itemRow.appendChild(btnServ);
        container.appendChild(itemRow);
    });
}

// Funções de Ação
function irParaServidor(serverId, botaoOriginal) {
    let urlOriginal = botaoOriginal.getAttribute('href');
    if (!urlOriginal || urlOriginal === "#") {
        alert("Não consegui ler o Magic Link deste botão.");
        return;
    }
    const novoSubdominio = serverId ? `app${serverId}` : `app`;
    const novaUrl = urlOriginal.replace(/\/\/app\d*\./, `//${novoSubdominio}.`);
    window.open(novaUrl, '_blank'); 
}

function executarProcedimentoTarefa(codigoTarefa, sufixoLink) {
    const codigoBase = getCodigoBase(); 
    const tarefa = codigoTarefa.trim();
    // Usa a função do utils.js para pegar a URL dinâmica
    const urlBase = getProcedimentoUrlBase();
    const urlFinal = `${urlBase}?Codigo=${codigoBase}${sufixoLink}`;

    if (tarefa) {
        chrome.storage.local.set({ 'auvo_proc_tarefa': tarefa }, function() { window.open(urlFinal, '_blank'); });
    } else {
        chrome.storage.local.remove('auvo_proc_tarefa', function() { window.open(urlFinal, '_blank'); });
    }
}

function executarProcedimentoDireto(sufixoLink) {
    const codigoBase = getCodigoBase();
    // Usa a função do utils.js para pegar a URL dinâmica
    const urlBase = getProcedimentoUrlBase();
    window.open(`${urlBase}?Codigo=${codigoBase}${sufixoLink}`, '_blank');
}

function realizarLoginComDestino(urlDestino, botaoLogin) {
    console.log('[AuvoExt] realizarLoginComDestino - URL Destino:', urlDestino);
    console.log('[AuvoExt] realizarLoginComDestino - Botão Login:', botaoLogin);

    // REVERTIDO: Voltamos a usar apenas o storage, pois o ReturnUrl via GET falhou.
    chrome.storage.local.remove('auvo_destino', function() {
        chrome.storage.local.set({ 'auvo_destino': urlDestino }, function() {
            console.log('[AuvoExt] Storage salvo! Clicando no botão...');
            botaoLogin.click();
        });
    });
}

// Código Extra (Botão Copiar nos Inputs de Select2)
(function() {
    'use strict';

    // Função genérica para adicionar botão de copiar em campos Select2
    function adicionarBotaoCopiar(config) {
        const { selectElementId, buttonId, selectContainerId, buttonTitle, emptyMessage, placeholderText } = config;

        var selectElement = document.getElementById(selectElementId);
        if (!selectElement) return;

        var select2Container = selectElement.nextElementSibling;
        if (!select2Container || !select2Container.classList.contains('select2')) return;

        if (document.getElementById(buttonId)) return; // Evita duplicação

        var parentDiv = selectElement.parentElement;
        parentDiv.style.position = 'relative';

        select2Container.style.marginLeft = '35px';
        select2Container.style.width = 'calc(100% - 35px)';
        select2Container.style.display = 'inline-block';

        var btn = document.createElement('button');
        btn.id = buttonId;
        btn.type = 'button';
        btn.title = buttonTitle;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

        // Calcula a posição do select em relação ao parentDiv para alinhamento perfeito
        var selectRect = selectElement.getBoundingClientRect();
        var parentRect = parentDiv.getBoundingClientRect();
        var topOffset = selectRect.top - parentRect.top;

        // Adiciona 1px para centralizar verticalmente quando altura do botão é 32px
        topOffset += 1;

        btn.style.position = 'absolute';
        btn.style.left = '0';
        btn.style.height = '32px';
        btn.style.boxSizing = 'border-box';
        btn.style.border = '1px solid #ccc';
        btn.style.borderRadius = '4px';
        btn.style.top = topOffset + 'px';
        btn.style.width = '30px';
        btn.style.backgroundColor = '#fff';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.zIndex = '999';
        btn.style.color = '#555';

        btn.onmouseover = function() { btn.style.backgroundColor = '#f8f9fa'; btn.style.borderColor = '#adadad'; };
        btn.onmouseout = function() { btn.style.backgroundColor = '#fff'; btn.style.borderColor = '#ccc'; };

        btn.onclick = function(e) {
            e.preventDefault();
            var containerTexto = document.getElementById(selectContainerId);
            var textoCompleto = containerTexto ? (containerTexto.innerText || containerTexto.title) : "";
            textoCompleto = textoCompleto.trim();

            if (textoCompleto && textoCompleto !== placeholderText) {
                navigator.clipboard.writeText(textoCompleto).then(function() {
                    var originalHTML = btn.innerHTML;
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    setTimeout(function() { btn.innerHTML = originalHTML; }, 1500);
                });
            } else {
                alert(emptyMessage);
            }
        };
        parentDiv.appendChild(btn);
    }

    // Intervalo que monitora e adiciona botões para ambos os campos
    var intervalo = setInterval(function() {
        // Botão para Clientes
        var elClientes = document.getElementById('Clientes');
        if (elClientes && elClientes.nextElementSibling && elClientes.nextElementSibling.classList.contains('select2')) {
            adicionarBotaoCopiar({
                selectElementId: 'Clientes',
                buttonId: 'btn-copy-clientes',
                selectContainerId: 'select2-Clientes-container',
                buttonTitle: 'Copiar Nome Completo do Cliente',
                emptyMessage: 'Selecione um cliente primeiro.',
                placeholderText: 'Clientes *'
            });
        }

        // Botão para Usuarios
        var elUsuarios = document.getElementById('Usuarios');
        if (elUsuarios && elUsuarios.nextElementSibling && elUsuarios.nextElementSibling.classList.contains('select2')) {
            adicionarBotaoCopiar({
                selectElementId: 'Usuarios',
                buttonId: 'btn-copy-usuarios',
                selectContainerId: 'select2-Usuarios-container',
                buttonTitle: 'Copiar Nome Completo do Usuário',
                emptyMessage: 'Selecione um usuário primeiro.',
                placeholderText: 'Usuarios *'
            });
        }
    }, 1000);
})();