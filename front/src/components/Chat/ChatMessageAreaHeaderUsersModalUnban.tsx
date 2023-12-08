import React from 'react';
import ContrastPanel from '../UI/ContrastPanel';
import { darkBgColor } from '../../constants/color-tokens';
import MainButton from '../UI/MainButton';
import styled from 'styled-components';
import BannedUser from '../../interfaces/banned-user.interface';
import { Socket } from 'socket.io-client';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';

type ChatMessageAreaHeaderUsersModalUnbanProps = {
  bannedUserInfo: BannedUser;
  setBannedUsers: React.Dispatch<React.SetStateAction<BannedUser[]>>;
  socket: Socket;
  adminId: number;
  roomName: string;
};

const BannedUserContainer = styled.div`
  margin-top: 24px;
`;

const ChatMessageAreaHeaderUsersModalUnban: React.FC<
  ChatMessageAreaHeaderUsersModalUnbanProps
> = ({
  bannedUserInfo,
  setBannedUsers,
  socket,
  adminId,
  roomName,
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();

  const unban = () => {
    const payload = {
      intraId: bannedUserInfo.intraId,
      addAdminId: adminId,
      roomName,
    };
    socket.emit('UnBanUser', payload, (res: any) => {
      if (res.success) {
        launchFlashMessage(
          `You unbanned ${bannedUserInfo.username}.`,
          FlashMessageLevel.SUCCESS,
        );

        // For local state
        setBannedUsers((prevBannedUsers) =>
          prevBannedUsers.filter(
            (bannedUser) => bannedUser.intraId !== bannedUserInfo.intraId,
          ),
        );
      } else {
        launchFlashMessage(
          'Something went wrong. Try again later.',
          FlashMessageLevel.ERROR,
        );
      }
    });
  };

  return (
    <>
      <BannedUserContainer>
        <ContrastPanel $backgroundColor={darkBgColor}>
          <h2 className="title-3 mb-8">Ready to forgive?</h2>
          <p className="mb-16">
            You can use the button below to unban {bannedUserInfo.username} and
            allow them to join the channel again.
          </p>
          <MainButton onClick={unban}>Unban</MainButton>
        </ContrastPanel>
      </BannedUserContainer>
    </>
  );
};

export default ChatMessageAreaHeaderUsersModalUnban;
