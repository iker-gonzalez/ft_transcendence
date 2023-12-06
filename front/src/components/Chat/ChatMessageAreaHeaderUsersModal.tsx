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

  const [selectedUser, setSelectedUser] = React.useState<number | null>(null);

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
        `You have successfully ${
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
        className="mb-24"
      >
        <option>Choose a member</option>
        {channelData.usersInfo.map((channelUserInfo, index) => {
          // Do not show current user
          if (channelUserInfo.intra === userData?.intraId) {
            return null;
          }

          const isUserMuted = channelData.mutedInfo
            .map((user) => user.intra)
            .includes(channelUserInfo.intra);

          const adminUsers = channelData?.adminsInfo || [];
          const isAdmin = adminUsers
            .map((user) => user.intra)
            .includes(channelUserInfo.intra);

          return (
            <option value={channelUserInfo.intra} key={channelUserInfo.intra}>
              {channelUserInfo.username}
            </option>
            //   <div key={channelUserInfo.intra}>
            //     {channelUserInfo.intra !== channelData.ownerIntra && (
            //       <>
            //         {channelUserInfo.username}
            //         {/*If there is time, change to svg*/}
            //         <MainButton
            //           onClick={() => {
            //             setAdmin(channelUserInfo.intra, isAdmin ? 0 : 1);
            //             setPopupVisible(false);
            //             onNewAction(group);
            //           }}
            //         >
            //           {isAdmin ? 'Remove Admin' : 'Make Admin'}
            //         </MainButton>
            //         <MainButton
            //           onClick={() => {
            //             mute(channelUserInfo.intra, isUserMuted ? 0 : 1);
            //             setPopupVisible(false);
            //             onNewAction(group);
            //           }}
            //         >
            //           {isUserMuted ? 'Unmute' : 'Mute'}
            //         </MainButton>
            //         <MainButton onClick={() => kick(channelUserInfo.intra)}>
            //           Kick
            //         </MainButton>
            //         <MainButton onClick={() => ban(channelUserInfo.intra)}>
            //           Ban
            //         </MainButton>
            //       </>
            //     )}
            //   </div>
          );
        })}
      </MainSelect>
      {(() => {
        const selectedUserData = channelData.usersInfo.find(
          (user) => user.intra === selectedUser,
        );

        if (selectedUserData) {
          const adminUsers = channelData?.adminsInfo || [];
          const isAdmin = adminUsers
            .map((user) => user.intra)
            .includes(selectedUserData.intra);

          return (
            <ContrastPanel $backgroundColor={darkBgColor}>
              <h2 className="title-3 mb-8">Admin privileges</h2>
              <p className="mb-16">
                If you decide to make {selectedUserData.username} an admin, they
                will be able to manage the other members of this channel
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
          );
        }

        return <></>;
      })()}
    </>
  );
};

export default ChatMessageAreaHeaderUsersModal;
