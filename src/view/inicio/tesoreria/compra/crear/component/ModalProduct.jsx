import Column from '../../../../../../components/Column';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import {
  handlePasteFloat,
  spinnerLoading,
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

export const ModalProduct = ({
  refModal,
  isOpen,
  onOpen,
  onHidden,
  onClose,

  loading,

  refCantidad,
  cantidad,
  handleInputCantidad,

  refCosto,
  costo,
  handleInputCosto,

  handleAdd,
}) => {

  return (
    <CustomModalForm
      contentRef={refModal}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel="Modal Producto"
      titleHeader="Agregar Producto"
      onSubmit={handleAdd}
      body={
        <>
          {loading && spinnerLoading('Cargando datos...')}

          <Row>
            <Column>
              <div className="form-group">
                <label>Cantidad:</label>
                <Input
                  autoFocus={true}
                  placeholder={"0.00"}
                  role={"float"}
                  refInput={refCantidad}
                  value={cantidad}
                  onChange={handleInputCantidad}
                  onPaste={handlePasteFloat}
                />
              </div>
            </Column>

            <Column>
              <div className="form-group">
                <label>Costo:</label>
                <Input
                  placeholder={"0.00"}
                  role={"float"}
                  refInput={refCosto}
                  value={costo}
                  onChange={handleInputCosto}
                  onPaste={handlePasteFloat}
                />
              </div>
            </Column>
          </Row>
        </>
      }

      footer={
        <>
          <button
            type="submit"
            className="btn btn-primary">
            <i className="fa fa-plus"></i> Agregar
          </button>
          <button type="button"
            className="btn btn-danger"
            onClick={async () => await refModal.current.handleOnClose()}>
            <i className="fa fa-close"></i> Cerrar
          </button>
        </>
      }
    />
  );
}

ModalProduct.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onHidden: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,

  loading: PropTypes.bool.isRequired,

  refCantidad: PropTypes.object.isRequired,
  cantidad: PropTypes.string.isRequired,
  handleInputCantidad: PropTypes.func.isRequired,

  refCosto: PropTypes.object.isRequired,
  costo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputCosto: PropTypes.func.isRequired,

  handleAdd: PropTypes.func.isRequired,
}
