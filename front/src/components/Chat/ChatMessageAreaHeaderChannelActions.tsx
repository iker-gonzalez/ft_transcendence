import React, { useEffect, useState } from 'react';
import DangerButton from '../UI/DangerButton';
import MainButton from '../UI/MainButton';
import UserData from '../../interfaces/user-data.interface';
import Modal from '../UI/Modal';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import Group from '../../interfaces/chat-group.interface';
import { Socket } from 'socket.io-client';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { patchChannelPassword, setAdminIntra, inviteFriendToChannel } from '../../utils/utils';
import styled from 'styled-components';
import MainPasswordInput from '../UI/MainPasswordInput';
import Badge from '../UI/Badge';
import ChatMessageAreaHeaderUsersModal from './ChatMessageAreaHeaderUsersModal';
import { CHANNEL_TYPES } from '../../constants/shared';
import { useUserFriends } from '../../context/UserDataContext';
import User from '../../interfaces/chat-user.interface';

type ChatMessageAreaHeaderChannelActionsProps = {
  userData: UserData | null;
  channelData: ChannelData | null;
  group: Group;
  onNewAction: (group: Group) => void;
  updateUserSidebar: () => void;
  socket: Socket;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | null>>;
};

const WrapperDiv = styled.div`
  flex: 1;

  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;

  .admin-label {
    margin-right: auto;
  }

  .main-actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    margin-left: 24px;

    button {
      white-space: nowrap;
    }
  }
`;

const PasswordModal = styled(Modal)`
  .edit-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .delete-password-container {
    margin-top: 32px;
  }
`;

const ChatMessageAreaHeaderChannelActions: React.FC<
  ChatMessageAreaHeaderChannelActionsProps
