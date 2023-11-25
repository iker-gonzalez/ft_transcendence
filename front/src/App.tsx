import React from 'react';
import SignIn from './pages/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/UI/Navigation';
import UserProfile from './pages/UserProfile';
import Game from './pages/Game';
import GameMatch from './components/Game/GameMatch/GameMatch';
import GameIndex from './components/Game/GameIndex';
import GameQueue from './components/Game/GameQueue';
import Login from './components/Login';
import { UserDataProvider } from './context/UserDataContext';
import { FlashMessagesProvider } from './context/FlashMessagesContext';
import FlashMessagesContainer from './pages/FlashMessagesContainer';
import Leaderboard from './pages/Leaderboard';
import UserStats from './pages/UserStats';
import Chat from './pages/Chat';
import GameSession from './components/Game/GameSession';


function App() {
  return (
    <UserDataProvider>
      <FlashMessagesProvider>
        <FlashMessagesContainer />
        <Router>
          <div>
            <Navigation />
            <Routes>
              <Route path="/" element={<SignIn />} />
              {/* <Route path="/set-profile" element={<SetProfile />} /> */}
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="game" element={<Game />}>
                <Route index element={<GameIndex />} />
                <Route path="queue" element={<GameQueue />} />
                <Route path="session" element={<GameSession />} />
                <Route path="match" element={<GameMatch />} />
              </Route>
              <Route path="stats" element={<UserStats />} />
              <Route path="chat" element={<Chat />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Routes>
          </div>
        </Router>
      </FlashMessagesProvider>
    </UserDataProvider>
  );
}

export default App;
