import React from "react";
import { Link, useNavigate } from "react-router-dom";
import MainButton from "../components/UI/MainButton";
import { styled } from "styled-components";

const WrapperDiv = styled.div`
  .highlighted {
    color: yellow;
    font-weight: bold;
  }

  .warning-box {
    margin-top: 50px;
  }
`;

export default function GameIndex() {
  const navigate = useNavigate();

  const onGoToGameQueue = () => {
    navigate("queue");
  };

  return (
    <WrapperDiv>
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
      <MainButton onClick={onGoToGameQueue}>Go to Game queue</MainButton>
      <div className="warning-box">
        <p>
          ℹ️ If you want to simulate a match with two players, you first have to{" "}
          <Link to="/" className="highlighted">
            log in
          </Link>{" "}
          with our test users (<span className="highlighted">123456</span> and{" "}
          <span className="highlighted">111111</span>) ℹ️
        </p>
      </div>
    </WrapperDiv>
  );
}
