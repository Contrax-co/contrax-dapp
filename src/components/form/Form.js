import { B1, Caption } from '../text/Text';
import { StyledCheckbox, StyledForm, StyledInput } from './Form.styles';
import * as colors from '../../theme/colors';
import { weight } from '../../theme/fonts';
import { Block, Row } from '../blocks/Blocks';
import "./Form.css";
export const Form = (props) => {
  const { children, ...remainingProps } = props;

  return <StyledForm {...remainingProps}>{children}</StyledForm>;
};

export const FormInput = (props) => {
  const {
    variant,
    value,
    onClick,
    children,
    label,
    className,
    inputClassName,
    type,
    lightMode,
    ...remainingProps
  } = props;

  return (
    <div className={props.className}>
      {label && <B1 color={colors.secondaryDark}>{label}</B1>}
      <StyledInput
        variant={variant}
        onClick={!onClick ? undefined : onClick}
         className={`form-control form__input ${lightMode && 'form-control form__input--light'}`}
     
        type={type || 'text'}
        {...remainingProps}
      ></StyledInput>
      {props.caption && <Caption>
       <div  className={`token_title ${lightMode && 'token_title--light'}`}>
        {props.caption}
        </div></Caption>}
    </div>
  );
};

export const FormCheckbox = (props) => {
  const {
    variant,
    value,
    onClick,
    children,
    label,
    className,
    lightMode,
    inputClassName,
    ...remainingProps
  } = props;

  return (
    <div className={props.className}>
      <Row className="d-flex flex-row flex-nowrap">
        <StyledCheckbox
          variant={variant}
          onClick={!onClick ? undefined : onClick}
          className="form-check-input"
          type="checkbox"
          {...remainingProps}
        />
        <Block className="p-0">
          <Row>
        
            <B1 weight={props.caption ? weight.semibold : weight.regular}>
            <div  className={`token_title ${lightMode && 'token_title--light'}`}>
              {props.label}
              </div>
            </B1>
            
          </Row>
          {props.caption && (
            <Row>
              
              <B1>
              <div  className={`token_title ${lightMode && 'token_title--light'}`}>
                {props.caption}    </div></B1>
          
            </Row>
          )}
        </Block>
      </Row>
    </div>
  );
};
