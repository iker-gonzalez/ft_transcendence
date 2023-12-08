import styled from 'styled-components';

const FormattedList = styled.ul`
  text-align: left;
  li {
    list-style: disc;
    margin-left: 12%;
    margin-bottom: 8px;
    line-height: 1.5;

    span {
      font-weight: bold;
    }
  }
`;

export default FormattedList;
