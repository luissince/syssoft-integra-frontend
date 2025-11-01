import Modal from 'react-modal';
import PropTypes from 'prop-types';
import '../resource/css/customModal.css';
import {
  keyNumberFloat,
  keyNumberInteger,
  keyNumberPhone,
} from '../helper/utils.helper';
import React, { Component } from 'react';
import Button from './Button';

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

Modal.setAppElement('#root');

/**
 * Clase principal encarga de mostrar el modal y su partes.
 */
class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      offsetX: 0,
      offsetY: 0,
    };

    this.modalRef = React.createRef();
  }

  handleMouseDown = (event) => {
    this.setState({
      dragging: true,
      offsetX: event.clientX - this.modalRef.current.offsetLeft,
      offsetY: event.clientY - this.modalRef.current.offsetTop,
    });
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  handleMouseMove = (event) => {
    if (this.state.dragging) {
      const left = event.clientX - this.state.offsetX;
      const top = event.clientY - this.state.offsetY;
      this.modalRef.current.style.left = `${left}px`;
      this.modalRef.current.style.top = `${top}px`;
    }
  };

  handleMouseUp = () => {
    this.setState({ dragging: false });
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  handleOnClose = async () => {
    await new Promise((resolve) => {
      const data = this.modalRef.current;
      data.classList.add('close-cm');
      data.addEventListener('animationend', () => {
        resolve();
      });
    });
    this.props.onClose();
  };

  render() {
    const {
      isOpen,
      onOpen,
      onHidden,
      contentLabel,
      className,
      shouldCloseOnOverlayClick = false,
      shouldCloseOnEsc,
      children,
    } = this.props;
    return (
      <Modal
        contentRef={(ref) => (this.modalRef.current = ref)}
        isOpen={isOpen}
        onAfterOpen={onOpen}
        onRequestClose={async () => await this.handleOnClose()}
        onAfterClose={onHidden}
        style={customStyles}
        className={`modal-custom ${className}`}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        shouldReturnFocusAfterClose={true}
        shouldCloseOnEsc={shouldCloseOnEsc}
        contentLabel={contentLabel}
      >
        {children}
      </Modal>
    );
  }
}

CustomModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  onHidden: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  contentLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
  shouldCloseOnOverlayClick: PropTypes.bool,
  shouldCloseOnEsc: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
};

export const CustomModalForm = ({
  contentRef,
  isOpen,
  onOpen,
  onHidden,
  onClose,
  contentLabel,
  titleHeader,
  showClose = true,
  className,
  isCloseOnEsc,
  body,
  footer,
  classNameFooter,
  onSubmit,
}) => {
  return (
    <CustomModal
      ref={contentRef}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel={contentLabel}
      className={className}
      shouldCloseOnEsc={isCloseOnEsc}
    >
      <form
        className="!flex flex-col h-full"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        onKeyDown={(event) => {
          if (event.target.role === 'float') {
            keyNumberFloat(event, () => {
              onSubmit();
            });
          }

          if (event.target.role === 'integer') {
            keyNumberInteger(event, () => {
              onSubmit();
            });
          }

          if (event.target.role === 'phone') {
            keyNumberPhone(event, () => {
              onSubmit();
            });
          }
        }}
      >
        <div
          className={`header-cm ${!showClose ? 'py-3' : ''}`}
          onMouseDown={(event) => contentRef.current.handleMouseDown(event)}
        >
          <p className="h6">{titleHeader}</p>
          {showClose && (
            <Button
              contentClassName="close"
              onClick={async () => await contentRef.current.handleOnClose()}
            >
              <span>×</span>
            </Button>
          )}
        </div>
        <div className="body-cm">{body}</div>
        {footer && (
          <div className={`${classNameFooter ? classNameFooter : 'footer-cm'}`}>
            {footer}
          </div>
        )}
      </form>
    </CustomModal>
  );
};

