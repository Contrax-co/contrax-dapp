import styled from "styled-components/macro";
import { Container } from "../blocks/Blocks";

export const StyledHeader = styled(Container)((props) => ({
    backgroundImage: `url(${props.background})`,
    backgroundSize: "cover",
}));
