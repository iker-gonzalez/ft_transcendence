import React, { useEffect, useRef, useState } from "react";
import { useGameRouteContext } from "../pages/Game";
import { createSearchParams, useNavigate } from "react-router-dom";
import User from "../models/user.interface";
import SessionData from "../models/session-data.interface";
import MainButton from "./UI/MainButton";
import { styled } from "styled-components";

type GameQueueRes = {
  queued: boolean;
};

type GameSessionRes = {
  success: boolean;
  data: SessionData;
};

const WrapperDiv = styled.div`
  .highlighted {
    color: yellow;
    font-weight: bold;
  }

  .session-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    width: fit-content;
    color: black;
    border-radius: 25px;
    padding: 15px 30px;
    margin: 10px;
  }

  .users-box {
    display: flex;
    gap: 30px;

    .user-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      p {
        font-weight: bold;
      }

      img {
        border-radius: 50%;
        width: 150px;
        object-fit: cover;
      }
    }
  }
`;

// TODO Replace with real userId from login
const userId: string | null = sessionStorage.getItem("intraId");

export default function GameQueue() {
  const navigate = useNavigate();

  const isComponentMounted = useRef<boolean>(false);
  const [isQueued, setIsQueued] = useState<boolean>(false);
  const [isSessionCreated, setIsSessionCreated] = useState<boolean>(false);
  const { matchmakingSocket, sessionDataState } = useGameRouteContext();

  useEffect(() => {
    // TODO remove this when we have a better way to store userId
    if (!userId) {
      navigate("/");
    }

    if (isComponentMounted.current) {
      return;
    }

    isComponentMounted.current = true;

    matchmakingSocket.on(
      `userJoined/${userId}`,
      (userJoinedRes: GameQueueRes) => {
        if (userJoinedRes.queued) {
          setIsQueued(true);
        }
      }
    );

    matchmakingSocket.on(
      `newSession/${userId}`,
      (newSessionRes: GameSessionRes) => {
        if (newSessionRes.success) {
          const setSessionData = sessionDataState[1];
          setSessionData(newSessionRes.data);

          setIsSessionCreated(true);
        } else {
          console.warn("error creating session");
        }
      }
    );

    matchmakingSocket.on(
      `unqueuedUser/${userId}`,
      (unqueuedUserRes: GameQueueRes) => {
        if (!unqueuedUserRes.queued) {
          setIsQueued(false);
        }
      }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onJoinQueue = () => {
    matchmakingSocket.emit(
      "newUser",
      JSON.stringify({
        intraId: userId,
      })
    );
  };

  const onGoToMatch = () => {
    navigate(
      {
        pathname: "/game/match",
        search: createSearchParams({
          sessionId: sessionDataState[0].id,
        }).toString(),
      },
      {
        replace: true,
      }
    );
  };

  const onRemoveFromQueue = () => {
    matchmakingSocket.emit(
      "unqueueUser",
      JSON.stringify({
        intraId: userId,
      })
    );
  };

  return (
    <WrapperDiv>
      <h1>
        Game queue for user with intradId{" "}
        <span className="highlighted">{userId}</span>
      </h1>
      <p>This is the page that is shown when users decide to join the queue.</p>
      <p>
        The user joins the queue and stays there until they're joined by another
        user.
      </p>
      <p>Once the session is created, the game session can start.</p>
      {(function () {
        if (isSessionCreated) {
          return (
            <div className="session-box">
              <h2>This is your new session</h2>
              <div className="users-box">
                {sessionDataState[0].players.map((player: User) => {
                  return (
                    <div className="user-box" key={player.id}>
                      <p>{player.username}</p>
                      <img alt="" src={player.avatar} />
                    </div>
                  );
                })}
              </div>
              <MainButton onClick={onGoToMatch}>Go to match</MainButton>
            </div>
          );
        } else {
          if (isQueued) {
            return (
              <>
                <p className="highlighted">
                  Queue joined. Waiting for another player to join...
                </p>
                <button onClick={onRemoveFromQueue}>Remove from queue</button>
              </>
            );
          } else {
            return <MainButton onClick={onJoinQueue}>Join a queue</MainButton>;
          }
        }
      })()}
    </WrapperDiv>
  );
}
