import React from "react";
import { Link } from "react-router-dom";

const GameQueue = () => {
  return (
    <div>
      <h1>Game queue</h1>
      <p>This is the page that is shown when users decide to join the queue.</p>
      <p>
        The user joins the queue and stays there until they're joined by another
        user.
      </p>
      <p>Once the session is created, the game session can start.</p>
      <Link to="/game/match" style={{ color: "yellow", fontWeight: "bold" }}>
        Go to Game match
      </Link>
    </div>
  );
};

export default GameQueue;
