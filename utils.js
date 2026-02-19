// =================================================================
// 1. CONFIGURAÇÃO & CONSTANTES GLOBAIS
// =================================================================
const DOMINIOS_SUPORTADOS = [
    "app.auvo.com.br",
    "2workers.me",
    "auditoria.app",
    "cs.auvo.com.br",
    "cs.2workers.me"
];

// Links de Ferramentas (Fixos)
const LINK_MAP_IMPORTER = "http://192.168.92.122:5000/tools/map-importer";
const LINK_VALIDATOR = "http://192.168.92.122:5000/tools/validator";

// Páginas onde o erro de planilha pode aparecer
const URLS_PLANILHA = [
    "/gerenciarClientes",
    "/gerenciarEquipamentos",
    "/gerenciarProdutos",
    "/gerenciarQuestionarios"
];

// Configuração da IA
const GEMINI_API_KEY = "AIzaSyDjM9CEp3fckcIsAf2VLu5EPGk_dqW6pec";
const GEMINI_MODEL = "gemini-2.0-flash";

// URL do backend — atualizar para a URL do Railway após o deploy
// Desenvolvimento local: 'http://localhost:3000'
// Produção: 'https://SEU-APP.up.railway.app'
const BACKEND_URL = 'https://auvotools-extens-o-production.up.railway.app';

// --- ÍCONES SVG (BOOTSTRAP ICONS) ---
const ICONES_SVG = {
    colaboradores: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/></svg>',
    clientes: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/><path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.653a5.4 5.4 0 0 1 1.066-2H1V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9h-2.219c.554.654.89 1.373 1.066 2h.653a1.5 1.5 0 0 0 1.5-1.5V3a2 2 0 0 0-2-2z"/></svg>',
    tarefas: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/></svg>',
    notafiscal: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z"/></svg>',
    config: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/></svg>',
    orcamentos: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M2 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/></svg>',
    equipamentos: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242l-.914.305-.968-.968 5.478-5.478a1 1 0 0 0-.707-1.707H10.5L9.086.586A2 2 0 0 0 7.672 0H7zM4.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-2-8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/></svg>',
    produtos: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/></svg>',
    servicos: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l.601.602a.5.5 0 0 1-.707.708l-.746-.746A6.97 6.97 0 0 1 8 16a6.97 6.97 0 0 1-3.422-.892l-.746.746a.5.5 0 0 1-.707-.708l.602-.602A7.001 7.001 0 0 1 7 2.07V1h-.5A.5.5 0 0 1 6 .5M8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3m0 3a.5.5 0 0 1 .5.5v3.707l1.646 1.647a.5.5 0 0 1-.708.708l-1.792-1.793A.5.5 0 0 1 7.5 10V6.5A.5.5 0 0 1 8 6"/></svg>',
    questionario: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/></svg>',
    fatura: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1"/></svg>'
};

// --- DADOS DO MENU (USADO NO ACESSO.JS) ---
const PAGINAS_ALVO = [
    { id: "colaboradores", nome: "Colaboradores", icone: "colaboradores", url: "/gerenciarColaboradores", urlId: "/gerenciarColaboradores/colaborador/" },
    { id: "clientes", nome: "Clientes", icone: "clientes", url: "/gerenciarClientes", urlId: "/gerenciarClientes/cliente/" },
    { id: "tarefas", nome: "Rel. Tarefas", icone: "tarefas", url: "/relatorioTarefas", urlId: "/relatorioTarefas/DetalheTarefa/" },
    { id: "notafiscal", nome: "Nota Fiscal", icone: "notafiscal", url: "/notafiscal", urlId: null },
    { id: "config", nome: "Config. Gerais", icone: "config", url: "/configuracoesGerais", urlId: null },
    { id: "orcamentos", nome: "Orcamentos", icone: "orcamentos", url: "/Orcamentos", urlId: null },
    { id: "equipamentos", nome: "Equipamentos", icone: "equipamentos", url: "/gerenciarEquipamentos", urlId: null },
    { id: "produtos", nome: "Produtos", icone: "produtos", url: "/gerenciarProdutos", urlId: null },
    { id: "servicos", nome: "Servicos", icone: "servicos", url: "/servico", urlId: null },
    { id: "questionario", nome: "Questionarios", icone: "questionario", url: "/gerenciarQuestionarios", urlId: null },
    { id: "fatura", nome: "Faturas", icone: "fatura", url: "https://app.auvo.com.br/faturas", urlId: null, external: true }
];

