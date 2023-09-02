import React from 'react';
import SignIn from "./components/SignIn";
import SetProfile from './components/SetProfile';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
      
    return (
        <Router>
        <div>
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/set-profile" element={<SetProfile />} />
          </Routes>
        </div>
        </Router>
      );
    };

export default App;