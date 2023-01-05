import styled, { css } from "styled-components/macro";
import * as colors from "../../theme/colors";

export const StyledCard = styled.div.attrs((props) => {
  return {
    className: "card " + props.className,
  };
})`
  background: ${colors.white};
  ${(props) =>
    props.background &&
    css`
      background: ${props.background};
    `}
  border-radius: 1rem;
  display: inline-flex;
  border: 1px solid ${colors.secondaryMideum};
`;

export const StyledCardBody = styled.div.attrs((props) => {
  return {
    className: "card-body",
  };
})`
  padding: 1.5rem;
`;
