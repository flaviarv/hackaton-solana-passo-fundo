import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BurnPage() {
  const [lotes, setLotes] = useState([]);
  const [mintAddress, setMintAddress] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '', logs: [] });
  const [carregando, setCarregando] = useState(false);

  const carregarLotes = async () => {
    try {
      const res = await api.get('/lotes');
      setLotes(res.data);
    } catch (err) {
      console.error('Erro ao buscar lotes:', err);
    }
  };

  useEffect(() => {
    carregarLotes();
  }, []);

  const handleBurn = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ tipo: 'loading', texto: 'Liquidando tokens na Solana Testnet...', logs: [] });

    try {
      const res = await api.post('/lotes/burn', {
        mintAddress,
        quantidade: parseInt(quantidade, 10)
      });

      setMensagem({ 
        tipo: 'success', 
        texto: `Tokens queimados com sucesso! Tx: ${res.data.resultado?.signature || res.data.message}`,
        logs: []
      });
      setMintAddress('');
      setQuantidade('');
      carregarLotes();
    } catch (err) {
      const backendError = err.response?.data?.error || err.message || 'Falha ao executar queima.';
      const backendLogs = err.response?.data?.logs || [];

      setMensagem({
        tipo: 'error',
        texto: backendError,
        logs: backendLogs
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ borderColor: '#fed7d7' }}>
        <h2 className="card-title" style={{ color: '#9b2c2c' }}>
          🏭 Desembarque & Liquidação (Portal do Importador)
        </h2>
        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
          Realize o desembaraço aduaneiro e dê baixa no lastro físico queimando os tokens correspondentes às toneladas descarregadas.
        </p>

        <form onSubmit={handleBurn}>
          <div className="form-group">
            <label className="form-label">Selecionar Carga / Lote</label>
            <select 
              className="form-input" 
              value={mintAddress} 
              onChange={(e) => setMintAddress(e.target.value)} 
              required
            >
              <option value="">-- Selecione o lote de soja --</option>
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.blockchain?.mintAddress}>
                  {lote.paisOrigem} ➔ {lote.paisDestino} | Saldo: {lote.toneladasSoja} tons (CNPJ: {lote.cnpjExportador})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Toneladas Desembarcadas (Queima)</label>
            <input 
              className="form-input" 
              type="number" 
              min="1" 
              placeholder="Ex: 5" 
              value={quantidade} 
              onChange={(e) => setQuantidade(e.target.value)} 
              required 
            />
          </div>

          <button className="btn btn-danger" type="submit" disabled={carregando}>
            {carregando ? 'Liquidando na Blockchain...' : 'Confirmar Recebimento e Queimar Tokens'}
          </button>

          {mensagem.texto && (
            <div 
              className={`status-msg status-${mensagem.tipo}`} 
              style={{ 
                textAlign: 'left', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                fontFamily: mensagem.tipo === 'error' ? 'monospace' : 'inherit',
                fontSize: mensagem.tipo === 'error' ? '12px' : '14px',
                marginTop: '14px'
              }}
            >
              <strong>Status:</strong> {mensagem.texto}
              
              {mensagem.logs && mensagem.logs.length > 0 && (
                <div style={{ marginTop: '10px', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #fed7d7' }}>
                  <strong>Logs da Transação (Solana):</strong>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    {mensagem.logs.map((log, index) => (
                      <li key={index}>{log}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}