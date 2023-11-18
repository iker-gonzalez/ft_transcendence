import React from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import RoundImg from '../UI/RoundImage';

const HeaderWrapper = styled.div`
  position: relative; // Add this line
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid white;
`;

const Title = styled.h2`
  font-size: 33px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-left: 90px; // Add this line
`;
const Avatar = styled(RoundImg)`
  position: absolute; // Add this line
  left: 15px; // Add this line
  top: 5px; // Add this line
  width: 60px;
  height: 60px;
  margin-right: 0px;
`;

const MainButtonStyled = styled(MainButton)`
  margin-left: 15px;
  margin-bottom: 25px;
  margin-top: 15px;
  margin-right: 15px;
`;

interface ChatMessageAreaHeaderProps {
  name: string;
  avatarSrc: string;
}

const ChatMessageAreaHeader: React.FC<ChatMessageAreaHeaderProps> = ({ name, avatarSrc }) => (
  <HeaderWrapper>
    <div>
    <Avatar src={avatarSrc} alt={name} />
    <Title>{name}</Title>
    </div>
    <div>
      <MainButtonStyled>Play</MainButtonStyled>
      <MainButtonStyled>Profile</MainButtonStyled>
      <MainButtonStyled>Block</MainButtonStyled>
    </div>
  </HeaderWrapper>
);

export default ChatMessageAreaHeader;