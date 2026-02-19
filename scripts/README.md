# 📚 Processador de Manuais

Script simples para extrair texto dos PDFs e gerar `manuais.json`.

## 🚀 Como usar:

### 1. Instalar dependências (primeira vez)

```bash
cd scripts
npm install
```

### 2. Extrair PDFs e gerar JSON

```bash
npm run extrair
```

## 📊 O que acontece:

1. Lê todos os PDFs da pasta `meus_manuais/`
2. Extrai o texto de cada documento
3. Divide em chunks de 800 caracteres
4. Salva tudo em `manuais.json` na raiz

## 📂 Saída esperada:

```
🚀 Extraindo texto dos PDFs...

📚 Encontrados 9 PDFs:

📄 [1/9] Comportamentos Auvos.pdf
   ✓ 45232 caracteres
   ✓ 57 chunks

...

==================================================
✨ EXTRAÇÃO CONCLUÍDA!
📊 Manuais processados: 9
📦 Total de chunks: 645
💾 Arquivo gerado: manuais.json
📏 Tamanho: 512.34 KB
==================================================
```

## 🔄 Quando executar novamente?

Rode `npm run extrair` sempre que:
- Adicionar novos PDFs em `meus_manuais/`
- Atualizar conteúdo de um manual existente
- Quiser reprocessar tudo do zero

## ✅ Próximo passo:

Após gerar o `manuais.json`:
1. Recarregue a extensão no Chrome
2. O chat IA vai carregar automaticamente o novo conteúdo!
