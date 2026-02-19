// ============================================
// SERVIDOR API - CHAT IA COM BUSCA LOCAL
// ============================================
// Versão simplificada sem ChromaDB

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicialização
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Resolve o caminho do manuais.json relativo ao server.js (funciona local e no Railway)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARQUIVO_MANUAIS = path.join(__dirname, '..', 'manuais.json');

let manuaisData = [];
let dbPool = null;

function iniciarMySQL() {
    if (!process.env.DB_HOST) {
        console.log('ℹ️  MySQL não configurado (DB_HOST ausente no .env)');
        return;
    }
    dbPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 5,
    });
    console.log(`✅ MySQL pool configurado → ${process.env.DB_HOST}/${process.env.DB_NAME}`);
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Carregar manuais do JSON
async function carregarManuais() {
    try {
        const conteudo = await fs.readFile(ARQUIVO_MANUAIS, 'utf-8');
        manuaisData = JSON.parse(conteudo);
        console.log(`✅ Carregados ${manuaisData.length} manuais`);

        // Mostrar palavras-chave
        manuaisData.forEach(m => {
            if (m.palavrasChave && m.palavrasChave.length > 0) {
                console.log(`   📚 ${m.nome}: ${m.palavrasChave.slice(0, 3).join(', ')}...`);
            }
        });
    } catch (erro) {
        console.error('❌ Erro ao carregar manuais.json:', erro.message);
        console.error('   Execute primeiro: node ../scripts/extrair-pdfs.js');
        process.exit(1);
    }
}

// Normalizar texto para busca (remove acentos, lowercase)
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, ' ')    // Remove caracteres especiais
        .replace(/\s+/g, ' ')
        .trim();
}

// Buscar documentos relevantes usando palavras-chave e texto
function buscarContexto(pergunta, numResultados = 5) {
    const perguntaNormalizada = normalizarTexto(pergunta);
    const palavrasPergunta = perguntaNormalizada.split(' ').filter(p => p.length > 2);

    const resultados = [];

    for (const manual of manuaisData) {
        let score = 0;

        // 1. Verificar palavras-chave do manual (peso alto)
        if (manual.palavrasChave) {
            for (const palavraChave of manual.palavrasChave) {
                const palavraChaveNorm = normalizarTexto(palavraChave);
                if (perguntaNormalizada.includes(palavraChaveNorm)) {
                    score += 10; // Peso alto para match de palavra-chave
                }
            }
        }

        // 2. Verificar sinônimos (peso alto)
        if (manual.sinonimos) {
            for (const [termo, sinonimos] of Object.entries(manual.sinonimos)) {
                const termoNorm = normalizarTexto(termo);
                if (perguntaNormalizada.includes(termoNorm)) {
                    score += 10;
                }
                for (const sin of sinonimos) {
                    if (perguntaNormalizada.includes(normalizarTexto(sin))) {
                        score += 8;
                    }
                }
            }
        }

        // 3. Buscar nos chunks do manual
        for (const chunk of manual.chunks) {
            const textoNormalizado = normalizarTexto(chunk.texto);
            let chunkScore = score; // Herda score das palavras-chave

            // Contar matches de palavras da pergunta no texto
            for (const palavra of palavrasPergunta) {
                if (textoNormalizado.includes(palavra)) {
                    chunkScore += 1;
                }
            }

            // Bonus para matches exatos de frases curtas
            if (palavrasPergunta.length <= 3) {
                const frase = palavrasPergunta.join(' ');
                if (textoNormalizado.includes(frase)) {
                    chunkScore += 5;
                }
            }

            if (chunkScore > 0) {
                resultados.push({
                    texto: chunk.texto,
                    fonte: manual.nome,
                    relevancia: chunkScore,
                    palavrasChave: manual.palavrasChave || []
                });
            }
        }
    }

    // Ordenar por relevância e retornar os melhores
    resultados.sort((a, b) => b.relevancia - a.relevancia);

    return resultados.slice(0, numResultados).map(r => ({
        texto: r.texto,
        fonte: r.fonte,
        relevancia: (r.relevancia / 20).toFixed(3) // Normalizar score
    }));
}

