import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import MintPage from './pages/MintPage';
import BurnPage from './pages/BurnPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/exportador" element={<MintPage />} />
        <Route path="/importador" element={<BurnPage />} />
      </Routes>
    </BrowserRouter>
  );
}