import styled from 'styled-components/macro';
import Button from '../button/Button';

export const StyledModalContent = styled.div.attrs((props) => {
  return {
    className: 'modal-content',
  };
})`
  padding: 1.8rem 1.2rem;
  border-radius: 1.25rem;
`;

export const StyledModalDialog = styled.div.attrs((props) => {
  return {
    className: 'modal-dialog modal-dialog-centered',
  };
})``;

export const StyledCrossBtn = styled(Button).attrs((props) => {
  return {
    className: 'btn-close',
  };
})`
  position: absolute;
  right: 2rem;
  top: 0.5rem;
  border: none;
  background: none;
  &:hover {
    background-color: transparent;
  }
  &:focus {
    box-shadow: none;
  }
`;
