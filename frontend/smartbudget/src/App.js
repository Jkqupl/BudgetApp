import logo from './logo.svg';
import './index.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element = {<LoginPage/>} />
        {/* <Route path ="/MainPage" element ={<MainPage/>}/> */}
        {/* <Route path = "/RankingsPage" element = {<RankingsPage/>}/> */}
        {/* <Route path = "/Leaderboard" element = {<Leaderboard/>}/> */}
      </Routes>
    </Router>
  );
}

export default App;
