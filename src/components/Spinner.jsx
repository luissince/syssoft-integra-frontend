import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const SpinnerLoading = (message = 'Cargando datos...', table = false) => {
  if (!table) {
    return (
      <div className="clearfix absolute inset-0 bg-white">
        <div className="flex flex-col justify-center items-center h-full">
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

  return (
    <div className="flex flex-col justify-center items-center h-full">
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

const SpinnerTable = ({ colSpan, message }) => {
  return (
    <tr>
      <td className="text-center" colSpan={colSpan}>
        <div
          className="flex flex-col justify-center items-center h-full"
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
      className={cn(
        loading ? 'block' : 'hidden',
        'absolute inset-0 bg-white z-10'
      )}
    >
      <div className="flex flex-col justify-center items-center h-full">
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
      className={cn(
        'clearfix',
        loading ? 'block' : 'hidden',
        isAbsolute && 'absolute inset-0 z-[99]'
      )}
    >
      <div className="flex flex-col justify-center items-center h-full">
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

export { Spinner, SpinnerLoading, SpinnerTable, SpinnerView, SpinnerTransparent };
