// ============================================
// SISTEMA DE CHAT COM IA - AUVO TOOLS
// ============================================
// Balão de conversa com IA treinada nos manuais
// Usa RAG (Retrieval-Augmented Generation)

const CHAT_CONFIG = {
  apiKey: 'AIzaSyDxVvi9sGkSJPasp4fawBCsqUvQUKz-fWc',
  model: 'gemini-2.5-flash',
  get manuaisJsonUrl() {
    // Lazy getter - só acessa chrome.runtime quando necessário
    return chrome.runtime.getURL('manuais.json');
  }
};

// ============================================
// CARREGADOR DE MANUAIS (Indexação)
// ============================================
let manuaisIndexados = [];
let chatHabilitado = false;
let historicoConversa = [];       // Histórico de turnos {role, parts}
const MAX_HISTORICO_TURNS = 10;   // Máximo de 10 trocas (20 mensagens) mantidas

// Inicializar: carregar configuração e manuais
async function inicializarChatIA() {
  // Verificar se chrome APIs estão disponíveis
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.runtime) {
    console.warn('[Chat IA] Chrome APIs não disponíveis');
    return;
  }

  // Verificar se o chat está habilitado
  const config = await chrome.storage.local.get(['chatIAHabilitado']);
  chatHabilitado = config.chatIAHabilitado ?? false;

  if (!chatHabilitado) {
    console.log('[Chat IA] Desabilitado pelo usuário');
    return;
  }

  console.log('[Chat IA] Inicializando...');

  // Carregar índice dos manuais (pré-processado)
  await carregarManuais();

  // Criar interface do chat
  criarBalaoChat();
}

// Carregar manuais do arquivo JSON
async function carregarManuais() {
  try {
    // Tentar carregar do cache primeiro
    const cached = await chrome.storage.local.get(['manuaisCache']);

    if (cached.manuaisCache && cached.manuaisCache.length > 0) {
      manuaisIndexados = cached.manuaisCache;
      console.log(`[Chat IA] ${manuaisIndexados.length} manuais carregados (cache)`);
      return;
    }

    // Se não tiver cache, buscar do JSON
    console.log('[Chat IA] Carregando manuais do JSON...');
    const response = await fetch(CHAT_CONFIG.manuaisJsonUrl);

    if (!response.ok) {
      throw new Error(`Erro ao carregar manuais.json: ${response.status}`);
    }

    manuaisIndexados = await response.json();

    // Salvar no cache
    await chrome.storage.local.set({ manuaisCache: manuaisIndexados });

    console.log(`[Chat IA] ${manuaisIndexados.length} manuais carregados do JSON`);

  } catch (erro) {
    console.error('[Chat IA] Erro ao carregar manuais:', erro);
    manuaisIndexados = [];
  }
}

// ============================================
// INTERFACE DO CHAT (Balão Flutuante)
// ============================================
function criarBalaoChat() {
  // Verificar se já existe
  if (document.getElementById('auvo-chat-container')) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'auvo-chat-container';
  container.className = 'auvo-chat-minimizado';

  container.innerHTML = `
    <div class="auvo-chat-header" id="auvo-chat-header">
      <div class="auvo-chat-titulo">
        <span class="auvo-chat-icone">🤖</span>
        <span>Assistente AuvoTools</span>
      </div>
      <div class="auvo-chat-acoes">
        <button class="auvo-chat-btn-minimizar" id="auvo-chat-minimizar" title="Minimizar">−</button>
        <button class="auvo-chat-btn-fechar" id="auvo-chat-fechar" title="Fechar">×</button>
      </div>
    </div>

    <div class="auvo-chat-body" id="auvo-chat-body">
      <div class="auvo-chat-mensagens" id="auvo-chat-mensagens">
        <div class="auvo-chat-msg auvo-chat-msg-ia">
          <div class="auvo-chat-avatar">🤖</div>
          <div class="auvo-chat-texto">
            Olá! Sou o assistente virtual da Auvo. Posso ajudá-lo com dúvidas sobre:
            <ul>
              <li>Integrações (Omie, Bling, Conta Azul)</li>
              <li>Notas Fiscais</li>
              <li>Contratos</li>
              <li>Funcionalidades do sistema</li>
            </ul>
            Como posso ajudar?
          </div>
        </div>
      </div>

      <div class="auvo-chat-input-container">
        <textarea
          id="auvo-chat-input"
          placeholder="Digite sua pergunta..."
          rows="1"
        ></textarea>
        <button id="auvo-chat-enviar" class="auvo-chat-btn-enviar" title="Enviar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <button class="auvo-chat-fab" id="auvo-chat-fab" title="Abrir assistente">
      <span class="auvo-chat-fab-icone">💬</span>
    </button>
  `;

  document.body.appendChild(container);

  // Event Listeners
  configurarEventosChat();
}

