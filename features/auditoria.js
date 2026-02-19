// =================================================================
// 1. BOTÃO DE LEITURA DE BANCO DE DADOS NA ABA EXCEÇÕES
// =================================================================

if (verificarDominioSuportado() && window.location.href.includes('/Suporte/AuditoriaAPP')) {
    console.log("AuvoExt: Monitorando página de Auditoria...");
    adicionarBotaoBancoDados();
}

function adicionarBotaoBancoDados() {
    // Link do Google Docs (pode ser alterado depois)
    const LINK_BANCO_DADOS = "https://docs.google.com/document/d/19YRChP5CSw9fsGvmoelsKUEt2xOikchEp_vmMdHR_zo/edit?tab=t.0";

    const observer = new MutationObserver(() => {
        // Procura pela aba "Exceções"
        const abaExcecoes = Array.from(document.querySelectorAll('a[data-toggle="tab"]'))
            .find(tab => tab.textContent.trim().toLowerCase().includes('exceções') ||
                         tab.textContent.trim().toLowerCase().includes('excecoes'));

        if (abaExcecoes && !abaExcecoes.dataset.auvoExtProcessed) {
            abaExcecoes.dataset.auvoExtProcessed = "true";

            // Cria o botão
            const btnBancoDados = document.createElement('a');
            btnBancoDados.href = LINK_BANCO_DADOS;
            btnBancoDados.target = "_blank";
           
            btnBancoDados.title = "Abrir leitor de banco de dados";
        

            // Adiciona o botão ao lado da aba (ou dentro dela)
            const parentContainer = abaExcecoes.parentElement;
            if (parentContainer) {
                // Se a aba estiver dentro de uma lista, adiciona ao lado
                if (parentContainer.tagName === 'LI') {
                    const btnContainer = document.createElement('li');
                    btnContainer.style.marginLeft = '10px';
                    btnContainer.appendChild(btnBancoDados);
                    parentContainer.parentElement.insertBefore(btnContainer, parentContainer.nextSibling);
                } else {
                    // Caso contrário, adiciona logo após
                    abaExcecoes.insertAdjacentElement('afterend', btnBancoDados);
                }
            }
        }

        // Adiciona botão ao lado do "Limpar Exceções do Usuário"
        const painelExcecoes = document.getElementById('Excecoes');
        if (painelExcecoes && !painelExcecoes.dataset.auvoExtProcessed) {
            painelExcecoes.dataset.auvoExtProcessed = "true";

            // Procura o botão "Limpar Exceções do Usuário"
            const btnLimpar = painelExcecoes.querySelector('button.btn-danger, a.btn-danger, .btn-danger');

            if (btnLimpar) {
                const btnBanco = document.createElement('a');
                btnBanco.href = LINK_BANCO_DADOS;
                btnBanco.target = "_blank";
                btnBanco.className = "btn btn-primary auvo-btn-banco-inline";
                btnBanco.style.cssText = "margin-left: 10px; display: inline-flex; align-items: center; gap: 8px;";
                btnBanco.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                    Abrir Leitor de Banco de Dados
                `;

                // Insere ao lado do botão Limpar
                btnLimpar.insertAdjacentElement('afterend', btnBanco);
            }
        }

        // Adiciona botões de download em cada registro de exceção
        adicionarBotoesDownloadExcecoes();
    });

    function adicionarBotoesDownloadExcecoes() {
        const painelExcecoes = document.getElementById('Excecoes');
        if (!painelExcecoes) return;

        // Procura especificamente pelos cards de exceção (div.card dentro da tabela)
        const cards = painelExcecoes.querySelectorAll('div.card.col-md-12');

        cards.forEach(card => {
            // Verifica se já foi processado
            if (card.dataset.auvoDownloadProcessed) return;

            // Procura o textarea dentro do card-body que contém o link completo
            const textarea = card.querySelector('textarea.form-control');
            if (!textarea) return;

            const textoTextarea = textarea.value || textarea.textContent;

            // Procura pelo link completo (terminando em .db3 ou .db)
            const linkMatch = textoTextarea.match(/https:\/\/[^\s"'<>]+\.db3?/i) ||
                             textoTextarea.match(/https:\/\/auvo[^\s"'<>]+/i);

            if (linkMatch) {
                card.dataset.auvoDownloadProcessed = "true";

                // Extrai o link completo
                const linkDownload = linkMatch[0];

                // Procura o card-header para adicionar o botão lá
                const cardHeader = card.querySelector('.card-header');

                if (cardHeader) {
                    // Cria o botão de download
                    const btnDownload = document.createElement('a');
                    btnDownload.href = linkDownload;
                    btnDownload.target = "_blank";
                    btnDownload.className = "btn btn-success btn-sm auvo-btn-download-db";
                    btnDownload.title = "Baixar arquivo de banco de dados";
                    btnDownload.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Baixar DB
                    `;

                    // Adiciona ao final do card-header
                    cardHeader.style.display = "flex";
                    cardHeader.style.justifyContent = "space-between";
                    cardHeader.style.alignItems = "center";
                    cardHeader.appendChild(btnDownload);
                }
            }
        });
    }

    observer.observe(document.body, { childList: true, subtree: true });
}
