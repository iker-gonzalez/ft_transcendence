import React, { Children, PropsWithChildren, useState } from 'react';
import styled from 'styled-components';
import {
  blackColor,
  primaryAccentColor,
  primaryColor,
  primaryLightColor,
} from '../../constants/color-tokens';

const WrapperDiv = styled.div`
  .pagination-container {
    margin: 0 auto;
    margin-top: 20px;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    row-gap: 10px;

    .page-number {
      display: flex;
      justify-content: center;
      align-items: center;

      padding: 10px 15px;
      font-weight: bold;
      color: ${primaryLightColor};
      border: 1px ${primaryAccentColor} solid;
      border-radius: 100%;
      width: 45px;
      height: 45px;

      transition: background-color 0.3s ease-in-out;

      &.active {
        background-color: ${primaryColor};
        color: ${blackColor};
      }

      &:hover:not(.active) {
        background-color: ${primaryAccentColor};
        cursor: pointer;
      }
    }
  }
`;

type PaginatedSectionProps = {
  numberOfItems: number;
};

const PaginatedSection: React.FC<PropsWithChildren<PaginatedSectionProps>> = ({
  numberOfItems,
  children,
}) => {
  const childrenArray = Children.toArray(children);
  const [currentPage, setCurrentPage] = useState<number>(0);

  if (!children) {
    return <></>;
  }

  return (
    <WrapperDiv>
      <div>
        {childrenArray.slice(
          currentPage * numberOfItems,
          currentPage * numberOfItems + numberOfItems,
        )}
      </div>
      <div className="pagination-container">
        {[...new Array(Math.ceil(childrenArray.length / numberOfItems))].map(
          (value, index) => {
            return (
              <button
                onClick={() => {
                  if (currentPage === index) {
                    return;
                  }
                  setCurrentPage(index);
                }}
                className={`page-number ${currentPage === index && 'active'}`}
              >
                {index + 1}
              </button>
            );
          },
        )}
      </div>
    </WrapperDiv>
  );
};

export default PaginatedSection;
