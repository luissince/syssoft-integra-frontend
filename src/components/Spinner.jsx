import PropTypes from 'prop-types';

const SpinnerTable = ({ message }) => {
    return (
        <div className={`d-flex flex-column justify-content-center align-items-center h-100 `}>
            <div>
                <div className="spinner-grow text-danger" role="status"></div>
                <div className="spinner-grow text-warning" role="status"></div>
                <div className="spinner-grow text-info" role="status"></div>
            </div>
            <div>
                <strong>{message}</strong>
            </div>
        </div>
    );
}

const SpinnerView = ({ loading, message }) => {
    return (
        <div className={`${loading ? 'd-block ' : 'd-none'} clearfix absolute-all bg-white`}>
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <div>
                    <div className="spinner-grow text-danger" role="status"></div>
                    <div className="spinner-grow text-warning" role="status"></div>
                    <div className="spinner-grow text-info" role="status"></div>
                </div>
                <div>
                    <strong>{message}</strong>
                </div>
            </div>
        </div>
    );
}

SpinnerTable.propTypes = {
    message: PropTypes.string.isRequired,
};

SpinnerView.propTypes = {
    loading: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
};

export {
    SpinnerTable,
    SpinnerView
}