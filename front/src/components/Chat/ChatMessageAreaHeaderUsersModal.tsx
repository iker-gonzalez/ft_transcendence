import React from 'react';
import MainButton from '../UI/MainButton';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import UserData from '../../interfaces/user-data.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import Group from '../../interfaces/chat-group.interface';
import { patchMuteUser } from '../../utils/utils';
import MainSelect from '../UI/MainSelect';
import DangerButton from '../UI/DangerButton';
import ContrastPanel from '../UI/ContrastPanel';
import { darkBgColor } from '../../constants/color-tokens';
import SecondaryButton from '../UI/SecondaryButton';
import styled from 'styled-components';
import { Socket } from 'socket.io-client';
import Modal from '../UI/Modal';
import BannedUser from '../../interfaces/banned-user.interface';
import ChatMessageAreaHeaderUsersModalUnban from './ChatMessageAreaHeaderUsersModalUnban';

type ChatMessageAreaHeaderUsersModalProps = {
  channelData: ChannelData;
  userData: UserData | null;
  setAdminIntra: (
    roomName: string,
    intraId: number,
    ownerIntraId: number,
    isAdmin: number,
  ) => Promise<number>;
  channelOwnerIntraId: number | null;
  setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onNewAction: (selectedGroup: Group) => void;
  group: Group;
  socket: Socket;
  bannedUsers: BannedUser[];
  setBannedUsers: React.Dispatch<React.SetStateAction<BannedUser[]>>;
};

const UserManagementContainer = styled.div`
  margin-top: 24px;

  > * {
    width: 100%;
  }

  .actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .actions-legend {
    text-align: left;
    li {
      list-style: disc;
      margin-left: 12%;
      margin-bottom: 8px;
      line-height: 1.5;

      span {
        font-weight: bold;
      }
    }
  }
`;

const ConfirmationModal = styled(Modal)`
  .actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
`;

const ChatMessageAreaHeaderUsersModal: React.FC<
  ChatMessageAreaHeaderUsersModalProps
