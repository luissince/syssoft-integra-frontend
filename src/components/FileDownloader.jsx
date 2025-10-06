import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../resource/css/download.css';
import { formatBytes } from '../helper/utils.helper';
import { removeDownload } from '../redux/downloadSlice';
import { removeJob } from '@/redux/printerSlice';

class FileDownloader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isCollapsed: false,
    };

    this.refDownload = React.createRef();
    this.refContent = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { download: currentDownload, printer: currentPrinter } = this.props;
    const currentDownloads = currentDownload.downloads || [];
    const currentJobs = currentPrinter.jobs || [];

    const { download: previousDownload, printer: previousPrinter } = prevProps;
    const previousDownloads = previousDownload.downloads || [];
    const previousJobs = previousPrinter.jobs || [];

    // Detectar nuevos downloads o jobs
    const newDownloads = currentDownloads.filter(
      (d) => !previousDownloads.some((p) => p.id === d.id),
    );
    const newJobs = currentJobs.filter(
      (j) => !previousJobs.some((p) => p.id === j.id),
    );

    // Si hay nuevos, mostrar el downloader
    if (newDownloads.length > 0 || newJobs.length > 0) {
      this.showDownloader();
    }
  }

  showDownloader = () => {
    const d = this.refDownload.current;
    if (d) {
      d.style.display = 'block';
      d.classList.remove('hidden');
    }
    if (!this.state.visible) {
      this.setState({ visible: true, isCollapsed: false });
    }
  };

  hideDownloader = () => {
    const { download: currentDownload, printer: currentPrinter } = this.props;
    const currentDownloads = currentDownload.downloads || [];
    const currentJobs = currentPrinter.jobs || [];

    // Verificar si todos los procesos terminaron
    const allDownloadsFinished =
      currentDownloads.length === 0 ||
      currentDownloads.every(
        (item) => item.status === 'success' || item.status === 'error',
      );
    const allJobsFinished =
      currentJobs.length === 0 ||
      currentJobs.every(
        (job) => job.status === 'success' || job.status === 'error',
      );

    const downloadElement = this.refDownload.current;
    if (!downloadElement) return;

    // Si ya no hay procesos activos
    if (allDownloadsFinished && allJobsFinished) {
      const handleAnimationEnd = () => {
        downloadElement.removeEventListener('animationend', handleAnimationEnd);
        downloadElement.style.display = 'none';
        this.setState({ visible: false, isCollapsed: false });

        // Limpiar descargas y trabajos terminados
        for (const item of currentDownloads) {
          if (item.status === 'success' || item.status === 'error') {
            this.props.removeDownload({ id: item.id });
          }
        }
        for (const job of currentJobs) {
          if (job.status === 'success' || job.status === 'error') {
            this.props.removeJob({ id: job.id });
          }
        }
      };

      downloadElement.classList.add('hidden');
      downloadElement.addEventListener('animationend', handleAnimationEnd);
    } else {
      // Si el usuario cierra manualmente (aunque haya activos)
      this.setState({ visible: false, isCollapsed: false });
      if (downloadElement) {
        downloadElement.classList.add('hidden');
        downloadElement.style.display = 'none';
      }
    }
  };

  handleCollapse = () => {
    const content = this.refContent.current;
    if (!content) return;

    this.setState((prevState) => {
      const newIsCollapsed = !prevState.isCollapsed;

      if (newIsCollapsed) {
        content.style.height = content.scrollHeight + 'px';
        content.offsetHeight; // forzar reflow
        content.style.height = '0';
      } else {
        content.style.height = content.scrollHeight + 'px';
        content.addEventListener(
          'transitionend',
          () => (content.style.height = 'auto'),
          { once: true },
        );
      }
      return { isCollapsed: newIsCollapsed };
    });
  };

  handleClose = () => {
    this.hideDownloader();
  };

  render() {
    const { download, printer } = this.props;
    const downloads = download.downloads || [];
    const jobs = printer.jobs || [];

    if (!this.state.visible) return null;

    const sortedDownloads = [...downloads].sort((a, b) => b.timestamp - a.timestamp);
    const sortedJobs = [...jobs].sort((a, b) => b.timestamp - a.timestamp);

    return (
      <div
        ref={this.refDownload}
        className={`downloader bottom-[60px] md:bottom-0 ${
          downloads.length === 0 && jobs.length === 0 ? 'hidden' : ''
        }`}
      >
        <div className="card">
          <div className="card-header">
            <span className="text-base text-white">
              Procesos en segundo plano
            </span>
            <div className="options">
              <button onClick={this.handleCollapse}>
                <i
                  className={
                    this.state.isCollapsed
                      ? 'fa fa-angle-up'
                      : 'fa fa-angle-down'
                  }
                ></i>
              </button>
              <button onClick={this.handleClose}>x</button>
            </div>
          </div>

          <div ref={this.refContent} className="collapse-content">
            <ul className="list-group list-group-flush">
              {/* DESCARGAS */}
              {sortedDownloads.map((item, index) => (
                <li className="list-group-item" key={item.id || index}>
                  <div className="row">
                    <div className="col-12 d-flex">
                      <div className="d-inline font-weight-bold text-truncate">
                        {item.fileName}
                      </div>
                      <div className="d-inline ml-2">
                        <small>
                          {item.received > 0 ? (
                            <>
                              <span className="text-success">
                                {formatBytes(item.received)}
                              </span>
                              / {formatBytes(item.total)}
                            </>
                          ) : (
                            <>Iniciando...</>
                          )}
                        </small>
                      </div>
                      <div className="d-inline ml-2">
                        {item.status === 'success' && (
                          <span className="text-success">
                            Completado <i className="fa fa-check-circle-o"></i>
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-danger">
                            Error <i className="fa fa-times-circle-o"></i>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-12 mt-2">
                      {item.status === 'downloading' && (
                        <div className="progress">
                          <div
                            className="progress-bar progress-bar-striped"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{ width: `${item.progress}%` }}
                          >
                            {`${item.progress}%`}
                          </div>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <span className="text-danger">{item.error}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}

              {/* IMPRESIONES */}
              {sortedJobs.map((job) => (
                <li className="list-group-item" key={`job-${job.id}`}>
                  <div className="row">
                    <div className="col-12 d-flex">
                      <div className="d-inline font-weight-bold text-truncate">
                        {job.message}
                      </div>
                      <div className="d-inline ml-2">
                        {job.status === 'queued' && (
                          <span className="text-muted">En cola...</span>
                        )}
                        {job.status === 'printing' && (
                          <span className="text-info">Imprimiendo...</span>
                        )}
                        {job.status === 'success' && (
                          <span className="text-success">
                            Listo <i className="fa fa-check-circle-o"></i>
                          </span>
                        )}
                        {job.status === 'error' && (
                          <span className="text-danger">
                            Error <i className="fa fa-times-circle-o"></i>
                          </span>
                        )}
                      </div>
                    </div>
                    {job.status === 'error' && (
                      <div className="col-12 mt-2">
                        <span className="text-danger">{job.error}</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

FileDownloader.propTypes = {
  download: PropTypes.shape({
    downloads: PropTypes.array,
  }),
  printer: PropTypes.shape({
    jobs: PropTypes.array,
  }),
  removeDownload: PropTypes.func,
  removeJob: PropTypes.func,
};

const mapStateToProps = (state) => ({
  download: state.download,
  printer: state.printer,
});

const mapDispatchToProps = { removeDownload, removeJob };

const ConnectedFileDownloader = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FileDownloader);

export default ConnectedFileDownloader;
