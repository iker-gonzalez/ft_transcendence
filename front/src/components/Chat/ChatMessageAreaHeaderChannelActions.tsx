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
  fetchAuthorized,
  getBaseUrl,
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
import { darkBgColor, primaryColor } from '../../constants/color-tokens';
import Cookies from 'js-cookie';
import BannedUser from '../../interfaces/banned-user.interface';
import ContrastPanel from '../UI/ContrastPanel';

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

const ConfirmOwnerLeavingModal = styled(Modal)`
  .actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
`;

const PasswordDeleteContrastPanel = styled(ContrastPanel)`
  margin-top: 24px;
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
`;

const PasswordRemovalConfirmModal = styled(Modal)`
  .actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
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
  const [isLeaveConfirmationModalVisible, setLeaveConfirmationModalVisible] =
    useState(false);
  const [isConfirmatioModalVisible, setConfirmatioModalVisible] =
    useState(false);
  const [isPasswordPopupVisible, setPasswordPopupVisible] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);

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

  const handleInvite = async (
    userAddIntra: number,
    userAddUsername: string,
  ) => {
    const status_code = await inviteFriendToChannel(
      channelData!.roomName || '',
      userAddIntra,
      channelOwnerIntraId || 0,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You invited ${userAddUsername}.`,
        FlashMessageLevel.SUCCESS,
      );
      onNewAction(group);
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

  const fetchBannedUsers = (roomName: string) => {
    fetchAuthorized(`${getBaseUrl()}/chat/bannedUsers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const channelBannedUsers = data.data.find((bannedUsersInfo: any) => {
          return bannedUsersInfo.name === roomName;
        });

        setBannedUsers(channelBannedUsers.bannedUsers);
      });
  };

  useEffect(() => {
    if (channelData) {
      setChannelOwnerIntraId(channelData.ownerIntra || null);
    }
  }, [group, channelData]);

  useEffect(() => {
    if (channelData) fetchBannedUsers(channelData.roomName);
  }, [channelData]);

  const patchPassword = async (password: string | null) => {
    const status_code = await patchChannelPassword(
      channelData!.roomName || '',
      channelOwnerIntraId || 0,
      password,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You ${password ? 'set' : 'removed'} the password for the channel ${
          channelData!.roomName || ''
        }.`,
        FlashMessageLevel.SUCCESS,
      );
      setPasswordPopupVisible(false);
      onNewAction(group);
      updateUserSidebar();
    } else {
      launchFlashMessage(
        `Password is not strong enough.`,
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
        `You left channel ${roomName}.`,
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

  return (
    <>
      <WrapperDiv>
        {(isAdmin() || isOwner()) && (
          <Badge className="admin-label">
            <p>
              {(() => {
                if (isOwner()) {
                  return 'Owner';
                } else if (isAdmin()) {
                  return 'Admin';
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
              <SecondaryButton onClick={triggerInvitePopUp}>
                Invite
              </SecondaryButton>
            )}
            {isInviteModalVisible && channelData?.type === 'PRIVATE' && (
              <FriendInvitationModal
                dismissModalAction={() => {
                  setInviteModalVisible(false);
                  setSelectedFriendToInvite(null);
                }}
              >
                <h1 className="title-1 mb-8">Invite friends to channel</h1>
                <p className="mb-24">
                  Select a friend that you want to invite to the channel.
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
                          {friend.username}
                        </option>
                      ))}
                  </MainSelect>
                  <MainButton
                    onClick={() => {
                      const friendToInvite = friendsToInvite.find(
                        (friend) => friend.intraId === selectedFriendToInvite,
                      );

                      if (friendToInvite)
                        handleInvite(
                          friendToInvite.intraId,
                          friendToInvite.username,
                        );

                      setSelectedFriendToInvite(null);
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
              disabled={(() => {
                const isNoUserToManage =
                  channelData?.usersInfo.length === 1 &&
                  bannedUsers.length === 0;

                const IsOnlyUserToManageOwner =
                  channelData?.usersInfo.length === 2 &&
                  userData?.intraId === channelData?.ownerIntra;

                return !isNoUserToManage && !IsOnlyUserToManageOwner;
              })()}
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
                  bannedUsers={bannedUsers}
                  setBannedUsers={setBannedUsers}
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
            const adminsCount = channelData?.adminsInfo.length || 0;

            if ((isOwner() || isAdmin()) && adminsCount <= 1) {
              setLeaveConfirmationModalVisible(true);
              return;
            }

            handleLeaveChannel(group.name);
            updateUserSidebar();
          }}
        >
          Leave
        </DangerButton>
      </WrapperDiv>
      {isLeaveConfirmationModalVisible && (
        <ConfirmOwnerLeavingModal
          dismissModalAction={() => {
            setLeaveConfirmationModalVisible(false);
          }}
        >
          <h1 className="title-1 mb-8">Do you confirm leaving?</h1>
          <p className="mb-24">
            You are the owner and only member of this channel. If you leave it,
            the channel will be automatically deleted.
          </p>
          <div className="actions-container">
            <SecondaryButton
              onClick={() => {
                setLeaveConfirmationModalVisible(false);
              }}
            >
              Cancel
            </SecondaryButton>
            <DangerButton
              onClick={() => {
                handleLeaveChannel(group.name);
                updateUserSidebar();
              }}
            >
              Confirm
            </DangerButton>
          </div>
        </ConfirmOwnerLeavingModal>
      )}
      {isPasswordPopupVisible && (
        <PasswordModal
          dismissModalAction={() => setPasswordPopupVisible(false)}
        >
          {channelData?.password ? (
            <>
              <h1 className="title-1 mb-16">Edit your password</h1>
              <p className="mb-24">
                Change the current password of the channel.
              </p>
            </>
          ) : (
            <>
              <h1 className="title-1 mb-16">Set a password</h1>
              <div className="mb-24">
                <p>
                  If you do so, the channel will not be public anymore. The
                  current membes list will be kept, but new users will need the
                  password to join.
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
            <div className="confirm-container mb-24">
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
                  setConfirmPassword('');
                }}
                disabled={password.length === 0 || confirmPassword.length === 0}
              >
                Confirm
              </MainButton>
            </div>
          </div>
          <p className="small">
            ℹ️ The password must have at least 6 characters, 1 uppercase
            character, 1 lowercase character, 1 symbol, and 1 number.
          </p>

          {channelData?.password && (
            <PasswordDeleteContrastPanel $backgroundColor={darkBgColor}>
              <h1 className="title-1 mb-16">Delete your password?</h1>
              <p className="mb-24">
                If you choose to do so, the channel will become public and,
                thus, its content will be visible to anyone.
              </p>
              <DangerButton
                onClick={() => {
                  setConfirmatioModalVisible(true);
                }}
              >
                Delete password
              </DangerButton>
            </PasswordDeleteContrastPanel>
          )}
          {isConfirmatioModalVisible && (
            <PasswordRemovalConfirmModal
              dismissModalAction={() => {
                setConfirmatioModalVisible(false);
              }}
            >
              <h1 className="title-1 mb-8">Do you confirm password removal?</h1>
              <p className="mb-24">
                If you do so, the channel will become public. Anyone will be
                able to join and read its contents.
              </p>
              <div className="actions-container">
                <SecondaryButton
                  onClick={() => {
                    setConfirmatioModalVisible(false);
                  }}
                >
                  Cancel
                </SecondaryButton>
                <DangerButton
                  onClick={() => {
                    patchPassword(null);
                    setPasswordPopupVisible(false);
                    onNewAction(group);
                    setConfirmatioModalVisible(false);
                  }}
                >
                  Confirm
                </DangerButton>
              </div>
            </PasswordRemovalConfirmModal>
          )}
        </PasswordModal>
      )}
    </>
  );
};

export default ChatMessageAreaHeaderChannelActions;
