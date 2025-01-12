import PropTypes from 'prop-types';

const TextArea = ({
    autoFocus = false,
    label,
    rows,
    group = false,
    iconLeft,
    title,
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
    if (group) {
        return (
            <>
                {label && <label> {label} </label>}
                <div className="input-group">
                    {iconLeft && <div className="input-group-prepend">
                        <div className="input-group-text">
                            {iconLeft}
                        </div>
                    </div>}

                    <textarea
                        autoFocus={autoFocus}
                        title={title}
                        rows={rows}
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
                    {buttonRight &&
                        <div className="input-group-append">
                            {buttonRight}
                        </div>
                    }
                </div>
            </>
        );
    }
    return (
        <>
            {label && <label> {label} </label>}
            <textarea
                autoFocus={autoFocus}
                title={title}
                rows={rows}
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
        </>
    );
}

TextArea.propTypes = {
    autoFocus: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    rows: PropTypes.number,
    group: PropTypes.bool,
    iconLeft: PropTypes.element,
    title: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    role: PropTypes.string,
    refInput: PropTypes.object,
    value: PropTypes.string,
    buttonRight: PropTypes.element,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func
};

export default TextArea;