import styled, { css } from "styled-components/macro";

export const StyledContainer = styled.div.attrs((props) => {
  return {
    className: props.fluid ? "container-fluid" : "container",
  };
})`
  ${(props) =>
    props.color &&
    css`
      background-color: ${props.color};
    `}
`;

export const StyledRow = styled.div.attrs((props) => {
  return {
    className: "row",
  };
})`
  ${(props) =>
    props.height &&
    css`
      height: ${props.height};
    `}
`;

export const StyledCol = styled.div.attrs((props) => {
  return {
    className: props.size ? "col-md-" + props.size : "col",
  };
})``;

export const StyledBlock = styled.div.attrs((props) => {})``;
