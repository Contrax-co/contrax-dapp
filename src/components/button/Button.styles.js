import styled, { css } from "styled-components/macro";
import * as colors from "../../theme/colors";
import { weight, family } from "../../theme/fonts";

export const StyledButton = styled.button.attrs((props) => {
  return {
    className: "btn",
  };
})`
  ${(props) =>
    !props.primary &&
    css`
      background-color: ${colors.secondaryBtn.background};
      color: ${colors.secondaryBtn.color};
      border: 1px solid ${colors.secondaryBtn.color};
      &:hover {
        background-color: ${colors.secondaryBtn.hoverBackground};
        color: ${colors.secondaryBtn.hoverColor};
      }
    `}
  ${(props) =>
    !props.primary &&
    props.disabled &&
    css`
      background-color: ${colors.secondaryBtn.disabledBackground};
      color: ${colors.secondaryBtn.disabledColor};
      border: 1px solid ${colors.secondaryBtn.disabledBorderColor};
    `}

  ${(props) =>
    props.primary &&
    css`
      background-color: ${colors.primaryBtn.background};
      color: ${colors.primaryBtn.color};
      &:hover {
        background-color: ${colors.primaryBtn.hoverBackground};
        color: ${colors.primaryBtn.hoverColor};
      }
    `}
  ${(props) =>
    props.primary &&
    props.disabled &&
    css`
      background-color: ${colors.primaryBtn.disabledBackground};
      color: ${colors.primaryBtn.disabledColor};
    `}
  
  ${(props) =>
    props.size === "sm" &&
    css`
    font-size: 1rem,
    light-height: 1.5rem,
    padding: 9px 18px;
  `}

  ${(props) =>
    props.size === "large" &&
    css`
      font-size: 1.25rem;
      line-height: 2rem;
      padding: 7px 25px;
    `}

  ${(props) =>
    props.width &&
    css`
      width: ${props.width};
    `}
  
  border-radius: 3rem;
  font-family: ${family.Poppins};
  font-style: normal;
  font-weight: ${weight.semibold};
`;