// Gerar resposta com IA
async function gerarResposta(pergunta, contextos) {
    // Montar contexto dos manuais
    let contextoTexto = 'INFORMAÇÕES DOS MANUAIS:\n\n';
    contextos.forEach((ctx, i) => {
        contextoTexto += `[${ctx.fonte}] (Relevância: ${ctx.relevancia})\n${ctx.texto}\n\n`;
    });

    const systemPrompt = `Você é o assistente virtual da Auvo, uma plataforma de gestão de serviços.

INSTRUÇÕES IMPORTANTES:
1. Responda APENAS com base nas informações fornecidas nos manuais
2. Se a informação não estiver nos manuais, diga "Não encontrei essa informação nos manuais disponíveis"
3. Seja objetivo, claro e use bullet points quando apropriado
4. Cite o manual de onde tirou a informação (ex: "Segundo o Manual de Contratos...")
5. Use tom profissional mas amigável
6. Se a pergunta for sobre procedimentos, liste os passos numerados

${contextoTexto}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
        { text: systemPrompt },
        { text: `PERGUNTA DO USUÁRIO: ${pergunta}` }
    ]);

    return result.response.text();
}

// ============================================
// ROTAS DA API
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        manuais: manuaisData.length,
        timestamp: new Date().toISOString()
    });
});

// Endpoint principal: buscar + responder
app.post('/api/chat', async (req, res) => {
    try {
        const { pergunta } = req.body;

        if (!pergunta) {
            return res.status(400).json({ erro: 'Pergunta não fornecida' });
        }

        console.log(`📩 Nova pergunta: ${pergunta}`);

        // 1. Buscar contexto relevante
        const contextos = buscarContexto(pergunta, 5);
        console.log(`   ✓ Encontrados ${contextos.length} documentos relevantes`);

        if (contextos.length === 0) {
            console.log('   ⚠️  Nenhum contexto encontrado, usando todos os manuais');
            // Se não encontrar nada, pegar um trecho de cada manual
            for (const manual of manuaisData.slice(0, 3)) {
                if (manual.chunks && manual.chunks[0]) {
                    contextos.push({
                        texto: manual.chunks[0].texto.substring(0, 500),
                        fonte: manual.nome,
                        relevancia: '0.100'
                    });
                }
            }
        }

        // 2. Gerar resposta
        const resposta = await gerarResposta(pergunta, contextos);
        console.log(`   ✓ Resposta gerada`);

        res.json({
            resposta,
            fontes: contextos.map(c => ({
                fonte: c.fonte,
                relevancia: c.relevancia
            }))
        });

    } catch (erro) {
        console.error('❌ Erro:', erro);
        res.status(500).json({
            erro: 'Erro ao processar pergunta',
            detalhes: erro.message
        });
    }
});

// Endpoint para debug: buscar contexto sem gerar resposta
app.post('/api/buscar', async (req, res) => {
    try {
        const { pergunta, numResultados = 5 } = req.body;

        if (!pergunta) {
            return res.status(400).json({ erro: 'Pergunta não fornecida' });
        }

        const contextos = buscarContexto(pergunta, numResultados);

        res.json({ contextos });

    } catch (erro) {
        console.error('❌ Erro:', erro);
        res.status(500).json({
            erro: 'Erro ao buscar contexto',
            detalhes: erro.message
        });
    }
});

// Estatísticas
app.get('/api/stats', async (req, res) => {
    try {
        const totalChunks = manuaisData.reduce((acc, m) => acc + (m.chunks?.length || 0), 0);
        const palavrasChave = manuaisData.flatMap(m => m.palavrasChave || []);

        res.json({
            total_manuais: manuaisData.length,
            total_chunks: totalChunks,
            palavras_chave: [...new Set(palavrasChave)],
            status: 'ativo'
        });

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// Cria conexão temporária a partir das credenciais fornecidas ou usa o pool do .env
async function criarConexao(dbCredentials) {
    if (dbCredentials && dbCredentials.host) {
        return { conn: await mysql.createConnection({
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database,
            port: Number(dbCredentials.port) || 3306,
            connectTimeout: 8000,
        }), temporaria: true };
    }
    if (dbPool) {
        return { conn: await dbPool.getConnection(), temporaria: false };
    }
    return null;
}

async function fecharConexao({ conn, temporaria }) {
    if (temporaria) await conn.end().catch(() => {});
    else conn.release();
}

// Testar conexão com credenciais fornecidas
app.post('/api/nf/testar', async (req, res) => {
    const { dbCredentials } = req.body;
    if (!dbCredentials || !dbCredentials.host) {
        return res.status(400).json({ erro: 'Credenciais não fornecidas' });
    }
    let conn;
    try {
        conn = await mysql.createConnection({
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database,
            port: Number(dbCredentials.port) || 3306,
            connectTimeout: 8000,
        });
        await conn.ping();
        console.log(`✅ Teste de conexão bem-sucedido → ${dbCredentials.user}@${dbCredentials.host}`);
        res.json({ ok: true, mensagem: 'Conexão bem-sucedida!' });
    } catch (erro) {
        console.error('❌ Teste de conexão falhou:', erro.message);
        res.status(400).json({ erro: erro.message });
    } finally {
        if (conn) await conn.end().catch(() => {});
    }
});

// Consulta de auditoria NF pelo DataID (EntityId)
app.post('/api/nf/auditoria', async (req, res) => {
    const { entityId, dbCredentials } = req.body;

    if (!entityId) {
        return res.status(400).json({ erro: 'entityId não fornecido' });
    }

    const conexao = await criarConexao(dbCredentials).catch(() => null);
    if (!conexao) {
        return res.status(503).json({ erro: 'Nenhuma credencial de banco disponível. Configure no popup da extensão.' });
    }

    try {
        const query = `
            SELECT a.NumeroNf, ENotasEmpresaId, a.transmissaoId, c.DataCadastro, ENotasNfId, c.Data
            FROM nf a
            INNER JOIN tbadesao b ON a.AdesaoId = b.id
            INNER JOIN nfeauditoria c ON c.EntityId = a.id
            WHERE c.EntityId = ?
            ORDER BY a.DataCadastro DESC
        `;
        const [rows] = await conexao.conn.execute(query, [entityId]);
        console.log(`🔍 Auditoria NF → EntityId: ${entityId} → ${rows.length} registro(s)`);
        res.json({ rows });
    } catch (erro) {
        console.error('❌ Erro MySQL auditoria NF:', erro.message);
        res.status(500).json({ erro: 'Erro na consulta MySQL', detalhes: erro.message });
    } finally {
        await fecharConexao(conexao);
    }
});

// Listar manuais
app.get('/api/manuais', (req, res) => {
    res.json(manuaisData.map(m => ({
        nome: m.nome,
        arquivo: m.arquivo,
        caracteres: m.totalCaracteres,
        chunks: m.chunks?.length || 0,
        palavrasChave: m.palavrasChave || []
    })));
});

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================
async function iniciar() {
    try {
        iniciarMySQL();
        await carregarManuais();

        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
            console.log(`📚 Manuais carregados: ${manuaisData.length}`);
            console.log('='.repeat(50));
            console.log('\nEndpoints disponíveis:');
            console.log(`  GET  /health       - Health check`);
            console.log(`  POST /api/chat     - Chat com IA`);
            console.log(`  POST /api/buscar   - Buscar contexto`);
            console.log(`  GET  /api/stats    - Estatísticas`);
            console.log(`  GET  /api/manuais  - Listar manuais`);
            console.log(`  POST /api/nf/testar    - Testar credenciais MySQL`);
            console.log(`  POST /api/nf/auditoria - Consulta MySQL auditoria NF`);
            console.log('');
        });

    } catch (erro) {
        console.error('❌ Erro ao iniciar servidor:', erro);
        process.exit(1);
    }
}

iniciar();
