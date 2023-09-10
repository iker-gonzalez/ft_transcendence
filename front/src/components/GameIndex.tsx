import React from "react";
import { Link } from "react-router-dom";

export default function GameIndex() {
  return (
    <div>
      <h1>Game Index</h1>
      <p>
        This is the content of the page that is shown when you first access the
        /game route
      </p>
      <p>
        Here we need to put an option to start a new game by joining the
        matchmaking first.
      </p>
      <p>Maybe we can show the latest games and the user stats.</p>
      <p>We could also show the user's friends that are online</p>
      <Link
        to="queue"
        style={{
          textDecoration: "none",
          padding: "10px 15px",
          width: "175px",
          height: "50px",
          backgroundColor: "#FFD369",
          color: "black",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        Go to Game queue
      </Link>
      <div style={{ marginTop: "50px" }}>
        <p>
          ℹ️ If you want to simulate a match with two players, you first have to
          log in with the our test users ℹ️
        </p>
        <ul style={{ maxWidth: "700px" }}>
          <li
            style={{
              fontFamily: "monospace",
              backgroundColor: "dimgray",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            curl --location 'http://localhost:3000/auth/intra/signin' \ --header
            'Content-Type: application/x-www-form-urlencoded' \ --data-urlencode
            'state=oI7a4edGeu8kamVFhYkJqF2EWu2zFk9A' \ --data-urlencode
            'code=111111'
          </li>
          <li
            style={{
              fontFamily: "monospace",
              backgroundColor: "dimgray",
              padding: "10px",
            }}
          >
            curl --location 'http://localhost:3000/auth/intra/signin' \ --header
            'Content-Type: application/x-www-form-urlencoded' \ --data-urlencode
            'state=oI7a4edGeu8kamVFhYkJqF2EWu2zFk9A' \ --data-urlencode
            'code=123456'
          </li>
        </ul>
      </div>
    </div>
  );
}
