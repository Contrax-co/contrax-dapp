import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateToken from './pages/createToken';
import ManageToken from './pages/manageToken';
import CreatePool from './pages/createPool';
import Application from './pages/Application';
// import Exchange from './pages/exchange';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Application />} />

        <Route path="/create-a-token" element={<CreateToken />} />

        <Route path="/manage-token" element={<ManageToken />} />

        <Route path="/create-pool" element={<CreatePool />} />

        {/* <Route path="/exchange" element={<Exchange />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
