import PropTypes from 'prop-types';

const Table = ({ refTable, className, title, onClick, onDoubleClick, formGroup, tHead, tBody }) => {
    if (formGroup) {
        return (
            <div className='form-group'>
                {title !== undefined && <p className="lead">{title}</p>}
                <table ref={refTable} onClick={onClick} onDoubleClick={onDoubleClick} className={className ? className : "w-100"}>
                    <thead>{tHead}</thead>
                    <tbody>{tBody}</tbody>
                </table>
            </div>

        );
    }

    return (
        <>
            {title !== undefined && <p className="lead">{title}</p>}
            <table ref={refTable} onClick={onClick} onDoubleClick={onDoubleClick} className={className ? className : "w-100"}>
                <thead>{tHead}</thead>
                <tbody>{tBody}</tbody>
            </table>
        </>

    );
}

Table.propTypes = {
    refTable: PropTypes.object,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    className: PropTypes.string,
    title: PropTypes.string,
    formGroup: PropTypes.bool,
    tHead: PropTypes.node,
    tBody: PropTypes.node
};

const TableResponsive = ({ refTable, className, title, formGroup, tHead, tBody, onKeyDown, onClick, onDoubleClick }) => {
    if (formGroup) {
        return (
            <div className='form-group'>
                {title !== undefined && <p className="lead">{title}</p>}
                <div className="table-responsive">
                    <table ref={refTable} onKeyDown={onKeyDown} onClick={onClick} onDoubleClick={onDoubleClick} className={className ? className : "table table-striped table-bordered rounded"}>
                        <thead>{tHead}</thead>
                        <tbody>{tBody}</tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <>
            {title !== undefined && <p className="lead">{title}</p>}
            <div className="table-responsive">
                <table ref={refTable} onKeyDown={onKeyDown} onClick={onClick} onDoubleClick={onDoubleClick} className={className ? className : "table table-striped table-bordered rounded"}>
                    <thead>{tHead}</thead>
                    <tbody>{tBody}</tbody>
                </table>
            </div>
        </>

    );
}

TableResponsive.propTypes = {
    refTable: PropTypes.object,
    className: PropTypes.string,
    title: PropTypes.string,
    formGroup: PropTypes.bool,
    tHead: PropTypes.element,
    tBody: PropTypes.node,
    onKeyDown: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func
};

export {
    Table,
    TableResponsive
}