import Button from "../button/Button";
import { H3 } from "../text/Text";
import { StyledCrossBtn, StyledModalContent, StyledModalDialog } from "./Modal.styles";
import crossImage from "../../assets/images/cross.svg";
import { Image } from "../image/Image";
import * as colors from "../../theme/colors";
import Icon from "../icon/Icon";
import "./modal.css";
import useApp from "src/hooks/useApp";

export const Modal = (props) => {
    const { onClose, onOk, hasOkayButton = true, children, title, okLabel, closeLabel, ...remainingProps } = props;
    const { lightMode } = useApp();
    return (
        <div className="modal fade" aria-labelledby="exampleModalLabel" aria-hidden="true" {...remainingProps}>
            <StyledModalDialog>
                <StyledModalContent lightMode={lightMode}>
                    <div className="modal-header border-0 pb-2">
                        <H3 className="modal-title" color={colors.accentDark}>
                            {props.titleIcon && <Icon name={props.titleIcon} />} {title}
                        </H3>
                        <StyledCrossBtn
                            type="button"
                            className="btn-close mt-0"
                            data-bs-dismiss="modal"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <Image src={crossImage} alt="close" />
                        </StyledCrossBtn>
                    </div>
                    <div className="modal-body pb-0">{children}</div>
                    <div className="modal-footer border-0 pb-0">
                        {closeLabel && (
                            <Button type="button" className="col" onClick={onClose} data-bs-dismiss="modal">
                                {closeLabel ? closeLabel : "Close"}
                            </Button>
                        )}
                        {hasOkayButton && (
                            <Button type="button" className="col" primary onClick={onOk}>
                                {okLabel ? okLabel : "OK"}
                            </Button>
                        )}
                    </div>
                </StyledModalContent>
            </StyledModalDialog>
        </div>
    );
};