> = ({
  userData,
  channelData,
  group,
  onNewAction,
  updateUserSidebar,
  socket,
  setSelectedGroup,
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();
  const [password, setPasswordInput] = useState('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPasswordPopupVisible, setPasswordPopupVisible] = useState(false);

  const [channelOwnerIntraId, setChannelOwnerIntraId] = useState<number | null>(
    null,
  );

  const { userFriends, fetchFriendsList } = useUserFriends();
  const triggerInvitePopUp = async () => {
    if (userFriends.length === 0) {
      await fetchFriendsList();
    }
    setFriendsToInvite(userFriends);
    setInviteModalVisible(true);
    console.log('invite');
  };

  // channelName: string,
  // friendIntraId: number,
  // ownerIntraId: number,

  const handleInvite = async (userAddIntra: number) => {
    console.log('friend to invite intraId', userAddIntra);
    const status_code = await inviteFriendToChannel(
      channelData!.roomName || '',
      userAddIntra,
      channelOwnerIntraId || 0,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have successfully invited the user ${userAddIntra}.`,
        FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
    setInviteModalVisible(false);
  };

  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [friendsToInvite, setFriendsToInvite] = useState<User[]>([]); // replace User with your user type

  useEffect(() => {
    if (channelData) {
      setChannelOwnerIntraId(channelData.ownerIntra || null);
    }
  }, [group, channelData]);

  const setPassword = async (password: string | null) => {
    const status_code = await patchChannelPassword(
      channelData!.roomName || '',
      channelOwnerIntraId || 0,
      password,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have successfully ${
          password ? 'set' : 'removed'
        } the password for the channel ${channelData!.roomName || ''}.`,
        FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

  const handleLeaveChannel = (roomName: string) => {
    if (socket) {
      const payload = {
        roomName: roomName,
        intraId: userData?.intraId,
      };
      socket.emit('leaveRoom', payload);

      launchFlashMessage(
        `You left the room ${roomName}!`,
        FlashMessageLevel.SUCCESS,
      );
      setSelectedGroup(null);
    }
  };

  const isOwner = () => channelData?.ownerIntra === userData?.intraId;
  const isAdmin = () =>
    Boolean(
      channelData?.adminsInfo?.some(
        (admin: any) => admin.intra === userData?.intraId,
      ),
    );

  const canSeeActions = (): boolean => {
    return isOwner() || isAdmin();
  };

  console.log('channelData. type', channelData?.type);

  return (
    <>
      <WrapperDiv>
        {(isAdmin() || isOwner()) && (
          <Badge className="admin-label">
            <p>
              {(() => {
                if (isAdmin()) {
                  return 'Admin';
                } else if (isOwner()) {
                  return 'Owner';
                } else {
                  return 'Admin + Owner';
                }
              })()}
            </p>
          </Badge>
        )}
        {canSeeActions() && (
          <div className="main-actions-container">
            {channelData?.type === 'PRIVATE' && (
            <MainButton onClick={triggerInvitePopUp}>Invite</MainButton>
            )}
            {isInviteModalVisible && channelData?.type === 'PRIVATE' && (
              <Modal
                dismissModalAction={() => {
                  setInviteModalVisible(false);
                }}
              >
                <h1>Invite Friends</h1>
                {friendsToInvite
                  .filter(
                    (friend) =>
                      !channelData?.usersInfo.some(
                        (user) => user.username === friend.username,
                      ),
                  )
                  .map((friend) => (
                    <div key={friend.intraId}>
                      <p>{friend.username}</p>
                      <MainButton
                        onClick={() => {
                          handleInvite(friend.intraId);
                        }}
                      >
                        Invite
                      </MainButton>
                    </div>
                  ))}
              </Modal>
            )}
            <MainButton
              onClick={() => {
                setPopupVisible(true);
              }}
              disabled={channelData?.usersInfo.length === 1}
            >
              Manage
            </MainButton>
            {channelData && isPopupVisible && (
              <Modal
                dismissModalAction={() => {
                  setPopupVisible(false);
                }}
              >
                <ChatMessageAreaHeaderUsersModal
                  channelData={channelData}
                  userData={userData}
                  setAdminIntra={setAdminIntra}
                  channelOwnerIntraId={channelOwnerIntraId}
                  setPopupVisible={setPopupVisible}
                  onNewAction={onNewAction}
                  group={group}
                  socket={socket}
                />
              </Modal>
            )}
            {group && channelOwnerIntraId === userData?.intraId && (
              <>
                {channelData?.type === CHANNEL_TYPES.PUBLIC ? (
                  <MainButton onClick={() => setPasswordPopupVisible(true)}>
                    Set password
                  </MainButton>
                ) : channelData?.type === CHANNEL_TYPES.PROTECTED ? (
                  <>
                    <MainButton onClick={() => setPasswordPopupVisible(true)}>
                      Edit password
                    </MainButton>
                  </>
                ) : null}
              </>
            )}
          </div>
        )}
        <DangerButton
          onClick={() => {
            handleLeaveChannel(group.name);
            updateUserSidebar();
          }}
        >
          Leave
        </DangerButton>
      </WrapperDiv>
      {isPasswordPopupVisible && (
        <PasswordModal
          dismissModalAction={() => setPasswordPopupVisible(false)}
        >
          {channelData?.password ? (
            <>
              <h1 className="title-1 mb-16">Edit your password</h1>
              <p className="mb-24">Choose a new password for this channel.</p>
            </>
          ) : (
            <>
              <h1 className="title-1 mb-16">Set a password</h1>
              <div className="mb-24">
                <p className="mb-8">Set a password for this channel.</p>
                <p>
                  By doing so, the channel won't be public anymore. Users that
                  don't have the password won't be able to join.
                </p>
              </div>
            </>
          )}

          <div className="edit-password-container">
            <MainPasswordInput
              placeholder="Enter a new password"
              value={password}
              onChange={(e: any) => setPasswordInput(e.target.value)}
            />
            <MainButton
              onClick={() => {
                setPassword(password);
                setPasswordInput('');
                setPasswordPopupVisible(false);
                onNewAction(group);
              }}
            >
              Confirm
            </MainButton>
          </div>
          {channelData?.password && (
            <div className="delete-password-container">
              <h1 className="title-1 mb-16">Delete your password</h1>
              <p className="mb-24">
                If you choose to do so, the channel will become public and,
                thus, its content will be visible to anyone.
              </p>
              <DangerButton
                onClick={() => {
                  setPassword(null);
                  setPasswordPopupVisible(false);
                  onNewAction(group);
                }}
              >
                Remove password
              </DangerButton>
            </div>
          )}
        </PasswordModal>
      )}
    </>
  );
};

export default ChatMessageAreaHeaderChannelActions;
