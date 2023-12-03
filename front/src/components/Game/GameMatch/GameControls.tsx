import React from 'react';
import styled from 'styled-components';
import ContrastPanel from '../../UI/ContrastPanel';

type GameControlsProps = {
  className?: string;
};

const WrapperDiv = styled.div`
  width: 100%;

  dl {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-row-gap: 12px;
    grid-column-gap: 100px;

    dt {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      text-align: left;
    }

    dd {
      text-align: right;
    }
  }
`;

const GameControls: React.FC<GameControlsProps> = ({
  className,
}): JSX.Element => {
  return (
    <ContrastPanel>
      <WrapperDiv className={className}>
        <h3 className="title-3 mb-24">Controls</h3>
        <dl>
          <dt>Movement</dt>
          <dd>🐁 or ⬆️/⬇️</dd>
          <dt>Music</dt>
          <dd>H 🔊 - L 🔉 - M 🔇</dd>
          <dt>Pause</dt>
          <dd>P</dd>
        </dl>
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default GameControls;
