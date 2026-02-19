// ============================================
// EXTRATOR DE PDFs PARA JSON
// ============================================
// Lê PDFs da pasta meus_manuais e gera manuais.json

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PASTA_MANUAIS = path.join(__dirname, '..', 'meus_manuais');
const ARQUIVO_SAIDA = path.join(__dirname, '..', 'manuais.json');
const ARQUIVO_PALAVRAS_CHAVE = path.join(__dirname, '..', 'palavras-chave.json');
const CHUNK_SIZE = 800; // Tamanho dos chunks em caracteres

// Carregar palavras-chave configuradas
async function carregarPalavrasChave() {
    try {
        const conteudo = await fs.readFile(ARQUIVO_PALAVRAS_CHAVE, 'utf-8');
        return JSON.parse(conteudo);
    } catch (erro) {
        console.log('⚠️  Arquivo palavras-chave.json não encontrado, usando padrão vazio');
        return {};
    }
}

// ============================================
// FUNÇÕES
// ============================================

async function extrairTextoPDF(caminhoArquivo) {
    try {
        const dataBuffer = await fs.readFile(caminhoArquivo);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (erro) {
        console.error(`❌ Erro ao ler ${path.basename(caminhoArquivo)}:`, erro.message);
        return null;
    }
}

function limparTexto(texto) {
    return texto
        .replace(/\s+/g, ' ') // Múltiplos espaços → 1 espaço
        .replace(/\n{3,}/g, '\n\n') // Múltiplas quebras → 2 quebras
        .trim();
}

function dividirEmChunks(texto, tamanho = CHUNK_SIZE) {
    const chunks = [];
    const paragrafos = texto.split('\n\n');
    let chunkAtual = '';

    for (const paragrafo of paragrafos) {
        const paragrafoLimpo = paragrafo.trim();

        if (!paragrafoLimpo) continue;

        if ((chunkAtual + paragrafoLimpo).length > tamanho && chunkAtual.length > 0) {
            chunks.push(chunkAtual.trim());
            chunkAtual = paragrafoLimpo;
        } else {
            chunkAtual += (chunkAtual ? '\n\n' : '') + paragrafoLimpo;
        }
    }

    if (chunkAtual.trim()) {
        chunks.push(chunkAtual.trim());
    }

    return chunks;
}

// ============================================
// PROCESSAMENTO PRINCIPAL
// ============================================

async function processar() {
    console.log('🚀 Extraindo texto dos PDFs...\n');

    try {
        // Carregar palavras-chave
        const palavrasChaveConfig = await carregarPalavrasChave();

        // Listar PDFs
        const arquivos = await fs.readdir(PASTA_MANUAIS);
        const pdfs = arquivos.filter(f => f.toLowerCase().endsWith('.pdf'));

        if (pdfs.length === 0) {
            console.error('❌ Nenhum PDF encontrado em meus_manuais/');
            process.exit(1);
        }

        console.log(`📚 Encontrados ${pdfs.length} PDFs:\n`);

        const manuaisData = [];
        let totalChunks = 0;

        // Processar cada PDF
        for (let i = 0; i < pdfs.length; i++) {
            const arquivo = pdfs[i];
            const nomeManual = arquivo.replace('.pdf', '');
            const caminhoCompleto = path.join(PASTA_MANUAIS, arquivo);

            console.log(`📄 [${i + 1}/${pdfs.length}] ${arquivo}`);

            // Extrair texto
            const textoRaw = await extrairTextoPDF(caminhoCompleto);

            if (!textoRaw) {
                console.log('   ⚠️  Ignorado (erro na leitura)\n');
                continue;
            }

            // Limpar e dividir
            const textoLimpo = limparTexto(textoRaw);
            const chunks = dividirEmChunks(textoLimpo);

            // Buscar palavras-chave configuradas para este manual
            const configManual = palavrasChaveConfig[nomeManual] || {};
            const palavrasChave = configManual.palavrasChave || [];
            const sinonimos = configManual.sinonimos || {};

            console.log(`   ✓ ${textoLimpo.length} caracteres`);
            console.log(`   ✓ ${chunks.length} chunks`);
            if (palavrasChave.length > 0) {
                console.log(`   ✓ ${palavrasChave.length} palavras-chave: ${palavrasChave.slice(0, 3).join(', ')}...`);
            }
            console.log('');

            // Adicionar ao array com palavras-chave
            manuaisData.push({
                nome: nomeManual,
                arquivo: arquivo,
                totalCaracteres: textoLimpo.length,
                palavrasChave: palavrasChave,
                sinonimos: sinonimos,
                chunks: chunks.map((texto, index) => ({
                    id: index,
                    texto: texto
                }))
            });

            totalChunks += chunks.length;
        }

        // Salvar JSON
        const jsonContent = JSON.stringify(manuaisData, null, 2);
        await fs.writeFile(ARQUIVO_SAIDA, jsonContent, 'utf-8');

        // Resumo
        console.log('='.repeat(50));
        console.log('✨ EXTRAÇÃO CONCLUÍDA!');
        console.log(`📊 Manuais processados: ${manuaisData.length}`);
        console.log(`📦 Total de chunks: ${totalChunks}`);
        console.log(`💾 Arquivo gerado: manuais.json`);
        console.log(`📏 Tamanho: ${(jsonContent.length / 1024).toFixed(2)} KB`);
        console.log('='.repeat(50));

    } catch (erro) {
        console.error('❌ Erro fatal:', erro);
        process.exit(1);
    }
}

// Executar
processar();
