import React from 'react';
import styled from 'styled-components';
import CenteredLayout from '../components/UI/CenteredLayout';
import Lottie from 'lottie-react';
import NotFoundAnimationData from '../assets/lotties/not-found.json';
import MainButton from '../components/UI/MainButton';
import { useNavigate } from 'react-router-dom';

const WrapperDiv = styled.div`
  .lottie {
    max-width: 100%;
    width: 550px;
  }
`;

const NotFound: React.FC = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h1 className="title-1 mb-24">Oops. This page doesn't exist</h1>
        <Lottie className="lottie" animationData={NotFoundAnimationData} />
        <MainButton
          onClick={() => {
            navigate('/');
          }}
        >
          Back to Home
        </MainButton>
      </CenteredLayout>
    </WrapperDiv>
  );
};

export default NotFound;
