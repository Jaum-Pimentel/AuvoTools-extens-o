// =================================================================
// 0. CONFIGURAÇÃO eNotas
// =================================================================
const ENOTAS_API_KEY = "ZTA0NzA4MDAtMTNkOS00MmVkLTg1YzQtOWFjYzFjMTcwNzAw";
const ICONE_CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ICONE_ALERTA_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
const ICONE_ERRO_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
const ICONE_LOADER_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="auvo-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>';
const ICONE_BUSCA_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
const ICONE_HABILITAR_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
let enotasEmpresaAtual = null;

// =================================================================
// 1. INICIALIZAÇÃO DE MONITORAMENTO (NF, PLANILHA, DATA ID, eNotas)
// =================================================================

if (verificarDominioSuportado()) {
    monitorarErrosNF();
    monitorarErroPlanilha();
    enableCopyDataId();
    injetarBotaoENotas();
}

// =================================================================
// 2. ERROS DE NOTA FISCAL & IA
// =================================================================

function monitorarErrosNF() {
    if (!window.location.href.includes('/notafiscal')) return;
    
    console.log("AuvoExt: Monitorando erros de NF...");
    const observer = new MutationObserver((mutations) => {
        const errosEncontrados = document.querySelectorAll('small.text-danger, .alert-danger, .text-danger, span[style*="color: red"]');

        errosEncontrados.forEach(el => {
            if (el.innerText.length > 10 && !el.dataset.auvoExtProcessed) {
                const txt = el.innerText.toLowerCase();
                const palavrasChave = [
                    'erro', 'rejeição', 'falha', 'inválid', 
                    'descrição', 'código', 'correção', 'atenção', 'schema',
                    'ncm', 'cfop', 'rejeicao', 'chave de acesso'
                ];
                
                if (palavrasChave.some(palavra => txt.includes(palavra))) {
                    el.dataset.auvoExtProcessed = "true";
                    criarBotoesSolucao(el, txt); 
                }
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function criarBotoesSolucao(elementoErro, textoErroMinusculo) {
    const containerBtn = document.createElement('div');
    containerBtn.style.marginTop = "5px";
    containerBtn.style.display = "flex";
    containerBtn.style.flexWrap = "wrap";

    // Botão IA (com verificação do Modo Print)
    const btnIA = document.createElement('button');
    btnIA.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-5.5a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1z"/></svg> ANALISAR ERRO (IA)`;
    btnIA.className = "auvo-tool-btn btn-ia-roxo auvo-ext-ai-button";

    btnIA.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation();
        const textoOriginal = btnIA.innerHTML;
        btnIA.innerHTML = "⏳ CONSULTANDO...";
        btnIA.disabled = true;

        const textoErro = elementoErro.innerText.trim();
        const solucao = await consultarGemini(textoErro);

        mostrarModalSolucao(solucao);
        btnIA.innerHTML = textoOriginal;
        btnIA.disabled = false;
    });
    containerBtn.appendChild(btnIA);

    // Botão Schema
    if (textoErroMinusculo.includes("schema")) {
        const btnSchema = document.createElement('a');
        btnSchema.href = LINK_VALIDATOR;
        btnSchema.target = "_blank";
        btnSchema.className = "auvo-tool-btn btn-schema-laranja";
        btnSchema.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> VALIDAR SCHEMA`;
        containerBtn.appendChild(btnSchema);
    }
    
    if(elementoErro.parentNode) {
        elementoErro.parentNode.appendChild(containerBtn);
    } else {
        elementoErro.appendChild(containerBtn);
    }
}

function mostrarModalSolucao(solucao) {
    // Remove modal anterior se existir
    const modalExistente = document.querySelector('.auvo-modal-overlay');
    if (modalExistente) modalExistente.remove();

    // Formata o texto (converte **texto** em negrito)
    const textoFormatado = solucao
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    // Cria o overlay
    const overlay = document.createElement('div');
    overlay.className = 'auvo-modal-overlay';

    // Cria o modal
    overlay.innerHTML = `
        <div class="auvo-modal-solucao">
            <div class="auvo-modal-header">
                <div class="auvo-modal-titulo">
                    <span class="auvo-modal-titulo-icone">🤖</span>
                    <span>Solução Sugerida</span>
                </div>
                <button class="auvo-modal-btn-fechar" title="Fechar">×</button>
            </div>
            <div class="auvo-modal-body">
                <div class="auvo-modal-conteudo">${textoFormatado}</div>
            </div>
            <div class="auvo-modal-footer">
                <button class="auvo-modal-btn auvo-modal-btn-copiar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copiar
                </button>
                <button class="auvo-modal-btn auvo-modal-btn-ok">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Eventos
    const btnFechar = overlay.querySelector('.auvo-modal-btn-fechar');
    const btnOk = overlay.querySelector('.auvo-modal-btn-ok');
    const btnCopiar = overlay.querySelector('.auvo-modal-btn-copiar');

    const fecharModal = () => {
        overlay.style.animation = 'auvoFadeIn 0.2s ease reverse';
        setTimeout(() => overlay.remove(), 150);
    };

    btnFechar.addEventListener('click', fecharModal);
    btnOk.addEventListener('click', fecharModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharModal();
    });

    // Botão copiar
    btnCopiar.addEventListener('click', () => {
        navigator.clipboard.writeText(solucao).then(() => {
            btnCopiar.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copiado!
            `;
            btnCopiar.classList.add('copiado');
            setTimeout(() => {
                btnCopiar.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copiar
                `;
                btnCopiar.classList.remove('copiado');
            }, 2000);
        });
    });

    // Fecha com ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            fecharModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

async function consultarGemini(textoErro) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("COLE_SUA")) {
        return "Erro: Chave de API não configurada.";
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const contextoSistema = `Você é um especialista no sistema Auvo e em NFS-e. Analise o erro técnico abaixo e explique para um usuário leigo como resolver. Seja breve.`;
    const payload = {
        contents: [{ parts: [{ text: `${contextoSistema}\n\nErro: "${textoErro}"` }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.error) return "Erro na IA: " + data.error.message;
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "Falha de conexão com a IA.";
    }
}

// =================================================================
// 3. ERRO DE PLANILHA (INCLUÍDO AQUI CONFORME ESTRUTURA)
// =================================================================
function monitorarErroPlanilha() {
    const paginaAtual = window.location.href;
    const ehPaginaAlvo = URLS_PLANILHA.some(url => paginaAtual.includes(url));
    if (!ehPaginaAlvo) return;

    console.log("AuvoExt: Monitorando planilha...");
    const observerPlanilha = new MutationObserver((mutations) => {
        const elementosTexto = document.querySelectorAll('.swal2-html-container, .swal2-content, .sweet-alert p, .modal-body');
        elementosTexto.forEach(el => {
            if (el.innerText && el.innerText.includes("planilha não possui todas as colunas") && !el.dataset.auvoExtProcessed) {
                if (el.querySelector('.btn-map-azul')) return;
                el.dataset.auvoExtProcessed = "true";
                
                const btnPadronizar = document.createElement('a');
                btnPadronizar.href = LINK_MAP_IMPORTER;
                btnPadronizar.target = "_blank"; 
                btnPadronizar.className = "auvo-tool-btn btn-map-azul";
                btnPadronizar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PADRONIZAR PLANILHA`;
                
                el.appendChild(document.createElement('br')); 
                el.appendChild(btnPadronizar);
            }
        });
    });
    observerPlanilha.observe(document.body, { childList: true, subtree: true });
}

// =================================================================
// 4. COPIAR DATA ID (INCLUÍDO AQUI CONFORME ESTRUTURA)
// =================================================================
function enableCopyDataId() {
    if (!window.location.href.includes('/notafiscal')) return;

    console.log("AuvoExt: 🕵️ Iniciando monitoramento de menus para DataID...");
    
    const injetarBotoes = () => {
        const containers = document.querySelectorAll('div[data-id]');
        if (containers.length === 0) return;

        containers.forEach(container => {
            const menu = container.querySelector('.dropdown-menu');
            if (!menu || menu.querySelector('.auvo-ext-copy-id')) return;
            const dataId = container.getAttribute('data-id');
            if (!dataId) return;

            const linkCopy = document.createElement('a');
            linkCopy.className = 'dropdown-item auvo-ext-copy-id';
            linkCopy.href = '#';
            linkCopy.innerHTML = `<i class="fas fa-fingerprint"></i> Copiar DataID`;

            linkCopy.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                navigator.clipboard.writeText(dataId).then(() => {
                    linkCopy.innerHTML = `<i class="fas fa-check"></i> Copiado!`;
                    linkCopy.classList.add('copiado');
                    setTimeout(() => {
                        linkCopy.innerHTML = `<i class="fas fa-fingerprint"></i> Copiar DataID`;
                        linkCopy.classList.remove('copiado');
                        document.body.click();
                    }, 1500);
                });
            });

            const linkAuditoria = document.createElement('a');
            linkAuditoria.className = 'dropdown-item auvo-ext-consultar-nf';
            linkAuditoria.href = '#';
            linkAuditoria.innerHTML = `<i class="fas fa-database"></i> Consultar Auditoria`;

            linkAuditoria.addEventListener('click', async function(e) {
                e.preventDefault(); e.stopPropagation();
                linkAuditoria.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Consultando...`;
                try {
                    const dbCredentials = await new Promise(resolve => {
                        chrome.storage.local.get(['auvo_db_config'], r => resolve(r.auvo_db_config || null));
                    });
                    if (!dbCredentials || !dbCredentials.host) {
                        mostrarModalAuditoriaNF(null, dataId, 'Credenciais não configuradas. Clique no ícone da extensão → Banco de Dados → preencha e salve.');
                        return;
                    }
                    const resp = await fetch('${BACKEND_URL}/api/nf/auditoria', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entityId: dataId, dbCredentials })
                    });
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const { rows } = await resp.json();
                    mostrarModalAuditoriaNF(rows, dataId);
                } catch (err) {
                    mostrarModalAuditoriaNF(null, dataId, err.message);
                } finally {
                    linkAuditoria.innerHTML = `<i class="fas fa-database"></i> Consultar Auditoria`;
                    document.body.click();
                }
            });

            const divider = document.createElement('div');
            divider.className = 'dropdown-divider';
            menu.appendChild(divider);
            menu.appendChild(linkCopy);
            menu.appendChild(linkAuditoria);
        });
    };

    injetarBotoes();
    const observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0)) injetarBotoes();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// =================================================================
