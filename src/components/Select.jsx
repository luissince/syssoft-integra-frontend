import PropTypes from 'prop-types';

const Select = ({ title, className, refSelect, value, disabled, onChange, children }) => {

    return (
        <select
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
    title: PropTypes.string,
    className: PropTypes.string,
    refSelect: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    children: PropTypes.node,
};

export default Select;