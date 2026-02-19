# 🚀 Deploy do Backend no Railway (Grátis)

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Railway.app (grátis)

## 🎯 Passo a Passo

### 1️⃣ Preparar Repositório GitHub

```bash
# Na pasta raiz do projeto
git init
git add .
git commit -m "Initial commit - Auvo Chat Backend"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/SEU_USUARIO/auvo-chat-backend.git
git push -u origin main
```

### 2️⃣ Deploy no Railway

1. **Acessar** [railway.app](https://railway.app)
2. **Login** com GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Selecionar** seu repositório
5. **Configurar variáveis de ambiente:**
   - `GEMINI_API_KEY` = `AIzaSyDjM9CEp3fckcIsAf2VLu5EPGk_dqW6pec`
   - `PORT` = `3000`

### 3️⃣ Configurar Startup

O Railway detecta automaticamente `package.json`, mas você pode especificar:

**Start Command:**
```bash
npm start
```

**Build Command:**
```bash
npm install
```

### 4️⃣ Obter URL Pública

1. Railway gera automaticamente uma URL tipo: `https://auvo-chat-production.up.railway.app`
2. Copie essa URL

### 5️⃣ Atualizar Extensão

Edite `features/chat-ia.js`:

```javascript
const CHAT_CONFIG = {
  backendUrl: 'https://SEU_APP.up.railway.app', // ← Cole sua URL aqui
  tentarBackendPrimeiro: true,
  apiKey: 'AIzaSyDjM9CEp3fckcIsAf2VLu5EPGk_dqW6pec',
  model: 'gemini-2.0-flash'
};
```

### 6️⃣ Processar Manuais no Railway

**Opção A: Rodar localmente e subir JSON**
```bash
# Local
npm run processar
# Isso cria a pasta chroma_db/

# Fazer commit e push
git add chroma_db/
git commit -m "Add processed manuals"
git push
```

**Opção B: Criar script de inicialização**
Adicione em `package.json`:
```json
{
  "scripts": {
    "railway:init": "node processar-pdfs.js && node server.js"
  }
}
```

E configure no Railway:
- **Start Command**: `npm run railway:init`

## ✅ Testar

```bash
curl https://SEU_APP.up.railway.app/health
```

Deve retornar:
```json
{
  "status": "ok",
  "collection": "ready",
  "timestamp": "2026-01-13T..."
}
```

## 💰 Limites Gratuitos Railway

- **500 horas/mês** de execução
- **1 GB RAM**
- **1 GB Storage**
- Perfeito para este projeto!

## 🔧 Alternativas

### Render.com
1. Mesmo processo
2. URL: `https://auvo-chat.onrender.com`
3. Free tier: 750 horas/mês

### Vercel (requer adaptações)
1. Não suporta ChromaDB diretamente
2. Precisaria usar Vercel KV ou PostgreSQL com extensão vetorial

## 📊 Monitoramento

Railway tem dashboard com:
- Logs em tempo real
- Uso de CPU/RAM
- Requests por minuto
- Crashes

## 🆘 Troubleshooting

### Erro: "Cannot find module 'chromadb'"
- Certifique-se que `node_modules` não está no `.gitignore`
- Railway deve instalar dependências automaticamente

### ChromaDB não persiste
- Adicione volume persistente no Railway
- Settings → Volumes → Add Volume
- Mount path: `/app/chroma_db`

### Timeout na primeira request
- Railway em modo free "hiberna" após inatividade
- Primeira chamada pode demorar ~10s (cold start)
- Depois fica rápido

---

**Pronto! Após deploy, todos que usarem a extensão terão acesso ao chat IA sem precisar rodar nada local!** 🎉
