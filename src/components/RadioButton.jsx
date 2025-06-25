import PropTypes from "prop-types";
import { forwardRef } from 'react';

/**
 * 
 * @example
 * <RadioButton
 *   className="form-check-inline"
 *   name="ckTipoCliente"
 *   id="natural"
 *   value="natural"
 *   checked={tipo === 'natural'}
 *   onChange={handleTipo}
 * >
 *   <i className="bi bi-person"></i> Persona Natural
 * </RadioButton>
 */
const RadioButton = forwardRef(({
    id,
    className = "",
    children,
    ...rest // incluye autoFocus, value, name, checked, disabled, onChange, etc.
}, ref) => {
    return (
        <div className={`form-check ${className}`}>
            <input
                type="radio"
                id={id}
                ref={ref}
                className="form-check-input"
                {...rest}
            />
            {children && (
                <label className="form-check-label" htmlFor={id}>
                    {children}
                </label>
            )}
        </div>
    );
});

RadioButton.propTypes = {
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
    // Los demás props como autoFocus, value, checked, etc., van por ...rest
};

export default RadioButton;
