import PropTypes from 'prop-types';

const Table = ({ className, title, formGroup, tHead, tBody }) => {
    if (formGroup) {
        return (
            <div className='form-group'>
                {title !== undefined && <p className="lead">{title}</p>}
                <table className={className ? className : "w-100"}>
                    <thead>{tHead}</thead>
                    <tbody>{tBody}</tbody>
                </table>
            </div>

        );
    }

    return (
        <>
            {title !== undefined && <p className="lead">{title}</p>}
            <table className={className ? className : "w-100"}>
                <thead>{tHead}</thead>
                <tbody>{tBody}</tbody>
            </table>
        </>

    );
}

Table.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    formGroup: PropTypes.bool,
    tHead: PropTypes.node,
    tBody: PropTypes.node
};

const TableResponsive = ({ className, title, formGroup, tHead, tBody }) => {
    if (formGroup) {
        return (
            <div className='form-group'>
                {title !== undefined && <p className="lead">{title}</p>}
                <div className="table-responsive">
                    <table className={className ? className : "table table-striped table-bordered rounded"}>
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
                <table className={className ? className : "table table-striped table-bordered rounded"}>
                    <thead>{tHead}</thead>
                    <tbody>{tBody}</tbody>
                </table>
            </div>
        </>

    );
}

TableResponsive.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    formGroup: PropTypes.bool,
    tHead: PropTypes.node,
    tBody: PropTypes.node
};

export {
    Table,
    TableResponsive
}