// 5. BUSCAR ID eNotas (CONFIGURAÇÕES GERAIS)
// =================================================================

function injetarBotaoENotas() {
    if (!window.location.href.includes('/configuracoesGerais')) return;

    const tentarInjetar = () => {
        const tabNF = document.querySelector('.tab-pane.config-nota-fiscal');
        if (!tabNF) return false;

        const headers = tabNF.querySelectorAll('h4');

        for (const h4 of headers) {
            const texto = h4.textContent.trim();
            if (texto.includes('Dados da empresa') && !h4.dataset.auvoEnotasProcessed) {
                h4.dataset.auvoEnotasProcessed = "true";
                criarBotaoENotas(h4);
                criarDropdownStatusENotas(tabNF);
                return true;
            }
        }
        return false;
    };

    if (!tentarInjetar()) {
        const obs = new MutationObserver(() => {
            if (tentarInjetar()) obs.disconnect();
        });
        obs.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
}

function criarBotaoENotas(h4Element) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'auvo-btn-enotas-ghost';
    btn.innerHTML = `${ICONE_BUSCA_SVG} Consultar eNotas`;

    btn.addEventListener('click', async () => {
        const inputRazao = document.getElementById('razaoSocial');
        const razaoSocial = inputRazao ? inputRazao.value.trim() : '';

        if (!razaoSocial) {
            btn.innerHTML = `${ICONE_ALERTA_SVG} Razão Social vazia`;
            resetarBotao(btn);
            return;
        }

        btn.innerHTML = `${ICONE_LOADER_SVG} Buscando...`;
        btn.disabled = true;

        try {
            const empresa = await buscarEmpresaENotas(razaoSocial);

            if (empresa) {
                enotasEmpresaAtual = empresa;
                await navigator.clipboard.writeText(empresa.id);
                btn.innerHTML = `${ICONE_CHECK_SVG} ID Copiado!`;
                // Normaliza: qualquer variação de "habilit" → "Habilitada", senão → "Desabilitada"
                const statusNormalizado = (empresa.status || '').toLowerCase().includes('habilit')
                    && !(empresa.status || '').toLowerCase().includes('desabilit')
                    ? 'Habilitada' : 'Desabilitada';
                atualizarDropdownStatus(statusNormalizado);
            } else {
                btn.innerHTML = `${ICONE_ALERTA_SVG} Não encontrado`;
                atualizarDropdownStatus(null);
            }
        } catch (error) {
            console.error('AuvoExt: Erro ao buscar eNotas', error);
            btn.innerHTML = `${ICONE_ERRO_SVG} Erro na API`;
            atualizarDropdownStatus(null);
        }

        btn.disabled = false;
        resetarBotao(btn);
    });

    h4Element.appendChild(btn);
}

