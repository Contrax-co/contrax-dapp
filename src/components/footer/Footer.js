import { useLocation } from "react-router-dom";
import BottomBar from "../bottomBar/BottomBar";
import { Col, Row } from "../blocks/Blocks";
import * as colors from "../../theme/colors";
import { StyledBox, StyledImage } from "./Footer.styles";
import footerLogo from "../../images/footer-logo.png";
import discordLogo from "../../images/discord.png";
import twitterLogo from "../../images/twitter.png";
import telegramLogo from "../../images/telegram.png";
import githubLogo from "../../images/github.png";
import mediumLogo from "../../images/medium.png";
import { Image } from "../image/Image";
import { H3 } from "../text/Text";

export default function Footer() {
  const location = useLocation();
  return (
    <div className="footer">
      <Row height="72px" />
      <StyledBox color={colors.accentDark}>
        <Row className="row">
          <Col size="6">
            <StyledImage src={footerLogo} width="239px" alt="contrax" />
          </Col>
        </Row>
        <Row className="mt-2 mb-3">
          <Col size="12">
            <H3 color={colors.whiteText}>Fast. Secure. Permissionless.</H3>
          </Col>
        </Row>
        <Row>
          <Col size="12">
            <a href="https://discord.gg/rDdvyeWAtt">
              <Image src={discordLogo} alt="Discord" />
            </a>
            <a href="https://twitter.com/Contrax_Finance">
              <Image className="m-4 mt-1 mb-1" src={twitterLogo} alt="Twitter" />
            </a>
            <a href="https://t.me/Contrax">
              <Image className="m-1 mt-1 mb-1" src={telegramLogo} alt="Telegram" />
            </a>
            <a href="https://contraxfi.medium.com/contrax-the-dapp-token-and-dao-explained-8c8d5a9b7e9d">
              <Image className="m-4 mt-1 mb-1" src={mediumLogo} alt="Medium" />
            </a>
            <a href="https://github.com/Contrax-co">
              <Image className="m-1 mt-1 mb-1" src={githubLogo} alt="GitHub" />
            </a>
          </Col>
          <Col size="6" className="text-right">
            {/* <Button primary size='sm' className='mt-3'>Get Started</Button> */}
          </Col>
        </Row>
      </StyledBox>
      {location === "" ? "" : <BottomBar />}
    </div>
  );
}