function configurarEventosChat() {
  const container = document.getElementById('auvo-chat-container');
  const fab = document.getElementById('auvo-chat-fab');
  const minimizar = document.getElementById('auvo-chat-minimizar');
  const fechar = document.getElementById('auvo-chat-fechar');
  const input = document.getElementById('auvo-chat-input');
  const enviar = document.getElementById('auvo-chat-enviar');

  // Abrir chat
  fab.addEventListener('click', () => {
    container.classList.remove('auvo-chat-minimizado');
    container.classList.add('auvo-chat-aberto');
    input.focus();
  });

  // Minimizar
  minimizar.addEventListener('click', () => {
    container.classList.remove('auvo-chat-aberto');
    container.classList.add('auvo-chat-minimizado');
  });

  // Fechar (limpa histórico para próxima sessão)
  fechar.addEventListener('click', () => {
    container.classList.remove('auvo-chat-aberto');
    container.classList.add('auvo-chat-minimizado');
    historicoConversa = [];
  });

  // Enviar mensagem
  enviar.addEventListener('click', enviarMensagem);

  // Enter para enviar (Shift+Enter para nova linha)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  });

  // Auto-resize do textarea
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });
}

// ============================================
// LÓGICA DE ENVIO E RESPOSTA
// ============================================
async function enviarMensagem() {
  const input = document.getElementById('auvo-chat-input');
  const mensagensContainer = document.getElementById('auvo-chat-mensagens');
  const pergunta = input.value.trim();

  if (!pergunta) return;

  // Adicionar mensagem do usuário
  adicionarMensagem('usuario', pergunta);
  input.value = '';
  input.style.height = 'auto';

  // Mostrar indicador de digitação
  const indicadorId = mostrarIndicadorDigitacao();

  try {
    // Garantir que manuais estão carregados
    await carregarManuais();

    // Para perguntas curtas de follow-up, combinar com a última pergunta do usuário
    // para melhorar a busca no RAG (ex: "E de questionário?" sozinho acha pouca coisa)
    const ultimaPerguntaUsuario = historicoConversa.length >= 2
      ? historicoConversa[historicoConversa.length - 2]?.parts[0]?.text || ''
      : '';
    const ehFollowUp = pergunta.split(' ').length < 5 && ultimaPerguntaUsuario;
    const perguntaParaRAG = ehFollowUp
      ? `${ultimaPerguntaUsuario} ${pergunta}`
      : pergunta;

    // Buscar contexto relevante nos manuais
    const contexto = buscarContextoRelevante(perguntaParaRAG);

    // Chamar IA passando o histórico da conversa
    const resposta = await consultarIA(pergunta, contexto, historicoConversa);

    // Remover indicador e mostrar resposta
    removerIndicadorDigitacao(indicadorId);
    adicionarMensagem('ia', resposta);

    // Adicionar ao histórico (pergunta limpa + resposta)
    historicoConversa.push({ role: 'user',  parts: [{ text: pergunta }] });
    historicoConversa.push({ role: 'model', parts: [{ text: resposta  }] });

    // Limitar tamanho do histórico para não explodir tokens
    if (historicoConversa.length > MAX_HISTORICO_TURNS * 2) {
      historicoConversa = historicoConversa.slice(-MAX_HISTORICO_TURNS * 2);
    }

  } catch (erro) {
    console.error('[Chat IA] Erro:', erro);
    removerIndicadorDigitacao(indicadorId);
    adicionarMensagem('ia', '❌ Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.');
  }

  // Scroll para o final
  mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
}

