import styled from 'styled-components/macro';

import * as colors from '../../theme/colors';
import { weight } from '../../theme/fonts';
import * as typo from '../../theme/typography';

const noForwardProps = [];
const baseStyles = (typography, props) => {
  if (props.size) console.log(props);
  return {
    ...typography,
    color: props.variant === 'light' ? colors.lightText : colors.darkText,
    ...(props.color && { color: props.color }),
    ...(props.weight && { fontWeight: props.weight }),
    ...(props.size && { fontSize: props.size }),
    ...(props.lineHeight && { lineHeight: props.lineHeight }),
  };
};

export const StyledPageTitle = styled('h3', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.PageTitle,
  ...(props.variant === 'light' && { color: colors.titleLight }),
  ...(props.variant === 'dark' && { color: colors.titleDark }),
}));

export const StyledPageSubTitle = styled('h4', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.PageSubTitle,
  ...(props.variant === 'light' && { color: colors.subTitleLight }),
  ...(props.variant === 'dark' && { color: colors.subTitleDark }),
}));

export const StyledTitle = styled('h4', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.Title,
  ...(props.variant === 'light' && { color: colors.titleLight }),
  ...(props.variant === 'dark' && { color: colors.titleDark }),
}));

export const StyledDesc = styled('p', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.Desc,
  ...(props.variant === 'light' && { color: colors.descLight }),
  ...(props.variant === 'dark' && { color: colors.descDark }),
  ...(props.variant === 'danger' && { color: colors.redText }),
  ...(props.variant === 'success' && { color: colors.greenText }),
  ...(props.color && { color: props.color }),
}));

export const StyledDescSpan = styled('span', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.Desc,
  ...(props.variant === 'light' && { color: colors.descLight }),
  ...(props.variant === 'dark' && { color: colors.descDark }),
  ...(props.variant === 'danger' && { color: colors.redText }),
  ...(props.variant === 'success' && { color: colors.greenText }),
}));

export const StyledLink = styled('a', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.BtnText,
  color: colors.primary,
}));

export const StyledText = styled('p', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...typo.Desc,
  ...(props.variant === 'light' && { color: colors.descLight }),
  ...(props.variant === 'dark' && { color: colors.descDark }),
  ...(props.variant === 'danger' && { color: colors.redText }),
  ...(props.variant === 'success' && { color: colors.greenText }),
  ...(props.color && { color: props.color }),
  ...(props.size && { fontSize: props.size }),
}));

// new design

export const StyledB1 = styled('span', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...baseStyles(typo.B1, props),
  ...(props.bold && { fontWeight: weight.semibold }),
}));

export const StyledH1 = styled('span', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...baseStyles(typo.H1, props),
}));

export const StyledH2 = styled('span', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...baseStyles(typo.H2, props),
}));

export const StyledH3 = styled('span', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...baseStyles(typo.H3, props),
}));

export const StyledCaption = styled('span', {
  shouldForwardProp: (prop) => !noForwardProps.includes(prop),
})((props) => ({
  ...baseStyles(typo.caption, props),
}));
