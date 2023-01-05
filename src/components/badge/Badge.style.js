import styled from "styled-components/macro";
import * as colors from "../../theme/colors";

export const StyledBadge = styled.span.attrs((props) => {
  return {
    className: "badge text-dark",
  };
})`
  color: ${colors.primary} !important;
  background-color: ${colors.badgeBg};
`;
