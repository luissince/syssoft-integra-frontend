import PropTypes from 'prop-types';

const RadioButton = ({
    autoFocus,
    id,
    className = "",
    disabled,
    refInput,
    value,
    name,
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
                type="radio"
                className="form-check-input"
                disabled={disabled}
                ref={refInput}
                value={value}
                name={name}
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
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    refInput: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func,
    children: PropTypes.node,
};

export default RadioButton;