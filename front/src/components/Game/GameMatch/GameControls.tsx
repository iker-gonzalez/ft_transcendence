import React from 'react';
import styled from 'styled-components';
import { primaryAccentColor } from '../../../constants/color-tokens';
import Modal from '../../UI/Modal';
import SVG from 'react-inlinesvg';
import InfoIcon from '../../../assets/svg/info.svg';

type GameControlsProps = {
  className?: string;
};

const CtaButton = styled.button`
  margin-left: auto;
  margin-right: 35px;

  color: ${primaryAccentColor};
  font-weight: bold;
  padding: 10px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .icon {
    width: 20px;
    height: 20px;
  }
`;

const WrapperDiv = styled.div`
  dl {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-row-gap: 12px;
    grid-column-gap: 50px;

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
  const [showGameControls, setShowGameControls] =
    React.useState<boolean>(false);

  return (
    <>
      <CtaButton
        onClick={() => {
          setShowGameControls(true);
        }}
      >
        Show controls <SVG src={InfoIcon} className="icon" />
      </CtaButton>
      {showGameControls && (
        <Modal
          dismissModalAction={() => {
            setShowGameControls(false);
          }}
        >
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
        </Modal>
      )}
    </>
  );
};

export default GameControls;
