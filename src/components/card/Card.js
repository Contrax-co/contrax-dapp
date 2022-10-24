import { StyledCard, StyledCardBody } from './Card.styles';

export const Card = function (props) {
  const { children, ...remainingProps } = props;

  return (
    <StyledCard {...remainingProps}>
      <StyledCardBody className={props.bodyClass}>{children}</StyledCardBody>
    </StyledCard>
  );
};

export default Card;
