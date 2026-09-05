import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleEntrar = (rota, tipoUsuario) => {
    sessionStorage.setItem('usuarioLogado', tipoUsuario);
    navigate(rota);
  };

return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '60px', textAlign: 'center' }}>
      <div className="card" style={{ padding: '40px 30px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌾</div>
        <h1 className="page-title" style={{ fontSize: '26px', marginBottom: '8px', color: '#f8fafc' }}>
          Agro Trace Brasil
        </h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>
          Plataforma Institucional de Rastreabilidade e Tokenização de Soja na Solana Testnet
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => handleEntrar('/exportador', 'exportador')}
            className="btn btn-primary"
            style={{ padding: '16px', fontSize: '16px', borderRadius: '10px' }}
          >
            Acessar Portal do Exportador (Emissão & Mint)
          </button>

          <button
            onClick={() => handleEntrar('/importador', 'importador')}
            className="btn btn-danger"
            style={{ padding: '16px', fontSize: '16px', borderRadius: '10px' }}
          >
            Acessar Portal do Importador (Desembarque & Burn)
          </button>
        </div>

        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
          <span className="nav-network">
            <span className="network-dot"></span>
            Rede Ativa: Solana Testnet (Token-2022)
          </span>
        </div>
      </div>
    </div>
  );
}