import PropTypes from 'prop-types';

const Column = ({ className, children }) => {

    return (
        <div className={className ? className : "col"}>
            {children}
        </div>
    );
}

Column.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

export default Column;