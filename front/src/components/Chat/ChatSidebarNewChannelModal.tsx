import React, { useEffect } from 'react';
import MainInput from '../UI/MainInput';
import Group from '../../interfaces/chat-group.interface';
import MainSelect from '../UI/MainSelect';
import MainButton from '../UI/MainButton';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import styled from 'styled-components';
import { CHANNEL_TYPES } from '../../constants/shared';
import MainPasswordInput from '../UI/MainPasswordInput';
import ContrastPanel from '../UI/ContrastPanel';
import { darkBgColor, errorColor } from '../../constants/color-tokens';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import { useUserData } from '../../context/UserDataContext';
import FormattedList from '../UI/FormattedList';
import { Socket } from 'socket.io-client';

type ChatSidebarNewChannelModalProps = {
  roomName: string;
  setRoomName: React.Dispatch<React.SetStateAction<string>>;
  isRoomNameValid: boolean;
  setIsRoomNameValid: React.Dispatch<React.SetStateAction<boolean>>;
  allGroups: Group[] | null;
  groupNature: string;
  setGroupNature: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleJoinRoom: (
    group: Group,
    password: string,
    isNewGroup: boolean,
  ) => Promise<number | undefined>;
  updateUserSidebar: () => void;
  userGroups: Group[] | null;
  setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setPasswordPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProtectedGroupToJoin: React.Dispatch<
    React.SetStateAction<Group | null>
  >;
  handleGroupClick: (group: Group) => void;
  socket: Socket | null;
};

const WrapperDiv = styled.div`
  .channel-name-container {
    position: relative;

    .error-message {
      color: ${errorColor};

      position: absolute;
      left: 0;
      bottom: -21px;
    }
  }

  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .password-containers-wrapper {
    margin: 0 auto;
    width: fit-content;
  }

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

  .existing-channels-container {
    margin-top: 32px;

    .ban-disclaimer {
      margin-top: 16px;
    }
  }
`;

