import './App.css'
import Game from './components/Game'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Leaderboard } from './components/Leaderboard';
import { PrivacyPolicy } from './components/PrivacyPolicy';

function App() {
  return (
    <BrowserRouter>
      <nav style={{
        backgroundColor: '#4d4d4e57', 
        padding: '10px', 
        textAlign: 'center', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        zIndex: 1000
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <ul style={{ listStyleType: 'none', margin: 5, padding: 0 }}>
            <li style={{ display: 'inline', marginRight: '120px' }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>Play</Link>
            </li>
            <li style={{ display: 'inline', marginRight: '120px' }}>
              <Link to="/leaderboard" style={{ textDecoration: 'none', color: 'white' }}>Leaderboard</Link>
            </li>
            <li style={{ display: 'inline' }}>
              <Link to="/privacy-policy" style={{ textDecoration: 'none', color: 'white' }}>Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </nav>
      <div style={{ paddingTop: '0px' }}>
        <Routes>
          <Route path='/' element={<Game />} />
          <Route path='/leaderboard' element={<Leaderboard />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
