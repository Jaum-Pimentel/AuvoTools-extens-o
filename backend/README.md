# 🤖 Backend Chat IA - Auvo Tools

Sistema de RAG (Retrieval-Augmented Generation) usando ChromaDB e Google Gemini.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn

## 🚀 Instalação

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente:**
Edite o arquivo `.env` se necessário:
```
GEMINI_API_KEY=AIzaSyDjM9CEp3fckcIsAf2VLu5EPGk_dqW6pec
PORT=3000
```

## 📚 Processar Manuais (Primeira vez)

Antes de iniciar o servidor, você precisa processar os PDFs:

```bash
npm run processar
```

Isso vai:
- Ler todos os PDFs da pasta `meus_manuais/`
- Extrair texto de cada documento
- Dividir em chunks de 500 caracteres
- Gerar embeddings usando Gemini
- Armazenar no ChromaDB

**Saída esperada:**
```
🚀 Iniciando processamento dos manuais...

📚 Encontrados 9 PDFs:
  - Comportamentos Auvos.pdf
  - Conteúdo IA - Sheet1.pdf
  ...

📄 [1/9] Processando: Comportamentos Auvos.pdf
   ✓ Texto extraído: 45232 caracteres
   ✓ Dividido em 95 chunks
   📊 Gerando embeddings: 95/95
   ✅ Indexados 95 chunks

...

✨ PROCESSAMENTO CONCLUÍDO!
📊 Total de chunks indexados: 645
💾 ChromaDB collection: auvo_manuais
```

## ▶️ Iniciar Servidor

```bash
npm start
```

Ou com auto-reload durante desenvolvimento:
```bash
npm run dev
```

**Saída esperada:**
```
==================================================
🚀 Servidor rodando em http://localhost:3000
📊 Collection: auvo_manuais
==================================================

Endpoints disponíveis:
  GET  /health       - Health check
  POST /api/chat     - Chat com IA
  POST /api/buscar   - Buscar contexto
  GET  /api/stats    - Estatísticas
```

## 🧪 Testar API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Chat com IA
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Como criar um contrato?"}'
```

### 3. Estatísticas
```bash
curl http://localhost:3000/api/stats
```

## 📂 Estrutura de Arquivos

```
backend/
├── package.json          # Dependências
├── .env                  # Variáveis de ambiente
├── processar-pdfs.js     # Script para indexar PDFs
├── server.js             # Servidor API Express
├── README.md             # Este arquivo
└── chroma_db/            # Banco vetorial (gerado automaticamente)
```

## 🔧 Como Funciona

1. **Processamento (offline):**
   - PDFs → Extração de texto → Chunks → Embeddings → ChromaDB

2. **Consulta (runtime):**
   ```
   Pergunta do usuário
        ↓
   Gerar embedding da pergunta
        ↓
   Buscar chunks similares no ChromaDB (busca vetorial)
        ↓
   Top 5 chunks mais relevantes
        ↓
   Enviar para Gemini com contexto
        ↓
   Resposta formatada
   ```

## 🐛 Troubleshooting

### Erro: "Collection não encontrada"
- Execute `npm run processar` antes de `npm start`

### Erro ao gerar embeddings
- Verifique se a chave API está correta no `.env`
- Confirme que tem quota disponível na Google AI

### ChromaDB não inicializa
- Certifique-se que a porta 8000 está livre (usada pelo ChromaDB)

## 📊 Performance

- **Indexação:** ~30 chunks/segundo
- **Busca:** <100ms para top-5 resultados
- **Resposta completa:** 1-3 segundos (depende do Gemini)
