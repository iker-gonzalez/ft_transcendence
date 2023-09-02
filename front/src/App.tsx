import React from 'react';
import SignIn from "./components/SignIn";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
    const handleSignIn = (username: string, password: string) => {
        // Handle the sign-in logic here, such as sending the credentials to a server for authentication.
        
      };    
      
    return (
        <div>
          <h1>Sign In</h1>
          <SignIn onSignIn={handleSignIn} />
        </div>
      );
    };

export default App;