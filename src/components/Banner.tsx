import Button from "./button/Button";
import { H3, H2, H1 } from "./text/Text";

import banner1 from "../images/banner-1.png";
import arbitrum from "../images/arbitrum_grayscaled.png";
import arbiscan from "../images/arbiscan_grayscaled.png";
import sushiswap from "../images/sushiswap_grayscaled.png";
import { Image } from "./image/Image";
import { Col, Container, Row } from "./blocks/Blocks";
import * as colors from "../theme/colors";

export default function banner() {
  return (
    <div style={{ background: colors.pageBgLight, paddingBottom: "1rem" }}>
      <header className="masthead home-background">
        <Container className="h-100">
          <Row>
            <Col size="7" className="my-auto">
              <p className={"mt-4 mb-2"}>
                <H2 color={colors.secondaryMideum}>Automated DeFi Tools</H2>
              </p>
              <H1 color={colors.primary} size="4.5rem" lineHeight="5rem">
                Fast. Secure. <br />
                Permissionless.
              </H1>
              <Row>
                <H3 color={colors.secondaryDark} className="mt-3 mb-1">
                  The #1 Source for Real-Yield Farms on Arbitrum
                </H3>
              </Row>
              <Image src={arbitrum} className="mr-4 mt-3" width="140" height="27" alt="Arbitrum" />
              <Image src={sushiswap} className="mr-4 mt-3" width="125" height="22" alt="Sushiswap" />
              <Image src={arbiscan} className="mr-4 mt-3" width="140" height="27" alt="Arbiscan" />
              <Row className=""></Row>
              <Button size="sm" className="mb-3 mt-4 p-3 px-4" primary label={"Explore Docs"} />
            </Col>
            <Col size="5" className="pt-4">
              <Image src={banner1} alt="banner" className="mt-1" />
            </Col>
          </Row>
        </Container>
      </header>
    </div>
  );
}
