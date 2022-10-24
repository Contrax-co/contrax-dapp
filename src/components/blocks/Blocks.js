import {
  StyledBlock,
  StyledCol,
  StyledContainer,
  StyledRow,
} from './Blocks.style';

export const Container = (props) => {
  const { children, ...remainingProps } = props;

  return <StyledContainer {...remainingProps}>{children}</StyledContainer>;
};

export const Row = (props) => {
  const { children, ...remainingProps } = props;

  return <StyledRow {...remainingProps}>{children}</StyledRow>;
};

export const Col = (props) => {
  const { children, ...remainingProps } = props;

  return <StyledCol {...remainingProps}>{children}</StyledCol>;
};

export const Block = (props) => {
  const { children, ...remainingProps } = props;

  return <StyledBlock {...remainingProps}>{children}</StyledBlock>;
};
