import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import SearchBar from '../UI/SearchBar';
import Lottie from 'lottie-react';
import emptyAnimationData from '../../assets/lotties/empty-ghost.json';
import loadingAnimationData from '../../assets/lotties/spinner.json';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;

    .empty-animation {
      width: 250px;
      height: auto;
      object-fit: contain;
    }

    .loading-animation {
      width: 80px;
      margin: 75px 20px;
    }
  }
`;

type FriendsSearchModalProps = {
  setShowFriendsSearchModal: (arg0: boolean) => void;
};

const FriendsSearchModal: React.FC<FriendsSearchModalProps> = ({
  setShowFriendsSearchModal,
}): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const _formatSearchValue = (searchValue: string): string => {
    const formattedSearchValue: string = searchValue.trim().replaceAll(' ', '');

    return formattedSearchValue;
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchValue.length) {
        setIsLoading(true);
        // Fetch friends list
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchValue]);

  return (
    <Modal
      dismissModalAction={() => {
        setShowFriendsSearchModal(false);
      }}
    >
      <WrapperDiv>
        <h2 className="title-2 mb-24">Find a new game friends 👥</h2>
        <p className="mb-16">
          Use the search bar below to find players and add them to your friends
          list.
        </p>
        <SearchBar
          type="text"
          placeholder="Search... 🔍"
          value={searchValue}
          className="mb-16"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchValue(_formatSearchValue(e.target.value) as string);
          }}
        />
        <div className="empty-state">
          {isLoading ? (
            <Lottie
              animationData={loadingAnimationData}
              loop={true}
              aria-hidden="true"
              className="loading-animation"
            />
          ) : (
            <Lottie
              animationData={emptyAnimationData}
              loop={true}
              aria-hidden="true"
              className="empty-animation"
            />
          )}
        </div>
      </WrapperDiv>
    </Modal>
  );
};

export default FriendsSearchModal;
