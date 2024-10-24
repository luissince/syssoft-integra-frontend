import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Table = forwardRef((props, ref) => {
    const { children, className = '', classNameContent, ...rest } = props;

    if (classNameContent) {
        return (
            <table ref={ref} {...rest} className={classNameContent}>
                {children}
            </table>
        );
    }

    return (
        <table ref={ref} {...rest} className={`table ${className}`}>
            {children}
        </table>
    );
});

Table.displayName = 'Table';

Table.propTypes = {
    className: PropTypes.string,
    classNameContent: PropTypes.string,
    children: PropTypes.node,
};

const TableResponsive = forwardRef((props, ref) => {
    const { children, className = '', ...rest } = props;

    return (
        <div ref={ref} {...rest} className={`table-responsive ${className}`}>
            {children}
        </div>
    );
});

TableResponsive.displayName = 'TableResponsive';

TableResponsive.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

const TableTitle = ({ children }) => {
    return (
        <p className="lead">{children}</p>
    );
}

TableTitle.propTypes = {
    children: PropTypes.node,
};

const TableHeader = forwardRef((props, ref) => {
    const { children, ...rest } = props;

    return (
        <thead ref={ref} {...rest}>
            {children}
        </thead>
    );
});

TableHeader.displayName = 'TableHeader';

TableHeader.propTypes = {
    children: PropTypes.node,
};

const TableBody = forwardRef((props, ref) => {
    const { children, ...rest } = props;

    return (
        <tbody ref={ref} {...rest}>
            {children}
        </tbody>
    );
});

TableBody.displayName = 'TableBody';

TableBody.propTypes = {
    children: PropTypes.node,
};

const TableRow = forwardRef((props, ref) => {
    const { children, ...rest } = props;

    return (
        <tr ref={ref} {...rest}>
            {children}
        </tr>
    );
});

TableRow.displayName = 'TableRow';

TableRow.propTypes = {
    children: PropTypes.node,
};

const TableHead = (props) => {
    const { children, ...rest } = props;

    return (
        <th {...rest}>
            {children}
        </th>
    );
}

TableHead.propTypes = {
    children: PropTypes.node,
};

const TableCell = (props) => {
    const { children, ...rest } = props;

    return (
        <td {...rest}>
            {children}
        </td>
    );
}

TableCell.propTypes = {
    children: PropTypes.node,
};

export {
    Table,
    TableResponsive,
    TableHeader,
    TableTitle,
    TableBody,
    TableRow,
    TableHead,
    TableCell
}