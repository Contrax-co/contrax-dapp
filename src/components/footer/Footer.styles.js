import styled from "styled-components/macro";
import { Container } from "../blocks/Blocks";
import { Image } from "../image/Image";

export const StyledBox1 = styled(Container)((props) => ({
    borderRadius: "1.5rem",
    padding: "2.3rem 3rem",
}));

export const StyledBox = styled(Container)`
    border-radius: 1.5rem;
    padding: 2.3rem 3rem;
    @media (max-width: 63.94em) {
        border-radius: 1.5rem;
        padding: 1rem 1rem;
        width: calc(100% - 1rem);
    }
`;

export const StyledImage = styled(Image)`
    width: 239px;
    @media (max-width: 63.94em) {
        width: 100%;
    }
`;
