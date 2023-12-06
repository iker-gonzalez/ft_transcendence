import React from 'react';
import MainButton from '../UI/MainButton';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import UserData from '../../interfaces/user-data.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import Group from '../../interfaces/chat-group.interface';
import { patchMuteUser } from '../../utils/utils';

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
};

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
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();

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

  return (
    <>
      {/* Display the user intra ids here */}
      {channelData.usersInfo.map((channelUserInfo) => {
        // Skip the logged-in user
        if (channelUserInfo.intra === userData?.intraId) {
          return null;
        }

        const mutedUsersIntraIds = channelData.mutedInfo.map(
          (user) => user.intra,
        );
        const isUserMuted = mutedUsersIntraIds.includes(channelUserInfo.intra);

        const adminUsers = channelData?.adminsInfo || [];
        const adminUsersIntraIds = adminUsers.map((user) => user.intra);
        const isAdmin = adminUsersIntraIds?.includes(channelUserInfo.intra);

        return (
          <div key={channelUserInfo.intra}>
            {channelUserInfo.intra !== channelData.ownerIntra && (
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
    </>
  );
};

export default ChatMessageAreaHeaderUsersModal;
