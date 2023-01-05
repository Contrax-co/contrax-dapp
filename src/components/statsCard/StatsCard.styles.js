import styled from "styled-components/macro";
import { B1 } from "../text/Text";
import * as colors from "../../theme/colors";
import { TextBtn } from "../../theme/typography";

export const StyledDesc = styled(B1)((props) => ({
  display: "inline-flex",
  "+span": {
    margin: props.iconAlignRight ? "0 0.4rem 0 0" : "0 0 0 0.4rem",
  },
  color: colors.accentDark,
}));

export const StyledBtnText = styled(B1)((props) => ({
  display: "inline-flex",
  "+span": {
    margin: props.iconAlignRight ? "0 0.4rem 0 0" : "0 0 0 0.4rem",
  },
  ...TextBtn,
}));