> = ({
  channelData,
  userData,
  setAdminIntra,
  channelOwnerIntraId,
  setPopupVisible,
  onNewAction,
  group,
  socket,
  bannedUsers,
  setBannedUsers,
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();

  const [selectedUser, setSelectedUser] = React.useState<number | null>(null);
  const [confirmationModalInfo, setConfirmationModalInfo] = React.useState<{
    title: string;
    subtitle: string;
    action: () => void;
  } | null>(null);

  const kick = (intraId: number) => {
    const payload = {
      roomName: group.name,
      adminId: userData?.intraId,
      intraId: intraId,
    };
    socket.emit('kickUser', payload, (res: any) => {
      if (res.success) {
        launchFlashMessage(
          `You have kicked out the user ${intraId}.`,
          FlashMessageLevel.SUCCESS,
        );
      } else {
        launchFlashMessage(
          'Something went wrong. Try again later.',
          FlashMessageLevel.ERROR,
        );
      }
    });
  };

  const ban = (intraId: number, username: string) => {
    const payload = {
      roomName: group.name,
      adminId: userData?.intraId,
      intraId: intraId,
    };
    socket.emit('banUser', payload, (res: any) => {
      if (res.success) {
        launchFlashMessage(
          `You have banned ${username} from the channel ${group.name}.`,
          FlashMessageLevel.SUCCESS,
        );
      } else {
        launchFlashMessage(
          `It was not possible to ban ${username} from the channel ${group.name}. Try again`,
          FlashMessageLevel.ERROR,
        );
      }
    });
  };

  const mute = async (
    muteIntraId: number,
    mutedUserUsername: string,
    isMuted: number,
  ) => {
    setPopupVisible(false);
    onNewAction(group);

    const res = await patchMuteUser(
      channelData!.roomName || '',
      muteIntraId,
      channelOwnerIntraId || 0,
      isMuted,
    );

    if (!res) {
      launchFlashMessage(
        'Something went wrong. Try again later.',
        FlashMessageLevel.ERROR,
      );
      return;
    }

    if (res.status === 200) {
      launchFlashMessage(
        `You have ${isMuted ? 'muted' : 'unmuted'} ${mutedUserUsername}.`,
        isMuted ? FlashMessageLevel.INFO : FlashMessageLevel.SUCCESS,
      );
    } else {
      // Only errors meaningful to the user
      if (res.status === 422) {
        const data = await res.json();
        launchFlashMessage(data.message, FlashMessageLevel.ERROR);
      } else {
        launchFlashMessage(
          'Something went wrong. Try again later.',
          FlashMessageLevel.ERROR,
        );
      }
    }
  };

  const setAdmin = async (
    intraId: number,
    isAdmin: boolean,
    username: string,
  ) => {
    const status_code = await setAdminIntra(
      channelData!.roomName || '',
      intraId,
      channelOwnerIntraId || 0,
      isAdmin ? 0 : 1,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have ${
          isAdmin ? 'revoked' : 'granted'
        } admin role for ${username}.`,
        isAdmin ? FlashMessageLevel.INFO : FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

  return (
    <>
      <h1 className="title-1 mb-16">Manage channel members</h1>
      <p className="mb-24">
        Choose a member to manage their permissions in the channel.
      </p>
      <MainSelect
        onChange={(e) => {
          setSelectedUser(parseInt(e.target.value));
        }}
      >
        <option>Choose a member</option>
        {channelData.usersInfo
          .filter(
            (channelUserInfo) => channelUserInfo.intra !== userData?.intraId,
          )
          .map((channelUserInfo) => {
            return (
              <option value={channelUserInfo.intra} key={channelUserInfo.intra}>
                {channelUserInfo.username}
              </option>
            );
          })}
        {bannedUsers.map((bannedUser) => {
          return (
            <option key={bannedUser.id} value={bannedUser.intraId}>
              {bannedUser.username} (banned 🚫)
            </option>
          );
        })}
      </MainSelect>
      {(() => {
        const selectedUserData = channelData.usersInfo.find(
          (user) => user.intra === selectedUser,
        );

        if (selectedUserData) {
          const isUserMuted = channelData.mutedInfo
            .map((user) => user.intra)
            .includes(selectedUserData.intra);

          const adminUsers = channelData?.adminsInfo || [];
          const isAdmin = adminUsers
            .map((user) => user.intra)
            .includes(selectedUserData.intra);

          return (
            <>
              <UserManagementContainer>
                <ContrastPanel $backgroundColor={darkBgColor} className="mb-16">
                  <h2 className="title-3 mb-8">Admin privileges</h2>
                  <p className="mb-16">
                    If you decide to make {selectedUserData.username} an admin,
                    they will be able to manage the other members of this
                    channel
                  </p>
                  <div>
                    {isAdmin ? (
                      <DangerButton
                        onClick={() => {
                          setAdmin(
                            selectedUserData.intra,
                            isAdmin,
                            selectedUserData.username,
                          );
                          setPopupVisible(false);
                          onNewAction(group);
                        }}
                      >
                        Revoke admin role
                      </DangerButton>
                    ) : (
                      <MainButton
                        onClick={() => {
                          setAdmin(
                            selectedUserData.intra,
                            isAdmin,
                            selectedUserData.username,
                          );
                          setPopupVisible(false);
                          onNewAction(group);
                        }}
                      >
                        Make admin
                      </MainButton>
                    )}
                  </div>
                </ContrastPanel>
                <ContrastPanel
                  $backgroundColor={darkBgColor}
                  className="user-actions-container"
                >
                  <h2 className="title-3 mb-8">Issues with a member?</h2>
                  <div className="mb-24">
                    <p className="mb-16">
                      We're sorry you're experiencing trouble. If you need, you
                      have the option of:
                    </p>
                    <ul className="actions-legend">
                      <li>
                        <span>silencing</span>: to hide{' '}
                        {selectedUserData.username}
                        's messages
                      </li>
                      <li>
                        <span>kicking out:</span> to remove{' '}
                        {selectedUserData.username} from channel
                      </li>
                      <li>
                        <span>banning:</span> to prevent{' '}
                        {selectedUserData.username} from joining the channel
                        again.
                      </li>
                    </ul>
                  </div>
                  <div className="actions-container">
                    <SecondaryButton
                      onClick={() => {
                        if (!isUserMuted) {
                          setConfirmationModalInfo({
                            title: 'Do you confirm muting?',
                            subtitle: `You are about to mute ${selectedUserData.username}. They will stay in the channel, but will their messages will be hidden.`,
                            action: () => {
                              mute(
                                selectedUserData.intra,
                                selectedUserData.username,
                                1,
                              );
                              setPopupVisible(false);
                              onNewAction(group);
                            },
                          });
                        } else {
                          mute(
                            selectedUserData.intra,
                            selectedUserData.username,
                            0,
                          );
                        }
                      }}
                    >
                      {isUserMuted ? 'Unmute' : 'Mute'}
                    </SecondaryButton>
                    <MainButton
                      onClick={() => {
                        setConfirmationModalInfo({
                          title: 'Do you confirm kicking out?',
                          subtitle: `You are about to kick out ${selectedUserData.username}. They will leave the channel immediately.`,
                          action: () => {
                            kick(selectedUserData.intra);
                            setPopupVisible(false);
                            onNewAction(group);
                          },
                        });
                      }}
                    >
                      Kick
                    </MainButton>
                    <DangerButton
                      onClick={() => {
                        setConfirmationModalInfo({
                          title: 'Do you confirm ban?',
                          subtitle: `You are about to ban ${selectedUserData.username}. Once you confirm, they will not be able to join this channel again.`,
                          action: () => {
                            ban(
                              selectedUserData.intra,
                              selectedUserData.username,
                            );
                            setPopupVisible(false);
                            onNewAction(group);
                          },
                        });
                      }}
                    >
                      Ban
                    </DangerButton>
                  </div>
                </ContrastPanel>
              </UserManagementContainer>
              {confirmationModalInfo && (
                <ConfirmationModal
                  dismissModalAction={() => setConfirmationModalInfo(null)}
                >
                  <h1 className="title-1 mb-8">
                    {confirmationModalInfo.title}
                  </h1>
                  <p className="mb-24">{confirmationModalInfo.subtitle}</p>
                  <div className="actions-container">
                    <SecondaryButton
                      onClick={() => setConfirmationModalInfo(null)}
                    >
                      Cancel
                    </SecondaryButton>
                    <DangerButton
                      onClick={() => confirmationModalInfo.action()}
                    >
                      Confirm
                    </DangerButton>
                  </div>
                </ConfirmationModal>
              )}
            </>
          );
        }

        return <></>;
      })()}
      {(() => {
        const bannedUserInfo = bannedUsers.find(
          (bannedUser) => bannedUser.intraId === selectedUser,
        );

        if (bannedUserInfo && channelOwnerIntraId) {
          return (
            <ChatMessageAreaHeaderUsersModalUnban
              bannedUserInfo={bannedUserInfo}
              setBannedUsers={setBannedUsers}
              socket={socket}
              adminId={channelOwnerIntraId}
              roomName={group.name}
            />
          );
        }

        return <></>;
      })()}
    </>
  );
};

export default ChatMessageAreaHeaderUsersModal;
