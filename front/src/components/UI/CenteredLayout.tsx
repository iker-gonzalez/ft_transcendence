import { styled } from 'styled-components';
import { sm } from '../../constants/styles';

const CenteredLayout = styled.div`
  padding: 30px 15px;
  padding-top: 100px;

  @media (width > ${sm}) {
    padding: 60px 100px;
    padding-top: 130px;
  }

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default CenteredLayout;
