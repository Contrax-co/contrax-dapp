import { StyledBadge } from './Badge.style';

export const Badge = (props) => {
  const { children, ...remainingProps } = props;

  return <StyledBadge {...remainingProps}>{children}</StyledBadge>;
};
