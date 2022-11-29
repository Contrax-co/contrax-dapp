import { StyledButton } from './Button.styles';
import uuid from 'react-uuid';
import * as colors from '../../theme/colors';

export const Button = (props) => {
  const {
    disabled,
    small,
    variant,
    type,
    label,
    icon,
    logo,
    iconAlignRight,
    name,
    onClick,
    children,
    ...remainingProps
  } = props;

  return (
    <StyledButton
      disabled={disabled}
      small={small}
      variant={variant}
      type={type}
      name={name}
      onClick={disabled || !onClick ? undefined : onClick}
      iconAlignRight={iconAlignRight}
      data-testid="button"
      {...remainingProps}
    >
      {icon && <i className={`fas ${icon}`}></i>}
      {label ? <span>{label}</span> : children}
    </StyledButton>
  );
};

Button.defaultProps = {
  variant: 'primary',
  type: 'button',
  size: 'large',
};

export const ButtonGroupRadio = (props) => {
  const { values, name, checked, className, disabled, ...remainingProps } =
    props;
  console.log({ className });
  return (
    <div
      class={className + ' btn-group'}
      role="group"
      aria-label="Basic radio toggle button group"
      {...remainingProps}
    >
      {values.map((item) => {
        const key = uuid();
        return (
          <>
            <input
              type="radio"
              class="btn-check"
              name={name}
              id={key}
              autocomplete="off"
              checked={item === checked}
              disabled={disabled && disabled.includes(item)}
            />
            <label
              class="btn btn-primary"
              style={{
                background: colors.primary,
                borderColor: colors.primary,
              }}
              for={key}
            >
              {item}
            </label>
          </>
        );
      })}
    </div>
  );
};

export default Button;
