import PropTypes from 'prop-types';

const Select = ({ className, refSelect, value, onChange, children }) => {

    return (
        <select
            className={className ? className : "form-control"}
            ref={refSelect}
            value={value}
            onChange={onChange}>
            {children}
        </select>
    );
}

Select.propTypes = {
    className: PropTypes.string,
    refSelect: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    children: PropTypes.node,
};

export default Select;