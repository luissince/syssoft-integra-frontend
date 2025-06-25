import PropTypes from 'prop-types';

/**
 * 
 * @param {*} param0 
 * @returns 
 * Example:
    <Switches
        label={"Preferido:"}
        id={"cbPreferido"}
        checked={this.state.predefinido}
        onChange={(value) =>
            this.setState({ predefinido: value.target.checked })
        }
    >
        {this.state.predefinido ? "Si" : "No"}
    </Switches>
 */
export const Switches = ({
    autoFocus = false,
    id,
    label,
    className = '',
    disabled = false,
    refInput,
    value,
    name,
    checked = false,
    onChange,
    onKeyUp,
    onKeyDown,
    onPaste,
    children
}) => {
    const renderSwitch = () => (
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

    return (
        <>
            {label && <label htmlFor={id}>{label}</label>}
            {renderSwitch()}
        </>
    );
};

Switches.propTypes = {
    autoFocus: PropTypes.bool,
    id: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    refInput: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func,
    children: PropTypes.node,
};
/**
 * 
 * @param {*} param0 
 * @returns 
 * Example:
    <CheckBox
        id="checkboxPnCliente"
        checked={this.state.cliente}
        onChange={(event) => {
            this.setState({ cliente: event.target.checked })
        }}>
        Cliente
    </CheckBox>
 */
const CheckBox = ({
    autoFocus = false,
    id,
    className = '',
    disabled = false,
    refInput,
    value,
    name,
    checked = false,
    onChange,
    onKeyUp,
    onKeyDown,
    onPaste,
    children
}) => (
    <div className={`form-check ${className}`}>
        <input
            type="checkbox"
            className="form-check-input"
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
        {children && (
            <label className="form-check-label" htmlFor={id}>
                {children}
            </label>
        )}
    </div>
);

CheckBox.propTypes = {
    autoFocus: PropTypes.bool,
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    refInput: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
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
