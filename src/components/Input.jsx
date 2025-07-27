import PropTypes from 'prop-types';
import { forwardRef } from 'react';

/**
 * 
 * @param {*} param
 * @returns 
 * Example:
    <Input
        label={<>Nombre:<i className="fa fa-asterisk text-danger small"></i></>}
        placeholder="Ingrese el nombre"
        ref={this.refNombre}
        value={this.state.nombre}
        onChange={this.handleInputNombre}
    />
 */

const Input = forwardRef(
  (
    {
      label,
      group = false,
      iconLeft,
      buttonRight,
      contentRight,
      type = 'text',
      className = 'border border-primary',
      ...rest // ← Aquí van las demás props como onChange, value, etc.
    },
    ref,
  ) => {
    if (type === 'color') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <div className="d-flex align-items-center">
            <input
              type="color"
              className="h-10 w-10 border rounded"
              ref={ref}
              {...rest}
            />
          </div>
        </div>
      );
    }

    if (group) {
      return (
        <>
          {label && <label>{label}</label>}
          <div className="input-group">
            {iconLeft && (
              <div className="input-group-prepend">
                <span className="btn btn-primary">{iconLeft}</span>
              </div>
            )}

            <input
              ref={ref}
              type={type}
              className={`form-control border border-primary ${className}`}
              {...rest}
            />

            {contentRight}
            {buttonRight && (
              <div className="input-group-append">{buttonRight}</div>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        {label && <label>{label}</label>}
        <input
          ref={ref}
          type={type}
          className={`form-control border border-primary ${className}`}
          {...rest}
        />
      </>
    );
  },
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  group: PropTypes.bool,
  iconLeft: PropTypes.element,
  type: PropTypes.string,
  className: PropTypes.string,
  buttonRight: PropTypes.element,
  contentRight: PropTypes.element,
};

export default Input;
