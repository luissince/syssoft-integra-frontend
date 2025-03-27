import PropTypes from 'prop-types';

/**
 * 
 * @param {*} param
 * @returns 
 * Example:
    <Input
        label={<>Nombre:<i className="fa fa-asterisk text-danger small"></i></>}
        placeholder="Ingrese el nombre"
        refInput={this.refNombre}
        value={this.state.nombre}
        onChange={this.handleInputNombre}
    />
 */
const Input = ({
    autoFocus = false,
    label,
    group = false,
    iconLeft,
    type = "text",
    autoComplete = "off",
    className = "border border-primary",
    placeholder,
    disabled,
    role,
    refInput,
    value,
    buttonRight,
    contentRight,
    onChange,
    onKeyUp,
    onKeyDown,
    onPaste,
    onFocus,
    onMouseDown,
    onBlur
}) => {
    if (type === 'color') {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <div className="d-flex align-items-center">
                    <input
                        type="color"
                        value={value}
                        onChange={onChange}
                        className="h-10 w-10 border rounded"
                    />
                </div>
            </div>
        );
    }

    if (group) {
        return (
            <>
                {label && <label>{label} </label>}

                <div className="input-group">
                    {
                        iconLeft && (
                            <div className="input-group-prepend">
                                {/* <div className="input-group-text">
                                    {iconLeft}
                                </div> */}
                                <span className='btn btn-primary'>
                                    {iconLeft}
                                </span>
                            </div>
                        )
                    }

                    <input
                        autoFocus={autoFocus}
                        type={type}
                        autoComplete={autoComplete}
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
                        onFocus={onFocus}
                        onMouseDown={onMouseDown}
                        onBlur={onBlur}
                    />

                    {
                        contentRight
                    }

                    {
                        buttonRight && (
                            <div className="input-group-append">
                                {buttonRight}
                            </div>
                        )
                    }
                </div>
            </>
        );
    }

    return (
        <>
            {label && <label>{label} </label>}
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
                onFocus={onFocus}
                onMouseDown={onMouseDown}
                onBlur={onBlur}
            />
        </>
    );
}

Input.propTypes = {
    autoFocus: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    group: PropTypes.bool,
    iconLeft: PropTypes.element,
    type: PropTypes.oneOf(["text", "password", "search", "date", "email", "color"]),
    autoComplete: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    role: PropTypes.string,
    refInput: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    buttonRight: PropTypes.element,
    contentRight: PropTypes.element,
    onChange: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown: PropTypes.func,
    onPaste: PropTypes.func,
    onFocus: PropTypes.func,
    onMouseDown: PropTypes.func,
    onBlur: PropTypes.func
};

export default Input;