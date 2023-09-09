import React from "react";
import { Link } from "react-router-dom";

const GameIndex = () => {
  return (
    <div>
      <h1>Game Index</h1>
      <p>
        This is the content of the page that is shown when you first access the
        /game route
      </p>
      <p>
        Here we need to put on option to start a new game by joining the
        matchmaking first.
      </p>
      <Link to="queue" style={{ color: "yellow", fontWeight: "bold" }}>
        Go to Game queue
      </Link>
    </div>
  );
};

export default GameIndex;
