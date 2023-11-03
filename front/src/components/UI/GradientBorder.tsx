import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const borderWidth = '7px';
const WrapperDiv = styled.div`
  background: #00aeb5;
  background: linear-gradient(180deg, #ffd369 0%, #00aeb5 100%);
  border-radius: 25px;

  .container {
    border-radius: inherit;

    margin: ${borderWidth};
  }
`;

type GradientBorderProps = {
  className: string;
};

const GradientBorder: React.FC<PropsWithChildren<GradientBorderProps>> = ({
  children,
  className,
}): JSX.Element => {
  return (
    <WrapperDiv>
      <div className={`container ${className}`}>{children}</div>
    </WrapperDiv>
  );
};

export default GradientBorder;