async function buscarEmpresaENotas(razaoSocial) {
    const params = new URLSearchParams({
        pageNumber: '0',
        pageSize: '1',
        searchBy: 'razao_social',
        searchTerm: razaoSocial,
        sortBy: 'nome_fantasia',
        sortDirection: 'asc'
    });

    const response = await fetch(`https://api.enotasgw.com.br/v1/empresas?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + ENOTAS_API_KEY
        }
    });

    if (!response.ok) {
        const erroBody = await response.text();
        console.error(`AuvoExt eNotas: HTTP ${response.status} - ${erroBody}`);
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.data && data.data.length > 0) {
        return data.data[0];
    }
    return null;
}

// --- Status eNotas: Campo readonly + Botão Habilitar ---

function criarDropdownStatusENotas(tabNF) {
    const regimeTribLabel = tabNF.querySelector('label[for="regimeTributacao"]');
    if (!regimeTribLabel) return;

    const rowContainer = regimeTribLabel.closest('.row');
    if (!rowContainer) return;

    const col = document.createElement('div');
    col.className = 'form-group col-md-3';
    col.id = 'auvo-enotas-status-col';

    const label = document.createElement('label');
    label.textContent = 'Status eNotas';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';

    // Input readonly que imita os campos do sistema
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'auvo-enotas-status-input';
    input.className = 'form-control';
    input.readOnly = true;
    input.value = '—';
    input.style.flex = '1';

    // Botão Habilitar (oculto por padrão, só aparece quando Desabilitada)
    const btnHabilitar = document.createElement('button');
    btnHabilitar.type = 'button';
    btnHabilitar.id = 'auvo-enotas-btn-habilitar';
    btnHabilitar.className = 'auvo-btn-enotas-habilitar';
    btnHabilitar.innerHTML = `${ICONE_HABILITAR_SVG} Habilitar`;
    btnHabilitar.style.display = 'none';

    wrapper.appendChild(input);
    wrapper.appendChild(btnHabilitar);
    col.appendChild(label);
    col.appendChild(wrapper);
    rowContainer.appendChild(col);

    // Clique no Habilitar
    btnHabilitar.addEventListener('click', async () => {
        if (!enotasEmpresaAtual) return;

        const empresaId = enotasEmpresaAtual.id;

        btnHabilitar.disabled = true;
        btnHabilitar.innerHTML = ICONE_LOADER_SVG;

        try {
            const response = await fetch(`https://api.enotasgw.com.br/v1/empresas/${empresaId}/habilitar`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + ENOTAS_API_KEY
                }
            });

            if (!response.ok) {
                const erroBody = await response.text();
                console.error(`AuvoExt eNotas habilitar: HTTP ${response.status} - ${erroBody}`);
                alert(`Erro ao habilitar empresa no eNotas (HTTP ${response.status})`);
            } else {
                enotasEmpresaAtual.status = 'Habilitada';
                atualizarDropdownStatus('Habilitada');
            }
        } catch (error) {
            console.error('AuvoExt eNotas: Erro ao habilitar', error);
            alert('Erro de conexão ao habilitar empresa no eNotas');
        } finally {
            btnHabilitar.disabled = false;
            btnHabilitar.innerHTML = `${ICONE_HABILITAR_SVG} Habilitar`;
        }
    });
}

