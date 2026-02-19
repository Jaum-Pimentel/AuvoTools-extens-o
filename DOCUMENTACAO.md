# 📘 Documentação da Extensão: Auvo Power Tools

**Versão:** 1.2  
**Status:** Produção (Interno)  
**Objetivo:** Aumentar a produtividade da equipe de suporte, facilitar a navegação entre ambientes e automatizar diagnósticos técnicos no sistema Auvo.

---

## 📖 Parte 1: Guia do Usuário (Funcional)

Esta extensão modifica a interface do sistema Auvo para adicionar atalhos e ferramentas inteligentes.

### 1. Menu de Acesso Rápido (Botão "Acessar")
O botão original "Acessar" foi transformado. Agora ele possui uma **seta lateral** que abre um menu com três abas:

#### 🗂️ Aba 1: Geral
Atalhos rápidos para as telas mais usadas, eliminando a necessidade de navegar pelo menu lateral.
* **Botões de Link:** Acesso direto para Colaboradores, Clientes, Relatório de Tarefas e Notas Fiscais.
* **Campo de Código:** Digite o ID (ex: `12345`) e tecle *Enter* para ir direto ao cadastro daquele ID na tela selecionada.

#### 🛠️ Aba 2: Procedimentos (Proced.)
Ferramentas para executar scripts administrativos no `cs.auvo.com.br`.
* **Gestão de Tarefas:**
    * **Recuperar:** Restaura uma tarefa excluída.
    * **Mudar Cliente:** Move a tarefa de um cliente para outro.
    * **Reabrir:** Reabre uma tarefa finalizada.
    * *Automação:* O sistema lê automaticamente o ID da tarefa digitado ou selecionado na tela.
* **Unificar Cliente:**
    * Abre a ferramenta de unificação (Merge) por Nome ou CNPJ.

#### 🌐 Aba 3: Servidor (Troca de Ambiente)
Permite alternar entre os servidores da Auvo mantendo a sessão do cliente logado (*Magic Link*).
* **Como funciona:** Ao clicar em "Servidor 2", a extensão captura o link de login criptografado do botão original e redireciona você para o ambiente `app2.auvo.com.br` (ou 3 e 4).

---

### 2. Inteligência Artificial (Diagnóstico de NFs)
Ao acessar a tela de **Notas Fiscais**, a extensão monitora mensagens de erro em vermelho.

* **Botão Roxo (Analisar Erro IA):**
    * Aparece automaticamente ao lado de erros contendo termos como "rejeição", "falha", "NCM", etc.
    * Ao clicar, a IA (Google Gemini) analisa o erro técnico e explica em linguagem simples como resolver.
* **Botão Laranja (Validar Schema):**
    * Se o erro contiver a palavra "Schema", um segundo botão aparece para abrir o Validador de XML externo.

---

### 3. Assistente de Importação
Nas telas de importação (Clientes, Produtos, etc.), se o sistema exibir o erro *"Esta planilha não possui todas as colunas necessárias"*:

* **Botão Azul (Padronizar Planilha):**
    * Aparece dentro do alerta de erro.
    * Clicar nele leva para a ferramenta interna `Map Importer` para corrigir o arquivo.

---

# ⚙️ Parte 2: Documentação Técnica (Desenvolvedor)

Detalhes sobre a arquitetura, lógica e manutenção do código.

### 📂 Estrutura de Arquivos

| Arquivo | Função |
| :--- | :--- |
| `manifest.json` | Configuração da extensão (Manifest V3). Define permissões (`storage`) e injeta scripts nas URLs alvo. |
| `content.js` | O "cérebro" da extensão. Roda no contexto da página web (DOM), manipula elementos e chama APIs. |
| `styles.css` | Folhas de estilo para os botões, menus, abas e animações. |

---

### 🧠 Lógica do `content.js`

#### 1. Bootstrap e Redirecionamento
* **Detecção de Domínio:** O script verifica `window.location.href` contra a lista `DOMINIOS_SUPORTADOS`.
* **Persistência (`chrome.storage.local`):** Utilizado para passar dados entre abas (ex: salvar ID da tarefa no `app.auvo` para preencher automaticamente no `cs.auvo`).

#### 2. Injeção Visual (DOM Manipulation)
* **Função `criarBotaoSplit()`:**
    * Localiza o botão `#AcessarConta`.
    * Cria um wrapper flexbox (`.auvo-ext-wrapper`) para unir o botão original a uma nova seta (`.auvo-ext-trigger`).
    * Gerencia a renderização das 3 abas (Geral, Procedimentos, Servidores) através de manipulação de classes CSS (`.active`).

#### 3. Captura de Contexto (Scraping)
* **Função `getCodigoBase()`:** Tenta ler o ID do cliente/tarefa da tela de duas formas:
    1.  Busca pela classe `.select2-selection__rendered` (Componente Select2 padrão do Auvo).
    2.  Fallback: Busca qualquer `input[type="text"]` visível que inicie com números.
* **Regex:** Utiliza expressões regulares para limpar o texto (ex: transformar "12345 - Nome" em "12345").

#### 4. Integração com IA (Gemini API)
* **Monitoramento:** Usa `MutationObserver` na função `monitorarErrosNF()` para detectar alterações no DOM.
* **Gatilhos:** Busca elementos com classes de erro (`.text-danger`, `.alert-danger`) e filtra por palavras-chave (`erro`, `rejeição`, `ncm`, `schema`).
* **API Call:** Realiza um `fetch` POST para a API `generativelanguage.googleapis.com` usando o modelo `gemini-2.0-flash`.

#### 5. Troca de Servidores (Magic Link)
* **Função `irParaServidor()`:**
    * Lê o atributo `href` do botão "Acessar" original.
    * Utiliza Regex (`/\/\/app\d*\./`) para substituir o subdomínio `app` por `app2`, `app3`, etc.
    * Abre o novo link em uma nova aba (`_blank`).

---

### 🎨 Detalhes do CSS (`styles.css`)

* **Isolamento:** Todas as classes possuem prefixo `.auvo-ext-` ou `.auvo-proc-` para evitar conflitos com o estilo nativo do site.
* **Cores Semânticas:**
    * 🟣 **Roxo (`#7b1fa2`):** Ações de IA.
    * 🟠 **Laranja (`#e65100`):** Validação técnica.
    * 🔵 **Azul (`#0288d1`):** Ferramentas e Planilhas.
    * ⚪ **Cinza/Clean:** Interface geral do menu.

---

### ⚠️ Pontos de Atenção para Manutenção

1.  **Mudança de Layout da Auvo:** Se a Auvo alterar o ID do botão (`#AcessarConta`) ou a estrutura das mensagens de erro (classes CSS), os seletores no `content.js` precisarão ser atualizados.
2.  **API Key do Gemini:** A chave está inserida diretamente no código (*hardcoded*).
    * *Risco:* Se a cota de uso exceder ou houver pendência de faturamento na conta Google Cloud, a IA parará de responder.
    * *Solução:* Gerar nova chave no Google AI Studio e atualizar a constante `GEMINI_API_KEY`.
3.  **Links Locais:** As ferramentas de planilha apontam para `localhost` ou IP local (`192.168...`). Ao subir para produção, atualize as constantes `LINK_MAP_IMPORTER` e `LINK_VALIDATOR`.