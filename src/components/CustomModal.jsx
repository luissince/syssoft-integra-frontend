import Modal from 'react-modal';
import PropTypes from 'prop-types';
import '../recursos/css/CustomModal.css'

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

const CustomModal = ({ contentRef, isOpen, onOpen, onHidden, onClose, contentLabel, children }) => {
    return (
        <Modal
            contentRef={contentRef}
            isOpen={isOpen}
            onAfterOpen={onOpen}
            onRequestClose={onClose}
            onAfterClose={onHidden}
            style={customStyles}
            className="modal-custom"
            shouldCloseOnOverlayClick={false}
            contentLabel={contentLabel}
        >
            {children}
        </Modal>
    );
};

export const CustomModalContent = ({ contentRef, isOpen, onOpen, onHidden, onClose, contentLabel, titleHeader, body, footer }) => {
    return (
        <CustomModal
            contentRef={contentRef}
            isOpen={isOpen}
            onOpen={onOpen}
            onHidden={onHidden}
            onClose={onClose}
            contentLabel={contentLabel}
        >      
            <div className="header-cm">
                <p className='m-0 h6'>{titleHeader}</p>
                <button type="button"
                    className='close'
                    onClick={onClose}>
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div className="body-cm">
                {body}
            </div>
            <div className="footer-cm">
                {footer}
            </div>        
        </CustomModal>
    );
}

CustomModalContent.propTypes = {
    contentRef: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func.isRequired,
    onHidden: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    contentLabel: PropTypes.string.isRequired,
    titleHeader: PropTypes.string.isRequired,
    body: PropTypes.element.isRequired,
    footer: PropTypes.element.isRequired,
}

CustomModal.propTypes = {
    contentRef: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func.isRequired,
    onHidden: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    contentLabel: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.element).isRequired
}

export default CustomModal;