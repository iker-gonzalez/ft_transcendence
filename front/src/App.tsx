import React from 'react';

function App() {
    const onClickButton = () => alert("Button clicked");
    const contentStyle = {
      color: "#00babc",
      fontSize: "20px",
    };
    return (
    <>
     <h1>Hello World!</h1>
        <p style={{ color: "#00babc", fontSize: "20px" }}>42Tokyo : Japan</p>
        <p style={contentStyle}>42Tokyo : Japan</p>
     <button onClick={onClickButton}>Click here</button>
   </>
    );   
}

export default App;
