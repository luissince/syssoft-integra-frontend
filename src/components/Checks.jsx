import PropTypes from 'prop-types';

export const Switches = ({
    autoFocus,
    id,
    label,
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

    if (label) {
        return (
            <>
                <label htmlFor={id}>{label}</label>

                <div className={`custom-control custom-switch ${className}`}>
                    <input
                        type="checkbox"
                        className="custom-control-input"
                        autoFocus={autoFocus}
                        ref={refInput}
                        id={id}
                        name={name}
                        value={value}
                        checked={checked}
                        onChange={onChange}
                        onKeyUp={onKeyUp}
                        onKeyDown={onKeyDown}
                        onPaste={onPaste}
                        disabled={disabled}
                    />
                    <label className="custom-control-label" htmlFor={id}>
                        {children}
                    </label>
                </div>
            </>
        );
    }

    return (
        <div className={`custom-control custom-switch ${className}`}>
            <input
                type="checkbox"
                className="custom-control-input"
                autoFocus={autoFocus}
                ref={refInput}
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                disabled={disabled}
            />
            <label className="custom-control-label" htmlFor={id}>
                {children}
            </label>
        </div>
    );
}

Switches.propTypes = {
    autoFocus: PropTypes.bool,
    id: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    refInput: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func,
    children: PropTypes.node,
};

const CheckBox = ({
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
                className="form-check-input"
                autoFocus={autoFocus}
                type="checkbox"
                ref={refInput}
                name={name}
                id={id}
                value={value}
                checked={checked}
                onChange={onChange}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                disabled={disabled} />
            {children && <label className="form-check-label" htmlFor={id}> {children}</label>}
        </div>
    );
}

CheckBox.propTypes = {
    autoFocus: PropTypes.bool,
    id: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    refInput: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func,
    children: PropTypes.node,
};

export default CheckBox;