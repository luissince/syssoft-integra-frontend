import React from 'react';
import '../resource/css/download.css';
import PropTypes from 'prop-types';
import Axios from 'axios';
import toast from 'react-hot-toast';
import ErrorResponse from '../model/class/error-response';

const Downloader = ({ files = [], remove }) => {
  return (
    <div className="downloader">
      <div className="card">
        <div className="card-header">Descargando archivo</div>
        <ul className="list-group list-group-flush">
          {files.map((file, idx) => (
            <DownloadItem
              key={idx}
              removeFile={() => remove(file.downloadId)}
              file={file}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

Downloader.propTypes = {
  files: PropTypes.array,
  remove: PropTypes.func
};

class DownloadItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      completed: false,
      total: 0,
      loaded: 0,
    };
  }

  componentDidMount() {
    const options = {
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;

        this.setState({
          progress: Math.floor((loaded * 100) / total),
          loaded,
          total,
          completed: false,
        });
      },
    };

    Axios.get(this.props.file.url, { ...options, })
      .then(async (response) => {
        const result = response.data;

        // const url = window.URL.createObjectURL(
        //   // new Blob([result.data], { type: 'text/xml' }),
        //   new Blob([result.data], { type: 'application/octet-stream' }),
        // );

        const byteArray = result.buffer.data;
        const uint8Array = new Uint8Array(byteArray);
        const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;

        if (this.props.file.filename == undefined) {
          link.setAttribute('download', result.name);
        } else {
          link.setAttribute('download', this.props.file.filename);
        }

        document.body.appendChild(link);
        link.click();

        this.setState({ ...this.state, completed: true, }, () => {
          this.props.removeFile();
        });
      })
      .catch((error) => {
        let errorResponse = new ErrorResponse(error);

        toast.custom((t) => (
          <>
            <div className="alert alert-warning" role="alert">
              <button type="button" className="close"
                onClick={() => toast.remove(t.id)}>
                <span aria-hidden="true">&times;</span>
              </button>

              <h5 className="alert-heading">Se generó un problema!</h5>
              <p>{errorResponse.getMessage()}</p>
            </div>
          </>
        ))
        this.props.removeFile();
      });
  }

  formatBytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  render() {
    return (
      <li className="list-group-item">
        <div className="row">
          <div className="col-12 d-flex">
            <div className="d-inline font-weight-bold text-truncate">
              {this.props.file.name}
            </div>
            <div className="d-inline ml-2">
              <small>
                {this.state.loaded > 0 && (
                  <>
                    <span className="text-success">
                      {this.formatBytes(this.state.loaded)}
                    </span>
                    / {this.formatBytes(this.state.total)}
                  </>
                )}

                {this.state.loaded === 0 && <>Iniciando...</>}
              </small>
            </div>
            <div className="d-inline ml-2 ml-auto">
              {this.state.completed && (
                <span className="text-success">
                  Completado <i icon="fa fa-check-circle"></i>
                </span>
              )}
            </div>
          </div>
          <div className="col-12 mt-2">
            <div className="progress">
              <div
                className="progress-bar progress-bar-striped"
                role="progressbar"
                aria-valuenow="75"
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: `${this.state.progress}%` }}
              >{`${this.state.progress}%`}</div>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

DownloadItem.propTypes = {
  file: PropTypes.object,
  removeFile: PropTypes.func
};

export default Downloader;
