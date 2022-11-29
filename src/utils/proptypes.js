/**
 * isRequiredIf
 * Prop is required only if condition is true
 *
 * @param {Object} props All props supplied to component
 * @param {String} propName Name of prop to validate
 * @param {String} componentName Name of component with this prop
 * @param {String} type Expected typeof of this prop
 * @param {Boolean} condition Condition to determine if prop is required or not
 * @returns {(Boolean|Error)} False if condition is not met OR Error if meets condition but fails validation
 */
export const isRequiredIf = (props, propName, componentName, type, condition) => {
  if (!condition) return false;

  const typeofProp = typeof props[propName];
  if (!Object.prototype.hasOwnProperty.call(props, propName)) {
    return new Error(
      `${componentName}: missing required prop \`${propName}\` of type \`${type}\`.`,
    );
  }
  if (typeofProp !== type) {
    return new Error(
      `${componentName}: invalid prop \`${propName}\` supplied with type \`${typeofProp}\`; expected prop of type \`${type}\`.`,
    );
  }
};
