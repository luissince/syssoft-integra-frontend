import PropTypes from 'prop-types';

const TextArea = ({
    autoFocus,
    title,
    className = "",
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
        <textarea
            autoFocus={autoFocus}
            title={title}
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

TextArea.propTypes = {
    autoFocus: PropTypes.bool,
    title: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    role: PropTypes.string,
    refInput: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func
};

export default TextArea;