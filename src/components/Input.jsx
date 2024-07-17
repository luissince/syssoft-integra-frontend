import PropTypes from 'prop-types';

const Input = ({
    autoFocus = false,
    iconLeft,
    type = "text",
    className = "",
    placeholder,
    disabled,
    role,
    refInput,
    value,
    buttonRight,
    onChange,
    onKeyUp,
    onKeyDown,
    onPaste
}) => {
    if (iconLeft) {
        return (
            <div className="input-group mb-2">
                <div className="input-group-prepend">
                    <div className="input-group-text">
                        {iconLeft}
                    </div>
                </div>

                <input
                    autoFocus={autoFocus}
                    type={type}
                    className={`form-control ${className}`}
                    placeholder={placeholder}
                    disabled={disabled}
                    role={role}
                    ref={refInput}
                    value={value}
                    onChange={onChange}
                    onKeyUp={onKeyUp}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                />

                <div className="input-group-append">
                    {buttonRight}
                </div>
            </div>
        );
    }
    return (
        <input
            autoFocus={autoFocus}
            type={type}
            className={`form-control ${className}`}
            placeholder={placeholder}
            disabled={disabled}
            role={role}
            ref={refInput}
            value={value}
            onChange={onChange}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
        />
    );
}

Input.propTypes = {
    autoFocus: PropTypes.bool,
    iconLeft: PropTypes.element,
    type: PropTypes.oneOf(["text", "password", "search", "date", "email"]),
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    role: PropTypes.string,
    refInput: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    buttonRight: PropTypes.element,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func
};

export default Input;