import PropTypes from 'prop-types';

const Input = ({
    autoFocus,
    placeholder,
    disabled,
    role,
    refInput,
    value,
    onChange,
    onKeyUp,
    onKeyDown,
    onPaste
}) => {
    return (
        <input
            autoFocus={autoFocus}
            type="text"
            className="form-control"
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
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    role: PropTypes.string,
    refInput: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func
};

export default Input;