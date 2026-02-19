// ============================================
// PROCESSADOR DE PDFs - Extrai e indexa documentos
// ============================================
// Similar ao seu importar_docs.py e treinar.py

import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const PASTA_MANUAIS = '../meus_manuais';
const ARQUIVO_PALAVRAS_CHAVE = '../palavras-chave.json';
const COLLECTION_NAME = 'auvo_manuais';
const CHUNK_SIZE = 500; // Tamanho dos chunks em caracteres

// Carregar palavras-chave configuradas
async function carregarPalavrasChave() {
    try {
        const conteudo = await fs.readFile(ARQUIVO_PALAVRAS_CHAVE, 'utf-8');
        return JSON.parse(conteudo);
    } catch (erro) {
        console.log('⚠️  Arquivo palavras-chave.json não encontrado');
        return {};
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chromaClient = new ChromaClient();

// ============================================
// FUNÇÕES DE PROCESSAMENTO
// ============================================

// Extrair texto de um PDF
async function extrairTextoPDF(caminhoArquivo) {
    try {
        const dataBuffer = await fs.readFile(caminhoArquivo);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (erro) {
        console.error(`Erro ao ler PDF ${caminhoArquivo}:`, erro.message);
        return null;
    }
}

// Dividir texto em chunks
function dividirEmChunks(texto, tamanho = CHUNK_SIZE) {
    const chunks = [];
    const paragrafos = texto.split('\n\n');

    let chunkAtual = '';

    for (const paragrafo of paragrafos) {
        if ((chunkAtual + paragrafo).length > tamanho && chunkAtual.length > 0) {
            chunks.push(chunkAtual.trim());
            chunkAtual = paragrafo;
        } else {
            chunkAtual += '\n\n' + paragrafo;
        }
    }

    if (chunkAtual.trim()) {
        chunks.push(chunkAtual.trim());
    }

    return chunks;
}

// Gerar embedding usando Gemini
async function gerarEmbedding(texto) {
    try {
        const model = genAI.getGenerativeModel({ model: 'embedding-001' });
        const result = await model.embedContent(texto);
        return result.embedding.values;
    } catch (erro) {
        console.error('Erro ao gerar embedding:', erro.message);
        return null;
    }
}

// ============================================
// PROCESSAMENTO PRINCIPAL
// ============================================
async function processarManuais() {
    console.log('🚀 Iniciando processamento dos manuais...\n');

    // 1. Carregar palavras-chave
    const palavrasChaveConfig = await carregarPalavrasChave();
    const temPalavrasChave = Object.keys(palavrasChaveConfig).length > 0;
    if (temPalavrasChave) {
        console.log(`🔑 Palavras-chave carregadas para ${Object.keys(palavrasChaveConfig).length} manuais\n`);
    }

    // 2. Listar PDFs
    const arquivos = await fs.readdir(PASTA_MANUAIS);
    const pdfs = arquivos.filter(f => f.endsWith('.pdf'));

    console.log(`📚 Encontrados ${pdfs.length} PDFs:\n${pdfs.map(p => `  - ${p}`).join('\n')}\n`);

    // 3. Criar/Resetar coleção ChromaDB
    try {
        await chromaClient.deleteCollection({ name: COLLECTION_NAME });
        console.log('🗑️  Coleção anterior removida');
    } catch (e) {
        console.log('📂 Criando nova coleção');
    }

    const collection = await chromaClient.createCollection({
        name: COLLECTION_NAME,
        metadata: { 'hnsw:space': 'cosine' }
    });

    // 4. Processar cada PDF
    let totalChunks = 0;

    for (let i = 0; i < pdfs.length; i++) {
        const arquivo = pdfs[i];
        const nomeManual = arquivo.replace('.pdf', '');
        const caminhoCompleto = path.join(PASTA_MANUAIS, arquivo);

        console.log(`\n📄 [${i + 1}/${pdfs.length}] Processando: ${arquivo}`);

        // Extrair texto
        const texto = await extrairTextoPDF(caminhoCompleto);
        if (!texto) {
            console.log(`   ⚠️  Ignorado (erro na leitura)`);
            continue;
        }

        console.log(`   ✓ Texto extraído: ${texto.length} caracteres`);

        // Buscar palavras-chave para este manual
        const configManual = palavrasChaveConfig[nomeManual] || {};
        const palavrasChave = configManual.palavrasChave || [];
        const sinonimos = configManual.sinonimos || {};

        // Criar prefixo com palavras-chave para melhorar busca
        let prefixoPalavrasChave = '';
        if (palavrasChave.length > 0) {
            prefixoPalavrasChave = `[PALAVRAS-CHAVE: ${palavrasChave.join(', ')}] `;
            console.log(`   ✓ Palavras-chave: ${palavrasChave.join(', ')}`);
        }

        // Adicionar sinônimos ao prefixo
        const listaSinonimos = Object.entries(sinonimos)
            .map(([termo, sins]) => `${termo}=${sins.join('/')}`)
            .join('; ');
        if (listaSinonimos) {
            prefixoPalavrasChave += `[SINONIMOS: ${listaSinonimos}] `;
        }

        // Dividir em chunks
        const chunks = dividirEmChunks(texto);
        console.log(`   ✓ Dividido em ${chunks.length} chunks`);

        // Gerar embeddings e adicionar ao ChromaDB
        const ids = [];
        const embeddings = [];
        const documents = [];
        const metadatas = [];

        for (let j = 0; j < chunks.length; j++) {
            const chunk = chunks[j];
            // Adicionar palavras-chave ao texto para melhorar o embedding
            const textoComPalavrasChave = prefixoPalavrasChave + chunk;
            const embedding = await gerarEmbedding(textoComPalavrasChave);

            if (embedding) {
                ids.push(`${arquivo}_chunk_${j}`);
                embeddings.push(embedding);
                // Guardar o chunk original no documento (sem o prefixo)
                documents.push(chunk);
                metadatas.push({
                    fonte: nomeManual,
                    chunk_index: j,
                    total_chunks: chunks.length,
                    palavras_chave: palavrasChave.join(', ')
                });

                // Mostrar progresso
                if ((j + 1) % 10 === 0 || j === chunks.length - 1) {
                    process.stdout.write(`\r   📊 Gerando embeddings: ${j + 1}/${chunks.length}`);
                }
            }
        }

        console.log(''); // Nova linha após progresso

        // Adicionar ao ChromaDB
        await collection.add({
            ids,
            embeddings,
            documents,
            metadatas
        });

        console.log(`   ✅ Indexados ${embeddings.length} chunks`);
        totalChunks += embeddings.length;
    }

    // 5. Resumo final
    console.log('\n' + '='.repeat(50));
    console.log(`✨ PROCESSAMENTO CONCLUÍDO!`);
    console.log(`📊 Total de chunks indexados: ${totalChunks}`);
    console.log(`💾 ChromaDB collection: ${COLLECTION_NAME}`);
    console.log('='.repeat(50));
}

// ============================================
// EXECUÇÃO
// ============================================
processarManuais().catch(console.error);