// Função para obter o ícone SVG de uma página
function getIconeSVG(iconeKey) {
    return ICONES_SVG[iconeKey] || ICONES_SVG.config;
}

const SERVIDORES_ALVO = [
    { nome: "Servidor 1 (Padrão)", id: "" }, 
    { nome: "Servidor 2", id: "2" },         
    { nome: "Servidor 3", id: "3" },         
    { nome: "Servidor 4", id: "4" }          
];

// =================================================================
// 2. FUNÇÕES AUXILIARES COMPARTILHADAS
// =================================================================

// Verifica se é o sistema LATAM (2workers)
function isSystemLatam() {
    return window.location.href.includes("2workers.me");
}

// Retorna a URL base correta dependendo do sistema
function getProcedimentoUrlBase() {
    if (isSystemLatam()) {
        return "https://cs.2workers.me/Procedimento/GerenciadorDeProcedimentos";
    }
    return "https://cs.auvo.com.br/Procedimento/GerenciadorDeProcedimentos";
}

// Verifica se está em um domínio válido
function verificarDominioSuportado() {
    return DOMINIOS_SUPORTADOS.some(dominio => window.location.href.includes(dominio));
}

// Tenta pegar o ID principal da tela (Cliente ID, Tarefa ID, etc)
function getCodigoBase() {
    // Tenta Select2
    const elTexto = document.querySelector('.select2-selection__rendered');
    if (elTexto) {
        const texto = elTexto.innerText || "";
        if (texto.includes("-")) return texto.split("-")[0].trim();
        if (texto.match(/^\d+/)) return texto.match(/^\d+/)[0];
    }
    // Tenta Input normal
    const inputs = document.querySelectorAll('input[type="text"]:not(.auvo-ext-input):not(.auvo-proc-input)');
    for (let input of inputs) {
        if (input.offsetParent !== null && input.value) {
            const match = input.value.trim().match(/^(\d+)/);
            if (match) return match[1];
        }
    }
    return "";
}

// Ajusta o layout do vizinho quando o botão de login muda de tamanho
function ajustarVizinho(wrapper) {
    try {
        let colunaAtual = wrapper.parentElement;
        let tentativas = 0;
        while (colunaAtual && (!colunaAtual.className || !colunaAtual.className.includes('col-')) && tentativas < 4) {
            colunaAtual = colunaAtual.parentElement;
            tentativas++;
        }
        if (colunaAtual) {
            const colunaVizinha = colunaAtual.nextElementSibling;
            if (colunaVizinha) {
                const estiloVizinho = window.getComputedStyle(colunaVizinha);
                const paddingOriginal = parseInt(estiloVizinho.paddingLeft) || 15;
                colunaVizinha.style.paddingLeft = (paddingOriginal + 45) + 'px';
                colunaVizinha.style.transition = "padding 0.2s ease";
            }
        }
    } catch (e) {}
}

// =================================================================
// 3. GERENCIADOR DE CONFIGURAÇÕES (MODO PRINT)
// =================================================================
(function iniciarConfiguracoes() {

    // Função para aplicar/remover o ocultamento apenas dos botões de IA
    const aplicarModoPrint = (ativado) => {
        if (ativado) {
            // Oculta apenas os botões de IA das notas fiscais
            document.body.classList.add('auvo-ext-hide-ai');
        } else {
            document.body.classList.remove('auvo-ext-hide-ai');
        }
    };

    // Verificar se chrome APIs estão disponíveis
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('[Auvo Tools] Chrome APIs não disponíveis');
        return;
    }

    // 1. Verifica estado inicial ao carregar a página
    chrome.storage.local.get(['auvo_config_print_mode'], (result) => {
        aplicarModoPrint(result.auvo_config_print_mode);
    });

    // 2. Escuta mudanças em tempo real (sem precisar de refresh)
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.auvo_config_print_mode) {
            aplicarModoPrint(changes.auvo_config_print_mode.newValue);
        }
    });

})();