function atualizarDropdownStatus(status) {
    const input = document.getElementById('auvo-enotas-status-input');
    const btnHabilitar = document.getElementById('auvo-enotas-btn-habilitar');
    if (!input) return;

    if (status) {
        input.value = status;
        // Só mostra o botão Habilitar se estiver Desabilitada
        if (btnHabilitar) {
            btnHabilitar.style.display = status === 'Desabilitada' ? 'inline-flex' : 'none';
        }
    } else {
        input.value = '—';
        if (btnHabilitar) btnHabilitar.style.display = 'none';
    }
}

function resetarBotao(btn) {
    setTimeout(() => {
        btn.innerHTML = `${ICONE_BUSCA_SVG} Consultar eNotas`;
    }, 3000);
}

// =================================================================
// 6. MODAL AUDITORIA NF (CONSULTA MYSQL)
// =================================================================
function mostrarModalAuditoriaNF(rows, dataId, erroMsg) {
    const modalExistente = document.querySelector('.auvo-modal-overlay');
    if (modalExistente) modalExistente.remove();

    let conteudo = '';

    if (erroMsg) {
        conteudo = `
            <div style="color:#c62828;background:#ffebee;border-radius:8px;padding:12px;font-size:13px;">
                <strong>Erro ao consultar:</strong> ${escapeHtml(erroMsg)}<br>
                <span style="color:#666;font-size:12px;">Verifique se o backend está rodando em localhost:3000 e o MySQL está configurado.</span>
            </div>`;
    } else if (!rows || rows.length === 0) {
        conteudo = `<p style="color:#666;text-align:center;padding:20px;">Nenhum registro encontrado para o DataID: <strong>${escapeHtml(dataId)}</strong></p>`;
    } else {
        rows.forEach((row) => {
            let dataFormatada;
            try {
                const parsed = JSON.parse(row.Data);
                dataFormatada = `<pre class="auvo-nf-data-pre">${escapeHtml(JSON.stringify(parsed, null, 2))}</pre>`;
            } catch {
                dataFormatada = `<pre class="auvo-nf-data-pre">${escapeHtml(String(row.Data ?? '—'))}</pre>`;
            }

            conteudo += `
                <div class="auvo-nf-auditoria-card">
                    <table class="auvo-nf-auditoria-table">
                        <tr><td class="auvo-nf-label">Número NF</td><td class="auvo-nf-valor">${escapeHtml(String(row.NumeroNf ?? '—'))}</td></tr>
                        <tr><td class="auvo-nf-label">eNotas Empresa ID</td><td class="auvo-nf-valor">${escapeHtml(String(row.ENotasEmpresaId ?? '—'))}</td></tr>
                        <tr><td class="auvo-nf-label">Transmissão ID</td><td class="auvo-nf-valor">${escapeHtml(String(row.transmissaoId ?? '—'))}</td></tr>
                        <tr><td class="auvo-nf-label">Data Cadastro</td><td class="auvo-nf-valor">${escapeHtml(String(row.DataCadastro ?? '—'))}</td></tr>
                        <tr><td class="auvo-nf-label">eNotas NF ID</td><td class="auvo-nf-valor">${escapeHtml(String(row.ENotasNfId ?? '—'))}</td></tr>
                    </table>
                    <div class="auvo-nf-data-block">
                        <span class="auvo-nf-data-label">Data (JSON NF):</span>
                        ${dataFormatada}
                    </div>
                </div>`;
        });
    }

    const overlay = document.createElement('div');
    overlay.className = 'auvo-modal-overlay';
    overlay.innerHTML = `
        <div class="auvo-modal-solucao auvo-modal-auditoria">
            <div class="auvo-modal-header">
                <div class="auvo-modal-titulo">
                    <span class="auvo-modal-titulo-icone">🗃️</span>
                    <span>Auditoria NF${rows ? ` — ${rows.length} registro(s)` : ''}</span>
                </div>
                <button class="auvo-modal-btn-fechar" title="Fechar">×</button>
            </div>
            <div class="auvo-modal-body auvo-modal-body-scroll">
                <div style="font-size:11px;color:#999;margin-bottom:10px;">DataID: ${escapeHtml(dataId)}</div>
                ${conteudo}
            </div>
            <div class="auvo-modal-footer">
                <button class="auvo-modal-btn auvo-modal-btn-ok">Fechar</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    const fecharModal = () => {
        overlay.style.animation = 'auvoFadeIn 0.2s ease reverse';
        setTimeout(() => overlay.remove(), 150);
    };

    overlay.querySelector('.auvo-modal-btn-fechar').addEventListener('click', fecharModal);
    overlay.querySelector('.auvo-modal-btn-ok').addEventListener('click', fecharModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModal(); });
    const handleEsc = (e) => {
        if (e.key === 'Escape') { fecharModal(); document.removeEventListener('keydown', handleEsc); }
    };
    document.addEventListener('keydown', handleEsc);
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}