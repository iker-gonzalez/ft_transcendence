import React from 'react';
import SignIn from "./pages/SignIn";
import SetProfile from './pages/SetProfile';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import UserProfile from './pages/UserProfile';


function App() {
      
    return (
        <Router>
        <div>
          <Navigation />
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/set-profile" element={<SetProfile />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </div>
        </Router>
      );
    };

export default App;