// ============================================
// SISTEMA RAG - Busca nos Manuais
// ============================================
function buscarContextoRelevante(pergunta) {
  if (!manuaisIndexados || manuaisIndexados.length === 0) {
    return 'Nenhum manual disponível no momento.';
  }

  console.log('[Chat IA] Buscando contexto para:', pergunta);

  // Normalizar pergunta
  const palavrasChave = extrairPalavrasChave(pergunta);
  console.log('[Chat IA] Palavras-chave extraídas:', palavrasChave);

  // Buscar chunks relevantes
  const resultados = [];

  manuaisIndexados.forEach(manual => {
    manual.chunks.forEach(chunk => {
      const score = calcularRelevancia(palavrasChave, chunk.texto);
      if (score > 0) {
        resultados.push({
          fonte: manual.nome,
          texto: chunk.texto,
          score: score
        });
      }
    });
  });

  console.log('[Chat IA] Chunks encontrados:', resultados.length);

  // Ordenar por relevância e pegar top 5 (era 3, agora 5)
  resultados.sort((a, b) => b.score - a.score);
  const top5 = resultados.slice(0, 5);

  // Se não encontrou NADA, pegar chunks aleatórios dos manuais
  if (top5.length === 0) {
    console.warn('[Chat IA] Nenhum chunk relevante encontrado, usando fallback');

    // Pegar primeiros chunks de cada manual como fallback
    const fallback = [];
    manuaisIndexados.slice(0, 3).forEach(manual => {
      if (manual.chunks && manual.chunks[0]) {
        fallback.push({
          fonte: manual.nome,
          texto: manual.chunks[0].texto,
          score: 0
        });
      }
    });

    if (fallback.length === 0) {
      return 'Não consegui acessar os manuais. Tente recarregar a página.';
    }

    // Montar contexto com fallback
    let contexto = 'INFORMAÇÕES GERAIS DOS MANUAIS (busca ampla):\n\n';
    fallback.forEach(resultado => {
      contexto += `[${resultado.fonte}]\n${resultado.texto}\n\n`;
    });
    return contexto;
  }

  console.log('[Chat IA] Top 5 chunks selecionados');

  // Montar contexto
  let contexto = 'INFORMAÇÕES DOS MANUAIS:\n\n';
  top5.forEach((resultado) => {
    contexto += `[${resultado.fonte}] (Relevância: ${resultado.score})\n${resultado.texto}\n\n`;
  });

  return contexto;
}

function extrairPalavrasChave(texto) {
  // Remover stopwords e normalizar
  const stopwords = ['o', 'a', 'de', 'da', 'do', 'em', 'para', 'com', 'como', 'que', 'é', 'um', 'uma', 'por', 'no', 'na', 'os', 'as', 'dos', 'das', 'ao', 'aos'];

  const palavras = texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .split(/\s+/)
    .filter(palavra => palavra.length > 2 && !stopwords.includes(palavra)); // Reduzido de 3 para 2

  // Se muito poucas palavras, incluir palavras menores também
  if (palavras.length < 3) {
    return texto
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(palavra => palavra.length > 0 && !stopwords.includes(palavra));
  }

  return palavras;
}

function calcularRelevancia(palavrasChave, texto) {
  const textoNormalizado = texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let score = 0;

  palavrasChave.forEach(palavra => {
    // Busca 1: Palavra exata (peso maior)
    const regexExata = new RegExp(`\\b${palavra}\\b`, 'gi');
    const matchesExatas = textoNormalizado.match(regexExata);
    if (matchesExatas) {
      score += matchesExatas.length * 3; // Peso 3x para correspondência exata
    }

    // Busca 2: Palavra contida (peso menor)
    const regexParcial = new RegExp(palavra, 'gi');
    const matchesParciais = textoNormalizado.match(regexParcial);
    if (matchesParciais) {
      score += matchesParciais.length * 1; // Peso 1x para correspondência parcial
    }
  });

  return score;
}

// ============================================
// CHAMADA À API GEMINI
// ============================================
async function consultarIA(pergunta, contexto, historico = []) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_CONFIG.model}:generateContent?key=${CHAT_CONFIG.apiKey}`;

  const systemPrompt = `Você é o assistente virtual da Auvo, uma plataforma de gestão de serviços.

