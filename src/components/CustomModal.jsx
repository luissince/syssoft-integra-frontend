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
    },
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

CustomModal.propTypes = {
    contentRef: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func.isRequired,
    onHidden: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    contentLabel: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired
}

export default CustomModal;