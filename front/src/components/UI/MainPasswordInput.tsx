import React, { useState } from 'react';
import MainInput from './MainInput';
import MainButton from './MainButton';

import ShowIcon from '../../assets/svg/show.svg';
import HideIcon from '../../assets/svg/hide.svg';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .icon-button {
    padding: 5px;
    height: 40px;

    img {
      height: 100%;
      object-fit: contain;
    }
  }
`;

const MainPasswordInput: React.FC<any> = (props): JSX.Element => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  return (
    <WrapperDiv>
      <MainButton
        className="icon-button"
        onClick={(e) => {
          e.preventDefault();
          setIsPasswordVisible((prevState) => !prevState);
        }}
      >
        <img
          src={isPasswordVisible ? HideIcon : ShowIcon}
          alt={isPasswordVisible ? 'Hide password' : 'Show password'}
        />
      </MainButton>
      <MainInput
        type={isPasswordVisible ? 'text' : 'password'}
        {...props}
      ></MainInput>
    </WrapperDiv>
  );
};

export default MainPasswordInput;
