import { IconWrapper } from "./Icon.styles";
import * as colors from "../../theme/colors";
import { Image } from "../image/Image";

export const Icon = function (props) {
  const { name, iconImg, ...remainingProps } = props;

  return (
    <IconWrapper>
      {iconImg && <Image src={iconImg} alt="name" height="16px" />}
      {name && (
        <i
          style={{ color: props.color ? props.color : colors.primary }}
          className={"fas " + name}
          {...remainingProps}
        />
      )}
    </IconWrapper>
  );
};

export default Icon;
