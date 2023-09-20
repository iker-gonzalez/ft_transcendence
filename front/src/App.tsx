import React, { useState } from 'react';
import SignIn from './pages/Home';
import SetProfile from './pages/SetProfile';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import UserProfile from './pages/UserProfile';
import Game from './pages/Game';
import GameMatch from './components/GameMatch';
import GameIndex from './components/GameIndex';
import GameQueue from './components/GameQueue';
import LoadingPage from './pages/LoadingPage';
import Login from './components/Login';

function App() {
  // TODO refactor this with global store like Context API or Redux
  const [userData, setUserData] = useState<UserData | null>(null);
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/set-profile" element={<SetProfile />} />
          <Route
            path="/profile"
            element={<UserProfile userData={userData} />}
          />
          <Route
            path="/login"
            element={<Login userData={userData} setUserData={setUserData} />}
          />
          <Route path="/loading" element={<LoadingPage targetPath={''} />} />
          <Route path="game" element={<Game />}>
            <Route index element={<GameIndex />} />
            <Route path="queue" element={<GameQueue />} />
            <Route path="match" element={<GameMatch />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
