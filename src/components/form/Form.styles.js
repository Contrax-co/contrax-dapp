import styled from 'styled-components/macro';

import * as colors from '../../theme/colors';
import * as typo from '../../theme/typography';

const noForwardProps = [];

export const StyledForm = styled('form', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  // background: colors.secondaryLight,
  borderRadius: 10,
}));

export const StyledInput = styled('input', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => {
  if (!props.variant) props.variant = 'light';
  return {
    ...(props.height && { height: props.height }),
    ...typo.Title,
    padding: '2px 1rem',
    fontSize: '1rem',
    lineHeight: '2rem',
  };
});

export const Checkbox = styled('input', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...(props.variant === 'light' && { backgroundColor: colors.titleLight }),
  ...(props.variant === 'dark' && { backgroundColor: colors.titleDark }),
  ...typo.Title,
  float: 'left',
  marginRight: '0.6rem',
  border: `1px solid ${colors.primary}`,
  width: 13,
  height: 13,
  padding: 0,
}));

export const StyledCheckbox = styled(Checkbox).attrs((props) => {})`
  border-radius: 2px !important;
  &:checked {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
  }
`;
