import { mintarTokenSojaPermissionado, queimarTokenSoja } from '../services/solanaService.js';

// Armazenamento em memória (enquanto o servidor estiver rodando)
export const lotes = [];

export const cadastrarLote = async (req, res) => {
  const { cnpjExportador, paisOrigem, paisDestino, toneladasSoja, valorTonelada } = req.body;

  try {
    const dadosBlockchain = await mintarTokenSojaPermissionado({
      toneladasSoja,
      valorTonelada,
      cnpjExportador,
      paisOrigem,
      paisDestino
    });

    const novoLote = {
      id: Date.now(),
      cnpjExportador,
      paisOrigem,
      paisDestino,
      toneladasSoja: Number(toneladasSoja),
      valorTonelada: Number(valorTonelada),
      valorTotal: Number(toneladasSoja) * Number(valorTonelada),
      status: 'Ativo (Em trânsito)',
      blockchain: dadosBlockchain
    };

    lotes.push(novoLote);
    return res.status(201).json(novoLote);
  } catch (error) {
    console.error('Erro ao cadastrar lote e mintar token:', error);
    return res.status(500).json({ error: error.message || 'Erro ao processar na Solana' });
  }
};

export const listarLotes = (req, res) => {
  return res.status(200).json(lotes);
};

export const queimarLote = async (req, res) => {
  const { mintAddress, quantidade } = req.body;

  if (!mintAddress || !quantidade) {
    return res.status(400).json({ error: 'mintAddress e quantidade são obrigatórios.' });
  }

  try {
    const resultado = await queimarTokenSoja({
      mintAddress,
      quantidadeTokens: quantidade
    });

    const lote = lotes.find(l => l.blockchain?.mintAddress === mintAddress);
    if (lote) {
      lote.toneladasSoja = Math.max(0, lote.toneladasSoja - Number(quantidade));
      lote.status = lote.toneladasSoja === 0 ? 'Liquidado (Queimado)' : 'Parcialmente Liquidado';
    }

    return res.status(200).json({
      message: 'Tokens queimados com sucesso na Testnet!',
      resultado
    });
  } catch (error) {
    console.error('--- ERRO NO PROCESSAMENTO DO BURN ---');
    console.error(error);

    const logs = typeof error.getLogs === 'function' ? error.getLogs() : (error.logs || []);
    return res.status(500).json({
      error: error.message || 'Erro ao processar queima na Solana',
      logs
    });
  }
};