import PropTypes from 'prop-types';

const RadioButton = ({
    autoFocus,
    id,
    className = "",
    placeholder,
    disabled,
    role,
    refInput,
    value,
    checked,
    onChange,
    onKeyUp,
    onKeyDown,
    onPaste,
    children
}) => {
    return (
        <div className={`form-check ${className}`}>
            <input
                autoFocus={autoFocus}
                id={id}
                type={"radio"}
                className="form-check-input"
                placeholder={placeholder}
                disabled={disabled}
                role={role}
                ref={refInput}
                value={value}
                checked={checked}
                onChange={onChange}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
            />
            {
                children &&
                <label className="form-check-label" htmlFor={id}>
                    {children}
                </label>
            }
        </div>
    );
}

RadioButton.propTypes = {
    autoFocus: PropTypes.bool,
    id: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    role: PropTypes.string,
    refInput: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func,
    children: PropTypes.node,
};

export default RadioButton;