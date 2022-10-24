import React from 'react';
import PropTypes from 'prop-types';

import {
  StyledPageTitle,
  StyledTitle,
  StyledPageSubTitle,
  StyledDesc,
  StyledDescSpan,
  StyledLink,
  StyledText,
  StyledB1,
  StyledH1,
  StyledH2,
  StyledH3,
  StyledCaption,
} from './Text.styles';

const propTypes = {
  small: PropTypes.bool,
  color: PropTypes.oneOf(['light', 'dark']),
  value: PropTypes.string,
  onClick: PropTypes.func,
  'aria-label': PropTypes.string,
  'aria-haspopup': PropTypes.string,
};

export const PageTitle = (props) => {
  const { variant, value, onClick, children, ...remainingProps } = props;

  return (
    <StyledPageTitle
      variant={variant}
      onClick={!onClick ? undefined : onClick}
      {...remainingProps}
    >
      {value ? <span>{value}</span> : <span>{children}</span>}
    </StyledPageTitle>
  );
};

PageTitle.prototype = propTypes;
PageTitle.defaultProps = { variant: 'dark' };

export const PageSubTitle = (props) => {
  const { variant, value, onClick, children, ...remainingProps } = props;

  return (
    <StyledPageSubTitle
      variant={variant}
      onClick={!onClick ? undefined : onClick}
      {...remainingProps}
    >
      {value ? <span>{value}</span> : <span>{children}</span>}
    </StyledPageSubTitle>
  );
};
PageSubTitle.prototype = propTypes;
PageSubTitle.defaultProps = { variant: 'dark' };

export const Title = (props) => {
  const { variant, value, onClick, children, ...remainingProps } = props;

  return (
    <StyledTitle
      variant={variant}
      onClick={!onClick ? undefined : onClick}
      {...remainingProps}
    >
      {value ? <span>{value}</span> : <span>{children}</span>}
    </StyledTitle>
  );
};
Title.prototype = propTypes;
Title.defaultProps = { variant: 'dark' };

export const Desc = (props) => {
  const { variant, value, onClick, children, ...remainingProps } = props;

  return (
    <StyledDesc
      variant={variant}
      onClick={!onClick ? undefined : onClick}
      {...remainingProps}
    >
      {value ? <span>{value}</span> : <span>{children}</span>}
    </StyledDesc>
  );
};
Desc.prototype = propTypes;
Desc.defaultProps = { variant: 'dark' };

export const DescSpan = (props) => {
  const { variant, value, onClick, children, ...remainingProps } = props;

  return (
    <StyledDescSpan
      variant={variant}
      onClick={!onClick ? undefined : onClick}
      {...remainingProps}
    >
      {value ? <span>{value}</span> : <span>{children}</span>}
    </StyledDescSpan>
  );
};
DescSpan.prototype = propTypes;
DescSpan.defaultProps = { variant: 'dark' };

export const Link = (props) => {
  const { variant, text, link, onClick, children, ...remainingProps } = props;

  return (
    <StyledLink
      variant={variant}
      onClick={!onClick ? undefined : onClick}
      {...remainingProps}
      href={link}
    >
      {text || children}
    </StyledLink>
  );
};
Link.prototype = propTypes;
Link.defaultProps = { variant: 'dark' };

export const Text = (props) => {
  const { variant, value, onClick, children, ...remainingProps } = props;

  return (
    <StyledText
      variant={variant}
      onClick={!onClick ? undefined : onClick}
      {...remainingProps}
    >
      {value ? <span>{value}</span> : <span>{children}</span>}
    </StyledText>
  );
};
Text.prototype = propTypes;
Text.defaultProps = { variant: 'dark' };

// new design

export const B1 = (props) => {
  const { variant, children, ...remainingProps } = props;

  return (
    <StyledB1 variant={variant} {...remainingProps}>
      {props.value || children}
    </StyledB1>
  );
};
B1.prototype = propTypes;
B1.defaultProps = { variant: 'dark' };

export const H1 = (props) => {
  const { variant, children, ...remainingProps } = props;

  return (
    <StyledH1 variant={variant} {...remainingProps}>
      {children}
    </StyledH1>
  );
};

H1.prototype = propTypes;
H1.defaultProps = { variant: 'dark' };

export const H2 = (props) => {
  const { variant, children, ...remainingProps } = props;

  return (
    <StyledH2 variant={variant} {...remainingProps}>
      {children}
    </StyledH2>
  );
};
H2.prototype = propTypes;
H2.defaultProps = { variant: 'dark' };

export const H3 = (props) => {
  const { variant, children, ...remainingProps } = props;

  return (
    <StyledH3 variant={variant} {...remainingProps}>
      {children}
    </StyledH3>
  );
};
H3.prototype = propTypes;
H3.defaultProps = { variant: 'dark' };

export const Caption = (props) => {
  const { variant, children, ...remainingProps } = props;

  return (
    <StyledCaption variant={variant} {...remainingProps}>
      {children}
    </StyledCaption>
  );
};
Caption.prototype = propTypes;
Caption.defaultProps = { variant: 'dark' };
