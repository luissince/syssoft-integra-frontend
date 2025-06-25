import PropTypes from "prop-types";
import { forwardRef } from 'react';

/**
 * 
 * @example
 * <TextArea
 *   label={"Descripción Corta:"}
 *   rows={3}
 *   ref={refDescripcionCorta}
 *   value={descripcionCorta}
 *   onChange={handleInputDescripcionCorta}
 * />
 */
const TextArea = forwardRef(({
    label,
    rows = 3,
    group = false,
    iconLeft,
    buttonRight,
    className = "border border-primary",
    ...rest // aquí van autoFocus, placeholder, value, onChange, etc.
}, ref) => {
    const textareaElement = (
        <textarea
            ref={ref}
            rows={rows}
            className={`form-control border border-primary ${className}`}
            {...rest}
        />
    );

    if (group) {
        return (
            <>
                {label && <label>{label}</label>}
                <div className="input-group">
                    {iconLeft && (
                        <div className="input-group-prepend">
                            <span className="btn btn-primary">
                                {iconLeft}
                            </span>
                        </div>
                    )}
                    {textareaElement}
                    {buttonRight && (
                        <div className="input-group-append">
                            {buttonRight}
                        </div>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            {label && <label>{label}</label>}
            {textareaElement}
        </>
    );
});

TextArea.displayName = 'TextArea';

TextArea.propTypes = {
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    rows: PropTypes.number,
    group: PropTypes.bool,
    iconLeft: PropTypes.element,
    buttonRight: PropTypes.element,
    className: PropTypes.string,
    // los demás props como value, placeholder, etc., son pasados por `...rest`
};

export default TextArea;
