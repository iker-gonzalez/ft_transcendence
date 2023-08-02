import React from 'react';

function SecondComponent() {
    //get a random integer:
    const min = 1;
    const max = 100;
    const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
    return (
        <>
            <h2>We are finishing this project in {randomInteger} days</h2>
        </>
    );
}

export default SecondComponent;