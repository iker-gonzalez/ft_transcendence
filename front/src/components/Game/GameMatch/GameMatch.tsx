import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GameMatchVs from './GameMatchVs';
import GameMatchSolo from './GameMatchSolo';
import { useGameRouteContext } from '../../../pages/Game';

const GameMatch = (): JSX.Element => {
  const sessionId: string | null = useSearchParams()[0]?.get('sessionId');
  const isSoloPlayer: boolean = useSearchParams()[0]?.get('solo') === 'true';
  const { userData } = useGameRouteContext();
  const navigate = useNavigate();

  useEffect(() => {
    if ((!sessionId || !userData) && !isSoloPlayer) {
      navigate('/game');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {(() => {
        if (sessionId && userData) {
          return <GameMatchVs sessionId={sessionId} userData={userData} />;
        }

        if (isSoloPlayer) {
          return <GameMatchSolo />;
        }
      })()}
    </>
  );
};

export default GameMatch;
