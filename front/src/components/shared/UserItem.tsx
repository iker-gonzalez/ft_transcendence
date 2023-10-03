import React from 'react';
import UserCoreData from '../../interfaces/user-core-data.interface';
import RoundImg from '../UI/RoundImage';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import { darkBgColor } from '../../constants/color-tokens';

const WrapperDiv = styled(ContrastPanel)`
  width: 100%;

  background-color: ${darkBgColor};

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;

  .image {
    width: 75px;
    height: 75px;
  }

  .text-container {
    text-align: left;
  }
`;

type UserItemProps = {
  userData: UserCoreData;
  key?: string;
  headingLevel: number;
};

const UserItem: React.FC<UserItemProps> = ({
  userData,
  key,
  headingLevel,
}): JSX.Element => {
  return (
    <WrapperDiv key={key}>
      <RoundImg src={userData.avatar} alt="" className="image" />
      <div className="text-container">
        <div role="heading" aria-level={headingLevel} className="title-3 mb-8">
          {userData.username}
        </div>
        <p>{userData.email}</p>
      </div>
    </WrapperDiv>
  );
};

export default UserItem;