const ChatSidebarNewChannelModal: React.FC<ChatSidebarNewChannelModalProps> = ({
  roomName,
  setRoomName,
  isRoomNameValid,
  setIsRoomNameValid,
  allGroups,
  groupNature,
  setGroupNature,
  password,
  setPassword,
  handleJoinRoom,
  updateUserSidebar,
  userGroups,
  setPopupVisible,
  setPasswordPopupVisible,
  setSelectedProtectedGroupToJoin,
  handleGroupClick,
  socket,
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();
  const [selectedExistingGroup, setSelectedExistingGroup] =
    React.useState<Group | null>(null);
  const [confirmationPassword, setConfirmationPassword] = React.useState('');
  const [bannedUsers, setBannedUsers] = React.useState<any[]>([]);
  const { userData } = useUserData();

  useEffect(() => {
    fetchAuthorized(`${getBaseUrl()}/chat/bannedUsers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
      .then((res) => {
        if (res.ok && res.headers.get('Content-Type')?.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Server response was not ok or not JSON.');
        }
      })
      .then((data) => {
        setBannedUsers(data.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  
    return () => {
      setIsRoomNameValid(true);
    };
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const onJoiningNewChannel = async (): Promise<void> => {
    if (password !== confirmationPassword) {
      launchFlashMessage(`Passwords do not match.`, FlashMessageLevel.ERROR);
      setConfirmationPassword('');
      return;
    }

    if (!roomName) {
      launchFlashMessage(
        `Room name cannot be empty. Please choose a name.`,
        FlashMessageLevel.ERROR,
      );
      return;
    }
    const newGroup: Group = {
      id:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
      name: roomName,
      type: groupNature,
    };
    if ((await handleJoinRoom(newGroup, password, true)) === 0) {
      updateUserSidebar();
    }
    // Reset inputs
    setRoomName('');
    setGroupNature(CHANNEL_TYPES.PUBLIC);
    setPassword('');
    setConfirmationPassword('');
  };

  const onJoiningExistingChannel = async (group: Group) => {
    if (group.type === CHANNEL_TYPES.PROTECTED) {
      setPopupVisible(false);
      // Open password input popup
      setPasswordPopupVisible(true);
      setSelectedProtectedGroupToJoin(group);
    } else {
      handleJoinRoom(group, '', false); // no password
      updateUserSidebar();
      handleGroupClick(group);
      setPopupVisible(false);
    }
  };

  return (
    <WrapperDiv>
      <div>
        <h1 className="title-1 mb-24">Create a new channel</h1>
        <div className="mb-24">
          <p className="mb-16">
            Create a new channel to chat with your friends.
            <br />
            You can choose to make it:
          </p>
          <FormattedList>
            <li>
              <span>public 🌐</span>: anyone can join it
            </li>
            <li>
              <span>private 🔒</span>: only invited users can join
            </li>
            <li>
              <span>protected 🔐</span>: anyone with a password can join it
            </li>
          </FormattedList>
        </div>
        <div className="form-container mb-24">
          <div className="channel-name-container">
            <MainInput
              minLength={1}
              maxLength={10}
              type="text"
              value={roomName}
              onChange={(e) => {
                const channelName = e.target.value;
                setRoomName(channelName);

                const isNameAlreadyTaken = !allGroups?.some(
                  (group) => group.name === channelName,
                );
                setIsRoomNameValid(isNameAlreadyTaken);
              }}
              placeholder="Enter room name"
              style={{ borderColor: isRoomNameValid ? '' : errorColor }}
            />
            {!isRoomNameValid && (
              <p className="error-message small">Channel name already taken</p>
            )}
          </div>
          <MainSelect
            value={groupNature}
            onChange={(e) => {
              setGroupNature(e.target.value);
              setPassword('');
            }}
          >
            <option value={CHANNEL_TYPES.PUBLIC}>Public</option>
            <option value={CHANNEL_TYPES.PRIVATE}>Private</option>
            <option value={CHANNEL_TYPES.PROTECTED}>Protected</option>
          </MainSelect>
          {groupNature !== CHANNEL_TYPES.PROTECTED && (
            <MainButton
              onClick={() => {
                onJoiningNewChannel();
                updateUserSidebar();
              }}
              disabled={!isRoomNameValid || roomName.length === 0}
            >
              Create
            </MainButton>
          )}
        </div>
        {groupNature === CHANNEL_TYPES.PROTECTED && (
          <div className="password-containers-wrapper">
            <div className="password-container mb-8">
              <MainPasswordInput
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <div className="confirm-container">
              <MainPasswordInput
                value={confirmationPassword}
                onChange={(e: any) => setConfirmationPassword(e.target.value)}
                placeholder="Enter password"
              />
              <MainButton
                onClick={() => {
                  onJoiningNewChannel();
                  setTimeout(updateUserSidebar, 250);
                }}
                disabled={
                  !isRoomNameValid ||
                  password.length < 8 ||
                  confirmationPassword.length < 8
                }
              >
                Create
              </MainButton>
            </div>
          </div>
        )}
      </div>

      {allGroups && bannedUsers && (
        <>
          {(() => {
            const filteredGroups = allGroups.filter((group) => {
              const wasAlreadyJoinedByUser = userGroups?.some(
                (userGroup) => userGroup.name === group.name,
              );

              const isPublicOrProtected =
                group.type === CHANNEL_TYPES.PUBLIC ||
                group.type === CHANNEL_TYPES.PROTECTED;

              const channelBannedUsers = bannedUsers.find(
                (channel) => channel.name === group.name,
              )?.bannedUsers;

              const isUserBannedFromChannel = channelBannedUsers?.some(
                (bannedUser: any) => bannedUser.intraId === userData?.intraId,
              );

              return (
                !wasAlreadyJoinedByUser &&
                isPublicOrProtected &&
                !isUserBannedFromChannel
              );
            });

            if (filteredGroups.length === 0) return null;

            return (
              <ContrastPanel
                $backgroundColor={darkBgColor}
                className="existing-channels-container"
              >
                <p className="title-1 mb-16">Or join an existing one</p>
                <p className="mb-16">
                  Some channels are public and can be joined freely. Some others
                  are private and you need a password to join them.
                </p>
                <div className="form-container">
                  <MainSelect
                    onChange={(e) => {
                      const groupName = e.target.value;
                      const targetedGroup = filteredGroups.find(
                        (group) => group.name === groupName,
                      );
                      setSelectedExistingGroup(targetedGroup || null);
                    }}
                  >
                    <option key="default" value="default">
                      Choose a channel
                    </option>
                    {filteredGroups
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((group, index) => (
                        <option key={`${group.id}-${index}`} value={group.name}>
                          {(() => {
                            switch (group.type) {
                              case CHANNEL_TYPES.PROTECTED:
                                return '🔐';
                              case CHANNEL_TYPES.PRIVATE:
                                return '🔒';
                              default:
                                return '🌐';
                            }
                          })()}{' '}
                          {group.name}
                        </option>
                      ))}
                  </MainSelect>
                  <MainButton
                    onClick={() => {
                      if (selectedExistingGroup) {
                        onJoiningExistingChannel(selectedExistingGroup);
                      }
                    }}
                  >
                    Join
                  </MainButton>
                </div>
                <p className="small ban-disclaimer">
                  ℹ️ The channels you were banned from joining will not be shown
                  here.
                </p>
              </ContrastPanel>
            );
          })()}
        </>
      )}
    </WrapperDiv>
  );
};

export default ChatSidebarNewChannelModal;
