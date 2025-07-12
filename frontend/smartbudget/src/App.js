import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<LoginPage/>} />
        {/* <Route path ="/MainPage" element ={<MainPage/>}/> */}
        {/* <Route path = "/RankingsPage" element = {<RankingsPage/>}/> */}
        {/* <Route path = "/Leaderboard" element = {<Leaderboard/>}/> */}
      </Routes>
    </Router>
  );
}

export default App;
