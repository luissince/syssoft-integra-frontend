import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../resource/css/download.css';
import { formatBytes } from '../helper/utils.helper';
import { removeDownload } from '../redux/downloadSlice';

class FileDownloader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isCollapsed: false
    };

    this.refDownload = React.createRef();
    this.refContent = React.createRef();
  }

  componentDidUpdate(prevProps) {
    // Extraer las propiedades relevantes
    const { download: currentDownload } = this.props;
    const currentDownloads = currentDownload.downloads || [];

    const { download: previousDownload } = prevProps;
    const previousDownloads = previousDownload.downloads || [];

    // Si hay nuevos datos y antes no había, muestra el componente
    if (previousDownloads.length === 0 && currentDownloads.length > 0) {
      this.showDownloader();
    }
  }

  showDownloader = () => {
    this.setState({ visible: true });
    const d = this.refDownload.current;
    if (d) {
      d.style.display = 'block';
      d.classList.remove('hidden');
    }
  }

  hideDownloader = () => {
    // Extraer las propiedades relevantes
    const { download: currentDownload } = this.props;
    const currentDownloads = currentDownload.downloads || [];

    // Verificar si todos los elementos tienen el estado 'success'
    const allDownloadsSuccessful = currentDownloads.every(item => item.status === 'success' || item.status === 'error');

    if (allDownloadsSuccessful) {
      // Obtener la referencia al elemento DOM
      const downloadElement = this.refDownload.current;

      if (downloadElement) {
        // Añadir la clase 'hidden' para iniciar la animación de ocultar
        downloadElement.classList.add('hidden');

        // Escuchar el evento 'animationend' para realizar acciones al finalizar la animación
        downloadElement.addEventListener('animationend', () => {
          // Ocultar el elemento y actualizar el estado
          downloadElement.style.display = 'none';
          this.setState({ visible: false, isCollapsed: false });

          // Eliminar los elementos con estado 'success'
          for (const item of currentDownloads) {
            if (item.status === 'success' || item.status === 'error') {
              this.props.removeDownload({ id: item.id });
            }
          }
        });
      }
    }
  }

  handleCollapse = () => {
    const content = this.refContent.current;
    if (!content) return;

    this.setState(prevState => {
      const newIsCollapsed = !prevState.isCollapsed;

      if (newIsCollapsed) {
        content.style.height = content.scrollHeight + 'px';
        // Forzar un reflow
        content.offsetHeight;
        content.style.height = '0';
      } else {
        content.style.height = content.scrollHeight + 'px';
      }
      return { isCollapsed: newIsCollapsed };
    });
  }

  handleClose = () => {
    this.hideDownloader();
  }

  render() {
    const { download } = this.props;
    const downloads = download.downloads || [];

    if (!this.state.visible) return null;

    // Ordenar las descargas por timestamp (más recientes primero)
    const sortedDownloads = [...downloads].sort((a, b) => {
      // Si no tienes timestamp, puedes usar el ID asumiendo que es secuencial
      return b.timestamp - a.timestamp; // o `b.id - a.id` si usas IDs
    });

    return (
      <div
        ref={this.refDownload}
        className={`downloader ${downloads.length === 0 ? 'hidden' : ''}`}>
        <div className="card">
          <div className="card-header">
            <span className='text-base text-white'>Descargando archivo</span>
            <div className='options'>
              <button onClick={this.handleCollapse}>
                <i className={this.state.isCollapsed ? 'fa fa-angle-up' : 'fa fa-angle-down'}></i>
              </button>
              <button onClick={this.handleClose}>x</button>
            </div>
          </div>
          <div
            ref={this.refContent}
            className="collapse-content">
            <ul className={`list-group list-group-flush`}>
              {
                sortedDownloads.map((item, index) => {
                  return (
                    <li className="list-group-item" key={item.id || index}>  
                      <div className="row">
                        <div className="col-12 d-flex">
                          <div className="d-inline font-weight-bold text-truncate">
                            {item.fileName}
                          </div>
                          <div className="d-inline ml-2">
                            <small>
                              {item.received > 0 && (
                                <>
                                  <span className="text-success">
                                    {formatBytes(item.received)}
                                  </span>
                                  / {formatBytes(item.total)}
                                </>
                              )}

                              {item.received === 0 && <>Iniciando...</>}
                            </small>
                          </div>
                          <div className="d-inline ml-2 ml-auto">
                            {item.status === "success" && (
                              <span className="text-success">
                                Completado <i className="fa fa-check-circle-o"></i>
                              </span>
                            )}
                            {item.status === "error" && (
                              <span className="text-danger">
                                Error <i className="fa fa-times-circle-o"></i>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-12 mt-2">
                          {
                            item.status === "success" && (
                              <div className="progress">
                                <div
                                  className="progress-bar progress-bar-striped"
                                  role="progressbar"
                                  aria-valuenow="75"
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                  style={{ width: `${item.progress}%` }}
                                >{`${item.progress}%`}</div>
                              </div>
                            )                            
                          }
                          {
                            item.status === "error" && (
                                <span className="text-danger">
                                  {item.error}
                                </span>
                            )
                          }
                        </div>
                      </div>
                    </li>
                  );
                })
              }
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
  removeDownload: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    download: state.download,
  };
};

const mapDispatchToProps = { removeDownload };

const ConnectedFileDownloader = connect(mapStateToProps, mapDispatchToProps)(FileDownloader);

export default ConnectedFileDownloader;
