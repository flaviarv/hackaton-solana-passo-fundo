import { NavLink, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  // Oculta a Navbar na tela inicial de seleção
  if (location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('usuarioLogado');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" onClick={handleLogout} style={{ textDecoration: 'none' }} className="nav-brand">
          🌾 <span>Agro Trace Brasil</span>
        </Link>
        <div className="nav-network">
          <span className="network-dot"></span>
          Solana Testnet
        </div>
      </div>

      <div className="nav-links">
        <NavLink 
          to="/exportador" 
          className={({ isActive }) => `nav-btn exportador ${isActive ? 'active' : ''}`}
        >
          🚢 Exportador (Mint)
        </NavLink>
        <NavLink 
          to="/importador" 
          className={({ isActive }) => `nav-btn importador ${isActive ? 'active' : ''}`}
        >
          🏭 Importador (Burn)
        </NavLink>
        <Link 
          to="/" 
          onClick={handleLogout}
          className="nav-btn logout"
        >
          🚪 Sair
        </Link>
      </div>
    </nav>
  );
}