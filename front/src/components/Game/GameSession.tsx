import React from 'react';
import CenteredLayout from '../UI/CenteredLayout';
import ContrastPanel from '../UI/ContrastPanel';
import GameMatchQueueSession from './GameMatch/GameMatchQueueSession';
import { useGameRouteContext } from '../../pages/Game';

const GameSession: React.FC = (): JSX.Element => {
  const { sessionDataState } = useGameRouteContext();

  return (
    <CenteredLayout>
      <h1 className="title-1 mb-24">This is your new session</h1>
      <ContrastPanel className="session-box mb-16">
        <GameMatchQueueSession
          sessionId={sessionDataState[0]?.id}
          players={sessionDataState[0]?.players}
        />
      </ContrastPanel>
    </CenteredLayout>
  );
};

export default GameSession;
