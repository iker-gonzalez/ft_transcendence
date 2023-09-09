import React from "react";
import GameMatch from "../components/GameMatch";
import { Link, Outlet } from "react-router-dom";

const Game = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default Game;
