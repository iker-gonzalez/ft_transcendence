import React, { PropsWithChildren } from 'react';
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
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
`;

type UserItemProps = {
  userData: UserCoreData;
  headingLevel: number;
};

const UserItem: React.FC<PropsWithChildren<UserItemProps>> = ({
  children,
  headingLevel,
  userData,
}): JSX.Element => {
  return (
    <WrapperDiv>
      <RoundImg src={userData.avatar} alt="" className="image" />
      <div className="text-container">
        <div>
          <div
            role="heading"
            aria-level={headingLevel}
            className="title-3 mb-8"
          >
            {userData.username}
          </div>
          <p className="small">{userData.email}</p>
        </div>
        <div>{children}</div>
      </div>
    </WrapperDiv>
  );
};

export default UserItem;
