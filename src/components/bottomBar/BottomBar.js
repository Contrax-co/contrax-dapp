import { Col, Row } from "../blocks/Blocks";
import { Desc } from "../text/Text";

export default function BottomBar() {
  return (
    <Row className="bottombar-design">
      <Col size="3"></Col>
      <Col size="6" className="text-center">
        <Desc color={"#334A52"}>©2022 Contrax. All rights reserved.</Desc>
      </Col>
    </Row>
  );
}
