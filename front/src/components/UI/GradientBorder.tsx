import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  --border-width: 3px;

  background: #ffd369;
  background: linear-gradient(225deg, #ffd369, #00aeb5);
  border-radius: 20px;

  .container {
    border-radius: inherit;

    margin: var(--border-width);
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
