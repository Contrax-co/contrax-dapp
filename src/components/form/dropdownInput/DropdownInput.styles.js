import styled, { css } from 'styled-components/macro';
import * as colors from '../../../theme/colors';
import * as typo from '../../../theme/typography';
import { Desc } from '../../text/Text';
import Button from '../../button/Button';

const noForwardProps = [];

export const StyledInput = styled('input', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.Title,
  textAlign: props.type === 'number' ? 'right' : 'left',
  borderRadius: '0 5px 5px 0',
  border: `1px solid ${colors.inputBorder}`,
  width: 'calc(100% - 100px)',
  padding: 4,
}));

export const StyledSearch = styled('input', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.Title,
  border: 'none',
  borderBottom: `1px solid ${colors.inputBorder}`,
  borderRadius: 0,
  marginTop: -5,
}));

export const Subtitle = styled('small', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.PageSubTitle,
  color: colors.subTitleDark,
  float: 'right',
}));

export const StyledListBtn = styled.div.attrs((props) => {
  return {
    className: 'dropdown-item',
  };
})``;

export const ListSubTitle = styled(Desc)((props) => ({
  float: 'right',
}));

export const StyledDropBtn = styled(Button).attrs((props) => ({
  className: 'btn btn-primary dropdown-toggle',
}))`
  border-radius: 4px 0 0 4px;
  padding: 0.25rem;
  border-right: none;
  ${(props) => css`
    border-color: ${colors.inputBorder};
  `}
`;
