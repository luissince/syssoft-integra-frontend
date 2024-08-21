import Modal from 'react-modal';
import PropTypes from 'prop-types';
import '../recursos/css/customModal.css'
import { keyNumberFloat, keyNumberInteger, keyNumberPhone } from '../helper/utils.helper';
import React, { Component } from 'react';

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
  }
};

Modal.setAppElement('#root');

class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      offsetX: 0,
      offsetY: 0
    }

    this.modalRef = React.createRef();
  }

  handleMouseDown = (event) => {
    this.setState({
      dragging: true,
      offsetX: event.clientX - this.modalRef.current.offsetLeft,
      offsetY: event.clientY - this.modalRef.current.offsetTop
    });
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (event) => {
    if (this.state.dragging) {
      const left = event.clientX - this.state.offsetX;
      const top = event.clientY - this.state.offsetY;
      this.modalRef.current.style.left = `${left}px`;
      this.modalRef.current.style.top = `${top}px`;
    }
  }

  handleMouseUp = () => {
    this.setState({ dragging: false });
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleOnClose = async () => {
    await new Promise((resolve) => {
      const data = this.modalRef.current;
      data.classList.add("close-cm");
      data.addEventListener('animationend', () => {
        resolve();
      });
    })
    this.props.onClose();
  };

  render() {
    const { isOpen, onOpen, onHidden, contentLabel, className, children } = this.props;
    return (
      <Modal
        contentRef={(ref) => this.modalRef.current = ref}
        isOpen={isOpen}
        onAfterOpen={onOpen}
        onRequestClose={async () => await this.handleOnClose()}
        onAfterClose={onHidden}
        style={customStyles}
        className={`modal-custom ${className}`}
        shouldCloseOnOverlayClick={false}
        shouldReturnFocusAfterClose={true}
        shouldCloseOnEsc={true}
        contentLabel={contentLabel}
      >
        {children}
      </Modal>
    );
  }
}

export const CustomModalContent = ({
  contentRef,
  isOpen,
  onOpen,
  onHidden,
  onClose,
  contentLabel,
  titleHeader,
  className,
  body,
  classNameBody,
  footer,
  classNameFooter
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
    >
      <div className='d-flex flex-column h-100'>
        <div className="header-cm" onMouseDown={(event) => contentRef.current.handleMouseDown(event)}>
          <p className='m-0 h6'>{titleHeader}</p>
          <button
            type="button"
            className='close'
            onClick={async () => await contentRef.current.handleOnClose()}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={`body-cm ${classNameBody}`}>
          <div className='d-flex w-100 h-100'>
            <div className='d-flex flex-column' style={{ flex: "1 1 0%" }}>
              <div className='h-100 overflow-auto'>
                <div className='h-100'>
                  {body}
                </div>
              </div>
            </div>
          </div>
        </div>
        {
          footer && (
            <div className={`${classNameFooter ? classNameFooter : "footer-cm"}`}>
              {footer}
            </div>
          )
        }
      </div>
    </CustomModal>
  );
}

export const CustomModalForm = ({
  contentRef,
  isOpen,
  onOpen,
  onHidden,
  onClose,
  contentLabel,
  titleHeader,
  className,
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
    >
      <form
        className='d-flex flex-column h-100'
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
        <div className="header-cm" onMouseDown={(event) => contentRef.current.handleMouseDown(event)}>
          <p className='m-0 h6'>{titleHeader}</p>
          <button
            type="button"
            className='close'
            onClick={async () => await contentRef.current.handleOnClose()}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="body-cm">
          {body}
        </div>
        {
          footer && (
            <div className={`${classNameFooter ? classNameFooter : "footer-cm"}`}>
              {footer}
            </div>
          )
        }
      </form>
    </CustomModal>
  );
}

CustomModal.propTypes = {
  contentRef: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  onHidden: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  contentLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired
}

CustomModalContent.propTypes = {
  contentRef: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  onHidden: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  contentLabel: PropTypes.string.isRequired,
  titleHeader: PropTypes.string.isRequired,
  className: PropTypes.string,
  body: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
  classNameBody: PropTypes.string,
  footer: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  classNameFooter: PropTypes.string
}

CustomModalForm.propTypes = {
  contentRef: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  onHidden: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  contentLabel: PropTypes.string.isRequired,
  titleHeader: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  className: PropTypes.string,
  body: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
  footer: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  classNameFooter: PropTypes.string
}

export default CustomModal;