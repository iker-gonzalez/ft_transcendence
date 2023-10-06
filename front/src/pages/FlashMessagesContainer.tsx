import React from 'react';
import FlashMessage from '../components/UI/FlashMessage';
import { useFlashMessages } from '../context/FlashMessagesContext';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  position: absolute;
  visibility: hidden;
  top: 0;
  left: 0;
  z-index: 0;
`;

const FlashMessagesContainer: React.FC = (): JSX.Element => {
  const { showFlashMessage, text, level } = useFlashMessages();

  return (
    <WrapperDiv>
      {showFlashMessage && <FlashMessage text={text} level={level} />}
    </WrapperDiv>
  );
};

export default FlashMessagesContainer;
