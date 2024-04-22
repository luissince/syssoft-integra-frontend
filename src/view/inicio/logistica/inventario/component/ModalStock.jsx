import Column from '../../../../../components/Column';
import { CustomModalForm } from '../../../../../components/CustomModal';
import Input from '../../../../../components/Input';
import Row from '../../../../../components/Row';
import { SpinnerView } from '../../../../../components/Spinner';
import PropTypes from 'prop-types';

const CustomModalStock = ({
  refModal,
  isOpen,
  onOpen,
  onHidden,
  onClose,

  loading,

  refStockMinimo,
  stockMinimo,
  handleInputStockMinimo,

  refStockMaximo,
  stockMaximo,
  handleInputStockMaximo,

  handleSave
}) => {
  return (
    <CustomModalForm
    contentRef={refModal}
      isOpen={isOpen}
      onOpen={onOpen}
      onHidden={onHidden}
      onClose={onClose}
      contentLabel="Modal Stock"
      titleHeader="SysSoft Integra"
      onSubmit={handleSave}
      body={
        <>
          <SpinnerView
            loading={loading}
            message={"Cargando datos..."}
          />

          <Row>
            <Column>
              <div className="form-group">
                <h6>Actualizar stock</h6>
              </div>
            </Column>
          </Row>

          <Row>
            <Column className={"col-sm-6 col-12"}>
              <div className="form-group">
                <label>
                  Stock Máximo
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <Input
                  autoFocus={true}
                  placeholder={"ingrese..."}
                  role={"float"}
                  refInput={refStockMaximo}
                  value={stockMaximo}
                  onChange={handleInputStockMaximo}

                />
              </div>
            </Column>

            <Column className={"col-sm-6  col-12"}>
              <div className="form-group">
                <label>
                  Stock Mínimo
                  <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <Input
                  autoFocus={false}
                  placeholder="ingrese..."
                  role={"float"}
                  refInput={refStockMinimo}
                  value={stockMinimo}
                  onChange={handleInputStockMinimo}
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
            className="btn btn-primary"
          >
            Aceptar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => await refModal.current.handleOnClose()}
          >
            Cerrar
          </button>
        </>
      }
    />
  );
};

CustomModalStock.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onHidden: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,

  loading: PropTypes.bool.isRequired,

  refStockMinimo: PropTypes.object.isRequired,
  stockMinimo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputStockMinimo: PropTypes.func.isRequired,

  refStockMaximo: PropTypes.object.isRequired,
  stockMaximo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleInputStockMaximo: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
}

export default CustomModalStock;