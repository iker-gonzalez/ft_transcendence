import React from 'react';
import MainInput from '../UI/MainInput';
import Group from '../../interfaces/chat-group.interface';
import MainSelect from '../UI/MainSelect';
import MainButton from '../UI/MainButton';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import styled from 'styled-components';
import { CHANNEL_TYPES } from '../../constants/shared';

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
  ) => Promise<number | undefined>;
  updateUserSidebar: () => void;
  userGroups: Group[] | null;
  setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setPasswordPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProtectedGroup: React.Dispatch<React.SetStateAction<Group | null>>;
  handleGroupClick: (group: Group) => void;
};

const WrapperDiv = styled.div`
  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .existing-channels-container {
    margin-top: 32px;
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
  setSelectedProtectedGroup,
  handleGroupClick,
}): JSX.Element => {
  const { launchFlashMessage } = useFlashMessages();
  const [selectedExistingGroup, setSelectedExistingGroup] =
    React.useState<Group | null>(null);

  const onJoiningNewChannel = async (): Promise<void> => {
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
    if ((await handleJoinRoom(newGroup, password)) === 0) {
      updateUserSidebar();
    }
    // Reset inputs
    setRoomName('');
    setGroupNature(CHANNEL_TYPES.PUBLIC);
    setPassword('');
  };

  const onJoiningExistingChannel = async (group: Group) => {
    if (group.type === CHANNEL_TYPES.PROTECTED) {
      setPopupVisible(false);
      // Open password input popup
      setPasswordPopupVisible(true);
      setSelectedProtectedGroup(group);
    } else {
      handleJoinRoom(group, ''); // no password
      updateUserSidebar();
      handleGroupClick(group);
      setPopupVisible(false);
    }
  };

  return (
    <WrapperDiv>
      <div>
        <h1 className="title-1 mb-24">Create a new channel</h1>
        <div className="mb-16">
          <p className="mb-8">
            You can create a public channel for maximum outreach or make it
            private for increased privacy.
          </p>
        </div>
        <div className="form-container mb-24">
          <MainInput
            minLength={1}
            maxLength={10}
            type="text"
            value={roomName}
            onChange={(e) => {
              setRoomName(e.target.value);
              setIsRoomNameValid(
                !allGroups?.some((group) => group.name === e.target.value),
              );
            }}
            placeholder="Enter room name"
            style={{ borderColor: isRoomNameValid ? '' : 'red' }}
          />
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
              onClick={onJoiningNewChannel}
              disabled={!isRoomNameValid}
            >
              Create
            </MainButton>
          )}
        </div>
        {groupNature === CHANNEL_TYPES.PROTECTED && (
          <div className="form-container">
            <MainInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <MainButton
              onClick={onJoiningNewChannel}
              disabled={!isRoomNameValid}
            >
              Create
            </MainButton>
          </div>
        )}
      </div>

      {allGroups && (
        <div className="existing-channels-container">
          <p className="title-1 mb-16">Or join an existing one</p>
          <p className="mb-16">
            Some channels are public and can be joined freely. For others (🔒),
            you will need a password.
          </p>
          <div className="form-container">
            {(() => {
              const filteredGroups = allGroups.filter((group) => {
                const wasAlreadyJoinedByUser = userGroups?.some(
                  (userGroup) => userGroup.name === group.name,
                );

                const isPublicOrProtected =
                  group.type === CHANNEL_TYPES.PUBLIC ||
                  group.type === CHANNEL_TYPES.PROTECTED;

                return !wasAlreadyJoinedByUser && isPublicOrProtected;
              });

              return (
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
                  {filteredGroups.map((group) => (
                    <option key={group.id} value={group.name}>
                      {group.name}
                      {group.type === CHANNEL_TYPES.PROTECTED && ' 🔒'}
                    </option>
                  ))}
                </MainSelect>
              );
            })()}
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
        </div>
      )}
    </WrapperDiv>
  );
};

export default ChatSidebarNewChannelModal;