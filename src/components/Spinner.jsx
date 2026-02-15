import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

const SpinnerTable = ({ colSpan, message }) => {
  return (
    <tr>
      <td className="text-center" colSpan={colSpan}>
        <div
          className={`flex flex-col justify-center items-center h-full`}
        >
          <div>
            <div className="spinner-grow text-danger" role="status" />
            <div className="spinner-grow text-warning" role="status" />
            <div className="spinner-grow text-info" role="status" />
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
      className={cn(
        loading ? "block" : "hidden",
        "absolute inset-0 bg-white z-20"
      )}
    >
      <div className="flex flex-col justify-center items-center h-full">
        <div>
          <div className="spinner-grow text-danger" role="status" />
          <div className="spinner-grow text-warning" role="status" />
          <div className="spinner-grow text-info" role="status" />
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
      className={cn(
          loading ? 'block' : 'hidden',
          isAbsolute ? 'absolute-all' : ''
      )}
    >
      <div className="flex flex-col justify-center items-center h-full">
        <div>
          <div className="spinner-grow text-danger" role="status" />
          <div className="spinner-grow text-warning" role="status" />
          <div className="spinner-grow text-info" role="status" />
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
  colSpan: PropTypes.number.isRequired,
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
