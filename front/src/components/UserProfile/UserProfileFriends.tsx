import React from 'react';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import { primaryLightColor } from '../../constants/color-tokens';
import Lottie from 'lottie-react';
import emptyGhostAnimation from '../../assets/lotties/empty-ghost.json';

const WrapperDiv = styled.div`
  position: relative;
  width: 650px;

  .empty-state {
    max-width: 380px;

    .empty-animation {
      width: 100px;
      position: absolute;
      top: 50%;
      right: 50px;
      transform: translateY(-50%);
    }
  }
`;

const UserProfileFriends: React.FC<{ friendsList: any[] }> = ({
  friendsList,
}) => {
  return (
    <ContrastPanel>
      <WrapperDiv>
        <h2 className="title-2 mb-24">Friends</h2>
        <div>
          {friendsList.length ? (
            <></>
          ) : (
            <div className="empty-state">
              <p className="mb-16">It looks like you're a bit lonely 😿</p>
              <p>
                It's easy to make new friends. Just search for a user to add them
                to your friends list.
              </p>
              <Lottie
                animationData={emptyGhostAnimation}
                loop={true}
                className="empty-animation"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileFriends;
