import React from 'react';
import DangerButton from '../UI/DangerButton';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import User from '../../interfaces/chat-user.interface';
import DirectMessage from '../../interfaces/chat-message.interface';
import { createNewDirectMessage } from '../../utils/utils';
import UserData from '../../interfaces/user-data.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import { nanoid } from 'nanoid';

type ChatMessageAreaHeaderConvoActionsProps = {
  user: User;
  userData: UserData;
  onNewMessage: (message: DirectMessage | GroupMessage) => void;
  setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
  block: (username: string, intraId: number, block: number) => void;
};

const ChatMessageAreaHeaderConvoActions: React.FC<
  ChatMessageAreaHeaderConvoActionsProps
> = ({
  user,
  userData,
  onNewMessage,
  setShowFriendProfile,
  block,
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();

  return (
    <>
      {user && (
        <div className="actions-container">
          <MainButton
            disabled={user.isBlocked}
            onClick={() => {
              if (userData && user) {
                const invitationUrl =
                  window.location.origin +
                  '/game/invitation' +
                  '?' +
                  `invited=${user.intraId}` +
                  '&' +
                  `inviter=${userData.intraId}` +
                  '&' +
                  `id=${nanoid()}`;

                const newDirectMessage: DirectMessage = createNewDirectMessage({
                  selectedUser: user,
                  userData,
                  contentText: `Hey, ${user.username}! Fancy playing a 1vs1 match together? Click <a href="${invitationUrl}">here</a> to start a new game!`,
                });

                onNewMessage(newDirectMessage);
              } else {
                launchFlashMessage(
                  'Something went wrong. Try again later.',
                  FlashMessageLevel.ERROR,
                );
              }
            }}
          >
            Challenge
          </MainButton>
          <SecondaryButton
            disabled={user.isBlocked}
            onClick={() => setShowFriendProfile(true)}
          >
            Profile
          </SecondaryButton>
          <DangerButton
            onClick={() =>
              block(user.username, user.intraId, user.isBlocked ? 0 : 1)
            }
          >
            {user.isBlocked ? 'Unblock' : 'Block'}
          </DangerButton>
        </div>
      )}
    </>
  );
};

export default ChatMessageAreaHeaderConvoActions;
