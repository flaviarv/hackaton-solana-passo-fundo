import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MintPage() {
  const [lotes, setLotes] = useState([]);
  const [cnpjExportador, setCnpjExportador] = useState('');
  const [paisOrigem, setPaisOrigem] = useState('Brasil');
  const [paisDestino, setPaisDestino] = useState('China');
  const [toneladasSoja, setToneladasSoja] = useState('');
  const [valorTonelada, setValorTonelada] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem({ tipo: 'loading', texto: 'Emitindo tokens permissionados na Solana Testnet...' });

    try {
      await api.post('/lotes', {
        cnpjExportador,
        paisOrigem,
        paisDestino,
        toneladasSoja: parseInt(toneladasSoja, 10),
        valorTonelada: parseFloat(valorTonelada)
      });

      setMensagem({ tipo: 'success', texto: 'Lote registrado e tokens cunhados com sucesso!' });
      setCnpjExportador('');
      setToneladasSoja('');
      setValorTonelada('');
      carregarLotes();
    } catch (err) {
      const detalheErro = err.response?.data?.error || err.message || 'Erro ao emitir lote.';
      setMensagem({ 
        tipo: 'error', 
        texto: detalheErro 
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">🚢 Emissão de Carga (Portal do Exportador)</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">CNPJ do Exportador</label>
            <input 
              className="form-input" 
              placeholder="Ex: 14.661.660/0001-28" 
              value={cnpjExportador} 
              onChange={(e) => setCnpjExportador(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">País de Origem</label>
              <input 
                className="form-input" 
                value={paisOrigem} 
                onChange={(e) => setPaisOrigem(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">País de Destino</label>
              <input 
                className="form-input" 
                value={paisDestino} 
                onChange={(e) => setPaisDestino(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Volume (Toneladas)</label>
              <input 
                className="form-input" 
                type="number" 
                placeholder="Ex: 500" 
                value={toneladasSoja} 
                onChange={(e) => setToneladasSoja(e.target.value)} 
                required 
                min="1"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Preço por Tonelada (R$)</label>
              <input 
                className="form-input" 
                type="number" 
                step="0.01" 
                placeholder="Ex: 2500" 
                value={valorTonelada} 
                onChange={(e) => setValorTonelada(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={carregando}>
            {carregando ? 'Processando na Solana...' : 'Registrar Lote e Mintar Tokens'}
          </button>

          {mensagem.texto && (
            <div className={`status-msg status-${mensagem.tipo}`} style={{ wordBreak: 'break-all' }}>
              {mensagem.texto}
            </div>
          )}
        </form>
      </div>

      <h3 style={{ marginBottom: '14px' }}>Histórico de Lotes Emitidos</h3>
      {lotes.length === 0 ? (
        <p style={{ color: '#718096' }}>Nenhum lote registrado até o momento.</p>
      ) : (
        lotes.map((lote) => (
          <div key={lote.id} className="lote-item">
            <div className="lote-header">
              <span>CNPJ: {lote.cnpjExportador}</span>
              <span className="badge">{lote.status || 'Ativo'}</span>
            </div>
            <p style={{ fontSize: '14px', marginBottom: '6px' }}>
              <strong>Rota:</strong> {lote.paisOrigem} ➔ {lote.paisDestino} | <strong>Quantidade:</strong> {lote.toneladasSoja} tons
            </p>
            <p style={{ fontSize: '14px', marginBottom: '6px' }}>
              <strong>Valor Total:</strong> R$ {(lote.toneladasSoja * lote.valorTonelada).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {lote.blockchain?.mintAddress && (
              <div style={{ fontSize: '12px', color: '#718096', wordBreak: 'break-all', marginTop: '8px' }}>
                Mint: {lote.blockchain.mintAddress} <br />
                <a 
                  href={`https://solscan.io/tx/${lote.blockchain.signature}?cluster=testnet`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: '#3182ce', fontWeight: 'bold' }}
                >
                  Ver no Solscan (Testnet) ↗
                </a>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}