INSTRUÇÕES IMPORTANTES:
1. Responda APENAS com base nas informações fornecidas nos manuais
2. Seja DIRETO e ESPECÍFICO - vá direto ao ponto respondendo exatamente o que foi perguntado
3. NUNCA mencione ou cite de qual manual você tirou a informação - apenas responda naturalmente
4. Use tom profissional mas amigável
5. Se a pergunta for sobre procedimentos, liste os passos numerados de forma clara
6. Use bullet points apenas quando realmente necessário para clareza
7. CONTEXTO DA CONVERSA: Você recebe o histórico completo desta sessão. Use-o para entender perguntas de continuação como "E para X?", "E o Y?", "Qual a diferença?", etc.

QUANDO NÃO ENCONTRAR A RESPOSTA:
- Informe educadamente que não encontrou informações específicas sobre o assunto
- Peça para o usuário reformular a pergunta usando outras palavras ou ser mais específico
- Com base na pergunta do usuário, sugira 2-3 tópicos relacionados que você PODE ajudar (baseado no contexto dos manuais)
- Exemplo: "Não encontrei informações específicas sobre [tema]. Poderia reformular sua pergunta? Talvez você esteja procurando sobre: [sugestão 1], [sugestão 2] ou [sugestão 3]?`;

  // Mensagem atual do usuário inclui o contexto RAG relevante
  const mensagemAtual = `INFORMAÇÕES DOS MANUAIS (use para responder):\n${contexto}\n\nPERGUNTA DO USUÁRIO: ${pergunta}`;

  // Montar contents: histórico anterior + mensagem atual com contexto
  const contents = [
    ...historico,
    { role: 'user', parts: [{ text: mensagemAtual }] }
  ];

  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: contents
  };

  console.log('[Chat IA] Enviando para API...');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Chat IA] Erro da API:', response.status, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Chat IA] Resposta recebida com sucesso!');

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Resposta inválida da API');
  }

  return data.candidates[0].content.parts[0].text;
}

// ============================================
// HELPERS UI
// ============================================
function adicionarMensagem(tipo, texto) {
  const container = document.getElementById('auvo-chat-mensagens');
  const mensagem = document.createElement('div');
  mensagem.className = `auvo-chat-msg auvo-chat-msg-${tipo}`;

  const avatar = tipo === 'ia' ? '🤖' : '👤';

  // Converter markdown simples para HTML
  const textoFormatado = formatarTexto(texto);

  mensagem.innerHTML = `
    <div class="auvo-chat-avatar">${avatar}</div>
    <div class="auvo-chat-texto">${textoFormatado}</div>
  `;

  container.appendChild(mensagem);
  container.scrollTop = container.scrollHeight;
}

function formatarTexto(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **negrito**
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *itálico*
    .replace(/\n/g, '<br>'); // quebras de linha
}

function mostrarIndicadorDigitacao() {
  const container = document.getElementById('auvo-chat-mensagens');
  const indicador = document.createElement('div');
  const id = 'indicador-' + Date.now();
  indicador.id = id;
  indicador.className = 'auvo-chat-msg auvo-chat-msg-ia';
  indicador.innerHTML = `
    <div class="auvo-chat-avatar">🤖</div>
    <div class="auvo-chat-texto auvo-chat-digitando">
      <span></span><span></span><span></span>
    </div>
  `;
  container.appendChild(indicador);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removerIndicadorDigitacao(id) {
  const indicador = document.getElementById(id);
  if (indicador) indicador.remove();
}

// ============================================
// LISTENER PARA MUDANÇAS NA CONFIGURAÇÃO
// ============================================
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.chatIAHabilitado) {
      const novoValor = changes.chatIAHabilitado.newValue;

      if (novoValor && !chatHabilitado) {
        // Foi habilitado
        chatHabilitado = true;
        inicializarChatIA();
      } else if (!novoValor && chatHabilitado) {
        // Foi desabilitado
        chatHabilitado = false;
        const container = document.getElementById('auvo-chat-container');
        if (container) container.remove();
      }
    }

    // Recarregar manuais se foram atualizados
    if (changes.manuaisIndexados) {
      carregarManuais();
    }
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarChatIA);
} else {
  inicializarChatIA();
}
