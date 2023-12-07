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
import {
  patchChannelPassword,
  setAdminIntra,
  inviteFriendToChannel,
} from '../../utils/utils';
import styled from 'styled-components';
import MainPasswordInput from '../UI/MainPasswordInput';
import Badge from '../UI/Badge';
import ChatMessageAreaHeaderUsersModal from './ChatMessageAreaHeaderUsersModal';
import { CHANNEL_TYPES } from '../../constants/shared';
import { useUserFriends } from '../../context/UserDataContext';
import User from '../../interfaces/chat-user.interface';
import SecondaryButton from '../UI/SecondaryButton';
import MainSelect from '../UI/MainSelect';
import { primaryColor } from '../../constants/color-tokens';

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

const FriendInvitationModal = styled(Modal)`
  .friend-invitation-form {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    img {
      height: 38px;
      width: 38px;
      object-fit: cover;

      border: 1px solid ${primaryColor};
      border-radius: 5px;
    }
  }
`;

const PasswordModal = styled(Modal)`
  .edit-password-container {
    margin: 0 auto;
    width: fit-content;

    .password-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .confirm-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
    }
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const [selectedFriendToInvite, setSelectedFriendToInvite] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (channelData) {
      setChannelOwnerIntraId(channelData.ownerIntra || null);
    }
  }, [group, channelData]);

  const patchPassword = async (password: string | null) => {
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
              <FriendInvitationModal
                dismissModalAction={() => {
                  setInviteModalVisible(false);
                }}
              >
                <h1 className="title-1 mb-8">Invite friends to channel</h1>
                <p className="mb-24">
                  Select a friend to invite them to this channel.
                </p>
                <div className="friend-invitation-form">
                  {(() => {
                    const selectFriendData = friendsToInvite.find(
                      (friend) => friend.intraId === selectedFriendToInvite,
                    );

                    if (selectFriendData) {
                      return <img src={selectFriendData.avatar} alt="" />;
                    }
                  })()}
                  <MainSelect
                    onChange={(e) => {
                      setSelectedFriendToInvite(+e.target.value);
                    }}
                  >
                    <option>Select a friend</option>
                    {friendsToInvite
                      .filter(
                        (friend) =>
                          !channelData?.usersInfo.some(
                            (user) => user.username === friend.username,
                          ),
                      )
                      .map((friend) => (
                        <option key={friend.intraId} value={friend.intraId}>
                          <p>{friend.username}</p>
                        </option>
                      ))}
                  </MainSelect>
                  <MainButton
                    onClick={() => {
                      if (selectedFriendToInvite)
                        handleInvite(selectedFriendToInvite);
                    }}
                  >
                    Invite
                  </MainButton>
                </div>
              </FriendInvitationModal>
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
            {(() => {
              const isUserOwner = channelData?.ownerIntra === userData?.intraId;
              if (
                group &&
                channelData &&
                isUserOwner &&
                (channelData.type === CHANNEL_TYPES.PUBLIC ||
                  channelData.type === CHANNEL_TYPES.PROTECTED)
              ) {
                return (
                  <SecondaryButton
                    onClick={() => setPasswordPopupVisible(true)}
                  >
                    Password
                  </SecondaryButton>
                );
              }
              return null;
            })()}
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
                <p>
                  By doing so, the channel won't be public anymore. The current
                  member list will be kept, but new users will need the password
                  if they want to join.
                </p>
              </div>
            </>
          )}

          <div className="edit-password-container">
            <div className="password-container mb-8">
              <MainPasswordInput
                placeholder="Enter a new password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />
            </div>
            <div className="confirm-container">
              <MainPasswordInput
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e: any) => {
                  setConfirmPassword(e.target.value);
                }}
              />
              <MainButton
                onClick={() => {
                  if (password !== confirmPassword) {
                    launchFlashMessage(
                      `Passwords do not match.`,
                      FlashMessageLevel.ERROR,
                    );
                    setConfirmPassword('');
                    return;
                  }

                  patchPassword(password);
                  setPassword('');
                  setPasswordPopupVisible(false);
                  onNewAction(group);
                }}
              >
                Confirm
              </MainButton>
            </div>
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
                  patchPassword(null);
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
