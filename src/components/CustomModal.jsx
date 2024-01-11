import Modal from 'react-modal';
import './CustomModal.css'

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

const CustomModal = ({ isOpen, onOpen, onHidden, onClose, children }) => {
    return (
        <Modal
            id="idModalCustom"
            isOpen={isOpen}
            onAfterOpen={onOpen}
            onRequestClose={onClose}
            onAfterClose={onHidden}
            style={customStyles}
            className="modal-custom"
            shouldCloseOnOverlayClick={false}
            contentLabel="Example Modal"
        >
            {children}
        </Modal>
    );
};

export default CustomModal;