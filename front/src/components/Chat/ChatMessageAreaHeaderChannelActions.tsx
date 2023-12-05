import React, { useEffect, useState } from 'react';
import DangerButton from '../UI/DangerButton';
import MainButton from '../UI/MainButton';
import UserData from '../../interfaces/user-data.interface';
import Modal from '../UI/Modal';
import {
  ChannelData,
  UserInfo,
} from '../../interfaces/chat-channel-data.interface';
import Group from '../../interfaces/chat-group.interface';
import { Socket } from 'socket.io-client';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import {
  patchChannelPassword,
  patchMuteUser,
  setAdminIntra,
} from '../../utils/utils';

type ChatMessageAreaHeaderChannelActionsProps = {
  userData: UserData | null;
  channelData: ChannelData | null;
  group: Group;
  onNewAction: (group: Group) => void;
  updateUserSidebar: () => void;
  socket: Socket;
  navigateToEmptyChat: () => void;
};

const ChatMessageAreaHeaderChannelActions: React.FC<
  ChatMessageAreaHeaderChannelActionsProps
> = ({
  userData,
  channelData,
  group,
  onNewAction,
  updateUserSidebar,
  socket,
  navigateToEmptyChat,
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();
  const [password, setPasswordInput] = useState('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPasswordPopupVisible, setPasswordPopupVisible] = useState(false);

  const [channelOwnerIntraId, setChannelOwnerIntraId] = useState<number | null>(
    null,
  );
  const [channelAdminsInfo, setChannelAdminsInfo] = useState<UserInfo[] | null>(
    null,
  );
  const [channelBannedInfo, setChannelBannedInfo] = useState<UserInfo[] | null>(
    null,
  );
  const [channelMutedInfo, setChannelMutedInfo] = useState<UserInfo[] | null>(
    null,
  );
  const [channelUsersInfo, setChannelUsersInfo] = useState<UserInfo[] | null>(
    null,
  );

  const mutedUsers = channelData?.mutedInfo || [];
  const mutedUsersIntraIds = mutedUsers.map((user) => user.intra);

  const adminUsers = channelData?.adminsInfo || [];
  const adminUsersIntraIds = adminUsers.map((user) => user.intra);

  useEffect(() => {
    if (channelData) {
      setChannelOwnerIntraId(channelData.ownerIntra || null);
      setChannelAdminsInfo(channelData.adminsInfo || null);
      setChannelBannedInfo(channelData.bannedInfo || null);
      setChannelMutedInfo(channelData.mutedInfo || null);
      setChannelUsersInfo(channelData.usersInfo || []);
    }
  }, [group, channelData]);

  const handleLeaveChannel = (roomName: string) => {
    if (roomName.trim() !== '' && roomName && socket) {
      const payload = {
        roomName: roomName,
        intraId: userData?.intraId,
      };

      socket.emit('leaveRoom', payload);

      launchFlashMessage(
        `You have successfully left the room ${roomName}!`,
        FlashMessageLevel.SUCCESS,
      );
      navigateToEmptyChat();
    }
  };

  const kick = (intraId: number) => {
    console.log('kick');
    //socket
  };

  const ban = (intraId: number) => {
    console.log('ban');
    //socket
  };

  const mute = async (muteIntraId: number, isMuted: number) => {
    const status_code = await patchMuteUser(
      channelData!.roomName || '',
      muteIntraId,
      channelOwnerIntraId || 0,
      isMuted,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have successfully ${
          isMuted ? 'muted' : 'unmuted'
        } the user ${muteIntraId}.`,
        FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

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

  const setAdmin = async (intraId: number, isAdmin: number) => {
    const status_code = await setAdminIntra(
      channelData!.roomName || '',
      intraId,
      channelOwnerIntraId || 0,
      isAdmin,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have successfully ${
          isAdmin ? 'set' : 'removed'
        } the admin role for the user ${intraId}.`,
        FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

  const canSeeActions = () => {
    const isOwner = channelData?.ownerIntra === userData?.intraId;
    const isAdmin = channelData?.adminsInfo?.some(
      (admin: any) => admin.intra === userData?.intraId,
    );

    return isOwner || isAdmin;
  };

  return (
    <>
      {canSeeActions() && (
        <div>
          <MainButton
            onClick={() => {
              setPopupVisible(true);
            }}
          >
            Actions
          </MainButton>
          {channelUsersInfo && isPopupVisible && (
            <Modal
              dismissModalAction={() => {
                setPopupVisible(false);
              }}
            >
              {/* Display the user intra ids here */}
              {channelUsersInfo.map((channelUserInfo) => {
                // Skip the logged-in user
                if (channelUserInfo.intra === userData?.intraId) {
                  return null;
                }

                const isUserMuted = mutedUsersIntraIds?.includes(
                  channelUserInfo.intra,
                );
                const isAdmin = adminUsersIntraIds?.includes(
                  channelUserInfo.intra,
                );

                return (
                  <div key={channelUserInfo.intra}>
                    {channelUserInfo.intra !== channelOwnerIntraId && (
                      <>
                        {channelUserInfo.username}
                        {/*If there is time, change to svg*/}
                        <MainButton
                          onClick={() => {
                            setAdmin(channelUserInfo.intra, isAdmin ? 0 : 1);
                            setPopupVisible(false);
                            onNewAction(group);
                          }}
                        >
                          {isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </MainButton>
                        <MainButton
                          onClick={() => {
                            mute(channelUserInfo.intra, isUserMuted ? 0 : 1);
                            setPopupVisible(false);
                            onNewAction(group);
                          }}
                        >
                          {isUserMuted ? 'Unmute' : 'Mute'}
                        </MainButton>
                        <MainButton onClick={() => kick(channelUserInfo.intra)}>
                          Kick
                        </MainButton>
                        <MainButton onClick={() => ban(channelUserInfo.intra)}>
                          Ban
                        </MainButton>
                      </>
                    )}
                  </div>
                );
              })}
            </Modal>
          )}
          {group && channelOwnerIntraId === userData?.intraId && (
            <>
              {channelData?.type === 'PUBLIC' ? (
                <>
                  <MainButton onClick={() => setPasswordPopupVisible(true)}>
                    Set Password
                  </MainButton>

                  {isPasswordPopupVisible && (
                    <Modal
                      dismissModalAction={() => setPasswordPopupVisible(false)}
                    >
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordInput(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          setPassword(password);
                          setPasswordInput('');
                          setPasswordPopupVisible(false);
                          onNewAction(group);
                        }}
                      >
                        Submit
                      </button>
                    </Modal>
                  )}
                </>
              ) : channelData?.type === 'PROTECTED' ? (
                <>
                  <MainButton onClick={() => setPasswordPopupVisible(true)}>
                    Modify or Remove Password
                  </MainButton>

                  {isPasswordPopupVisible && (
                    <Modal
                      dismissModalAction={() => setPasswordPopupVisible(false)}
                    >
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordInput(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          setPassword(password);
                          setPasswordInput('');
                          setPasswordPopupVisible(false);
                          onNewAction(group);
                        }}
                      >
                        Modify Password
                      </button>
                      <button
                        onClick={() => {
                          setPassword(null);
                          setPasswordPopupVisible(false);
                          onNewAction(group);
                        }}
                      >
                        Remove Password
                      </button>
                    </Modal>
                  )}
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
        Leave channel
      </DangerButton>
    </>
  );
};

export default ChatMessageAreaHeaderChannelActions;