CustomModalForm.propTypes = {
  contentRef: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  onHidden: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  contentLabel: PropTypes.string.isRequired,
  titleHeader: PropTypes.string.isRequired,
  showClose: PropTypes.bool,
  onSubmit: PropTypes.func,
  className: PropTypes.string,
  isCloseOnEsc: PropTypes.bool,
  body: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  footer: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  classNameFooter: PropTypes.string,
};

export const CustomModalContentForm = (props) => {
  const { className = '', onSubmit, children } = props;

  return (
    <form
      className={`!flex flex-col h-full ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      onKeyDown={(event) => {
        if (event.target.role === 'float') {
          keyNumberFloat(event, () => {
            onSubmit();
          });
        }

        if (event.target.role === 'integer') {
          keyNumberInteger(event, () => {
            onSubmit();
          });
        }

        if (event.target.role === 'phone') {
          keyNumberPhone(event, () => {
            onSubmit();
          });
        }
      }}
    >
      {children}
    </form>
  );
};

CustomModalContentForm.propTypes = {
  className: PropTypes.string,
  onSubmit: PropTypes.func,
  children: PropTypes.node,
};

export const CustomModalContentScroll = (props) => {
  const { className = '', children } = props;

  return (
    <div className={`flex flex-col h-full ${className}`}>{children}</div>
  );
};

CustomModalContentScroll.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Ubicación: Parte supeior del modal.
 * Cotenido: Normalmente incluye el título en el lado izquierdo y un bitón de cerrar (iconode "X") en el lado derecho.
 * @param {*} props
 * @returns
 */
export const CustomModalContentHeader = (props) => {
  const {
    showClose = true,
    isMoveable = true,
    className = '',
    contentRef,
    children,
  } = props;
  return (
    <div
      className={`header-cm ${className} ${!showClose ? 'py-3' : ''} ${
        isMoveable ? 'cursor-move' : 'cursor-default'
      }`}
      onMouseDown={(event) =>
        isMoveable && contentRef.current.handleMouseDown(event)
      }
    >
      <p className="m-0 h6">{children}</p>
      {showClose && (
        <Button
          contentClassName="close"
          onClick={async () => await contentRef.current.handleOnClose()}
        >
          <span>×</span>
        </Button>
      )}
    </div>
  );
};

CustomModalContentHeader.propTypes = {
  contentRef: PropTypes.object.isRequired,
  className: PropTypes.string,
  showClose: PropTypes.bool,
  isMoveable: PropTypes.bool,
  children: PropTypes.node,
};

/**
 * Ubicación: Debajo del header principal, si es necesario.
 * Contenido: Aquí puedes poner filtros, campos de búsqueda, o campos de opciones como inputs o selectores.
 * @param {*} props
 * @returns
 */
export const CustomModalContentSubHeader = (props) => {
  const { className = '', children } = props;
  return <div className={`sub-header-cm ${className}`}>{children}</div>;
};

CustomModalContentSubHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Ubicación: Parte central o principal del modal.
 * Contenido: Generalmente contiene el formulario, una tabla, o el contenido principal que el modal necesita mostrar.
 * @param {*} props
 * @returns
 */
export const CustomModalContentBody = (props) => {
  const { className = '', children } = props;

  return <div className={`body-cm ${className}`}>{children}</div>;
};

CustomModalContentBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export const CustomModalContentOverflow = (props) => {
  const { className = '', children } = props;

  return (
    <div className={`flex w-full h-full ${className}`}>
      <div className="flex flex-col" style={{ flex: '1 1 0%' }}>
        <div className="h-full overflow-auto">
          <div className="h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

CustomModalContentOverflow.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Ubicación: Parte inferior del modal.
 * Contenido: Botones de acción, como "Aceptar", "Cancelar", "Guardar", o cualquier otra acción relevante.
 * @param {*} props
 * @returns
 */
export const CustomModalContentFooter = (props) => {
  const { className = '', children } = props;

  return (
    <div className={`${className ? className : 'footer-cm'}`}>{children}</div>
  );
};

CustomModalContentFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default CustomModal;
