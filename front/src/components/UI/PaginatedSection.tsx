import React, { Children, PropsWithChildren, useState } from 'react';
import styled from 'styled-components';
import {
  primaryAccentColor,
  primaryLightColor,
} from '../../constants/color-tokens';
import arrowLeft from '../../assets/svg/arrow-left.svg';
import arrowRight from '../../assets/svg/arrow-right.svg';

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

    .page-counter-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;

      .arrow-button {
        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        &:hover:not(:disabled) {
          filter: brightness(1.4);
        }

        .arrow-icon {
          width: 50px;
        }
      }

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
        {(() => {
          const numberOfPages = Math.ceil(childrenArray.length / numberOfItems);

          if (numberOfPages === 1) {
            return <></>;
          }

          return (
            <div className="page-counter-container">
              <button
                onClick={() => {
                  setCurrentPage((prevState) => {
                    return prevState === 0 ? 0 : prevState - 1;
                  });
                }}
                disabled={currentPage === 0}
                aria-label="Previous page"
                className="arrow-button"
              >
                <img src={arrowLeft} alt="" className="arrow-icon" />
              </button>
              <p className="page-number">{currentPage + 1}</p>
              <button
                onClick={() => {
                  setCurrentPage((prevState) => {
                    return prevState === numberOfPages - 1
                      ? numberOfPages - 1
                      : prevState + 1;
                  });
                }}
                disabled={currentPage === numberOfPages - 1}
                aria-label="Next page"
                className="arrow-button"
              >
                <img src={arrowRight} alt="" className="arrow-icon" />
              </button>
            </div>
          );
        })()}
      </div>
    </WrapperDiv>
  );
};

export default PaginatedSection;
