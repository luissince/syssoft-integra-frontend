import PropTypes from 'prop-types';

const SpinnerTable = ({ colSpan, message }) => {
  return (
    <tr>
      <td className="text-center" colSpan={colSpan}>
        <div
          className={`d-flex flex-column justify-content-center align-items-center h-100 `}
        >
          <div>
            <div className="spinner-grow text-danger" role="status"></div>
            <div className="spinner-grow text-warning" role="status"></div>
            <div className="spinner-grow text-info" role="status"></div>
          </div>
          <div>
            <strong>{message}</strong>
          </div>
        </div>
      </td>
    </tr>
  );
};

const SpinnerView = ({ loading, message, children }) => {
  return (
    <div
      className={`${
        loading ? 'd-block ' : 'd-none'
      } clearfix absolute-all bg-white`}
    >
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div>
          <div className="spinner-grow text-danger" role="status"></div>
          <div className="spinner-grow text-warning" role="status"></div>
          <div className="spinner-grow text-info" role="status"></div>
        </div>
        <div>
          <strong>{message}</strong>
        </div>
        {children}
      </div>
    </div>
  );
};

const SpinnerTransparent = ({
  loading,
  message,
  isAbsolute = false,
  children,
}) => {
  return (
    <div
      className={`${loading ? 'd-block ' : 'd-none'} clearfix ${
        isAbsolute ? 'absolute-all' : ''
      }`}
    >
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div>
          <div className="spinner-grow text-danger" role="status"></div>
          <div className="spinner-grow text-warning" role="status"></div>
          <div className="spinner-grow text-info" role="status"></div>
        </div>
        <div>
          <strong>{message}</strong>
        </div>
        {children}
      </div>
    </div>
  );
};

SpinnerTable.propTypes = {
  colSpan: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

SpinnerView.propTypes = {
  loading: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SpinnerTransparent.propTypes = {
  loading: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  isAbsolute: PropTypes.bool,
  children: PropTypes.node,
};

export { SpinnerTable, SpinnerView, SpinnerTransparent };
