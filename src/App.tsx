import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateToken from './pages/Token/createToken';

import CreatePool from './pages/Pool/createPool';
import Application from './pages/Application';
// import Exchange from './pages/exchange';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Application />} />
      </Routes>
    </Router>
  );
}

export default App;
