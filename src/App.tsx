import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Application from './pages/Application';

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
