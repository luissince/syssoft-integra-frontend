import PropTypes from 'prop-types';

const Column = ({ className, refChildren, children }) => {

    return (
        <div ref={refChildren} className={className ? className : "col"}>
            {children}
        </div>
    );
}

Column.propTypes = {
    className: PropTypes.string,
    refChildren: PropTypes.object,
    children: PropTypes.node,
};

export default Column;