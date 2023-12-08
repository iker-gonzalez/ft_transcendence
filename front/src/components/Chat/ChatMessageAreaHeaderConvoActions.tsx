import React, { useState } from 'react';
import DangerButton from '../UI/DangerButton';
import MainButton from '../UI/MainButton';
import User from '../../interfaces/chat-user.interface';
import DirectMessage from '../../interfaces/chat-message.interface';
import { createNewDirectMessage } from '../../utils/utils';
import UserData from '../../interfaces/user-data.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import { nanoid } from 'nanoid';
import SecondaryButton from '../UI/SecondaryButton';
import Modal from '../UI/Modal';
import styled from 'styled-components';

type ChatMessageAreaHeaderConvoActionsProps = {
  user: User;
  userData: UserData;
  onNewMessage: (message: DirectMessage | GroupMessage) => void;
  block: (intraId: number, block: number) => void;
};

const ActionsContainerDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const ChatMessageAreaHeaderConvoActions: React.FC<
  ChatMessageAreaHeaderConvoActionsProps
> = ({ user, userData, onNewMessage, block }): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

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
          {user.isBlocked ? (
            <SecondaryButton
              onClick={() => block(user.intraId, user.isBlocked ? 0 : 1)}
            >
              Unblock
            </SecondaryButton>
          ) : (
            <DangerButton onClick={() => setShowConfirmationModal(true)}>
              Block
            </DangerButton>
          )}
        </div>
      )}
      {showConfirmationModal && (
        <Modal
          dismissModalAction={() => {
            setShowConfirmationModal(false);
          }}
        >
          <h1 className="title-1 mb-8">Do you confirm blocking?</h1>
          <p className="mb-24">
            Once you block {user.username}, you won't be able to message each
            other. You will be able to unblock them later, if you want.
          </p>
          <ActionsContainerDiv>
            <SecondaryButton
              onClick={() => {
                setShowConfirmationModal(false);
              }}
            >
              Cancel
            </SecondaryButton>
            <DangerButton
              onClick={() => {
                setShowConfirmationModal(false);
                block(user.intraId, user.isBlocked ? 0 : 1);
              }}
            >
              Confirm
            </DangerButton>
          </ActionsContainerDiv>
        </Modal>
      )}
    </>
  );
};

export default ChatMessageAreaHeaderConvoActions;
