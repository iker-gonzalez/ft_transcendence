import React, { useState } from 'react';

function Signin() {

    return (
        <>
            <form>
                <div>
                    <label htmlFor="username"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" name="username" required />

                    <label htmlFor="password"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" name="password" />

                    <button type="submit">Login</button>
                    <label>
                        <input type="checkbox" name="remember">Remember me the password</input>
                    </label>
                </div>
            </form>
        </>
    );
}

export default Signin;