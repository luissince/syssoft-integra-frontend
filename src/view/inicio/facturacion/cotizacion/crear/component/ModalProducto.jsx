import Column from '../../../../../../components/Column';
import Select from '../../../../../../components/Select';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import {
  handlePasteFloat,
} from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { SpinnerView } from '../../../../../../components/Spinner';

const ModalProducto = ({
  refModal,
  isOpen,
  onOpen,
  onHidden,
  onClose,

  loading,

  tipoProducto,

  refCantidad,
  cantidad,
  handleInputCantidad,

  refPrecio,
  precio,
  handleInputPrecio,

  medidas,
  refMedida,
  idMedida,
  handleSelectMedida,

  handleAdd
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
          <SpinnerView
            loading={loading}
            message={"Cargando datos..."}
          />

          <Row>
            <Column>
              <div className="form-group">
                <label>Cantidad:</label>
                <Input
                  disabled={tipoProducto === "SERVICIO"}
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
                <label>Precio:</label>
                <Input
                  placeholder={"0.00"}
                  role={"float"}
                  refInput={refPrecio}
                  value={precio}
                  onChange={handleInputPrecio}
                  onPaste={handlePasteFloat}
                />
              </div>
            </Column>
          </Row>

          <Row>
            <Column>
              <div className="form-group">
                <label>Unidad de Medida:</label>
                <Select
                  refSelect={refMedida}
                  value={idMedida}
                  onChange={handleSelectMedida}>
                  <option value={""}>- Seleccione -</option>
                  {
                    medidas.map((item, index) => (
                      <option key={index} value={item.idMedida}>{item.nombre}</option>
                    ))
                  }
                </Select>
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
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => await refModal.current.handleOnClose()}>
            <i className="fa fa-close"></i> Cerrar
          </button>
        </>
      }
    />
  );
}

ModalProducto.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onHidden: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,

  loading: PropTypes.bool.isRequired,

  tipoProducto: PropTypes.string.isRequired,

  refCantidad: PropTypes.object.isRequired,
  cantidad: PropTypes.string.isRequired,
  handleInputCantidad: PropTypes.func.isRequired,

  refPrecio: PropTypes.object.isRequired,
  precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputPrecio: PropTypes.func.isRequired,

  medidas: PropTypes.array,
  refMedida: PropTypes.object,
  idMedida: PropTypes.string,
  handleSelectMedida: PropTypes.func,

  handleAdd: PropTypes.func.isRequired,
}

export default ModalProducto;