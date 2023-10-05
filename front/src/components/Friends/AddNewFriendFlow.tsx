import React, { useState } from 'react';
import Modal from '../UI/Modal';
import UserSearchModal from './UserSearchModal';
import ViewNewUserProfile from './ViewNewUserProfile';
import { useUserData } from '../../context/UserDataContext';
import UserData from '../../interfaces/user-data.interface';
import UserCoreData from '../../interfaces/user-core-data.interface';
import FriendData from '../../interfaces/friend-data.interface';

type AddNewFriendFlowProps = {
  setShowAddNewFriendFlow: (arg0: boolean) => void;
  onAddAFriendToList: (
    friendsList: FriendData[],
    successMessage: string,
  ) => void;
};

const AddNewFriendFlow: React.FC<AddNewFriendFlowProps> = ({
  setShowAddNewFriendFlow,
  onAddAFriendToList,
}): JSX.Element => {
  const [showUserSearchModal, setShowUserSearchModal] = useState<boolean>(true);
  const [foundUserData, setFoundUserData] = useState<UserCoreData | null>(null);
  const { userData }: { userData: UserData | null } = useUserData();

  const proceedToNextStep = () => {
    setShowUserSearchModal(false);
  };

  const setChosenUser = (chosenUser: UserCoreData) => {
    setFoundUserData(chosenUser);
  };

  return (
    <>
      <Modal
        dismissModalAction={() => {
          setShowAddNewFriendFlow(false);
        }}
      >
        {showUserSearchModal ? (
          <UserSearchModal
            userData={userData!}
            setChosenUser={setChosenUser}
            proceedToNextStep={proceedToNextStep}
          />
        ) : (
          <ViewNewUserProfile
            foundUserData={foundUserData!}
            onAddAFriendToList={onAddAFriendToList}
          />
        )}
      </Modal>
    </>
  );
};

export default AddNewFriendFlow;
