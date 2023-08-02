import React from 'react';
import MyFirstComponent from "./components/MyFisrtComponent";
import SecondComponent from "./components/SecondComponent";

function App() {
    const onClickButton = () => alert("Button clicked");
    return (
    <>
     <h1>Hello World!</h1>
    <MyFirstComponent />
     <button onClick={onClickButton}>Click here</button>
    <SecondComponent />
   </>
    );   
}

export default App;
