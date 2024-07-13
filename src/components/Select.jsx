import PropTypes from 'prop-types';

const Select = ({
    autoFocus = false,
    title,
    className,
    refSelect,
    value,
    disabled,
    onChange,
    children
}) => {
    return (
        <select
            autoFocus={autoFocus}
            title={title}
            className={`form-control ${className}`}
            ref={refSelect}
            value={value}
            disabled={disabled}
            onChange={onChange}>
            {children}
        </select>
    );
}

Select.propTypes = {
    autoFocus: PropTypes.bool,
    title: PropTypes.string,
    className: PropTypes.string,
    refSelect: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    children: PropTypes.node,
};

export default Select;