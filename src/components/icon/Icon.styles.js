import styled from "styled-components/macro";
import * as colors from "../../theme/colors";

export const IconWrapper = styled.span((props) => ({
    padding: 7,
    borderRadius: "50%",
    background: colors.accentLight,
    height: "2rem",
    width: "2rem",
    display: "inline-flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
}));
