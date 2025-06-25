import Button from '../../../../../components/Button';
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
            <Column className={"col-sm-6 col-12"} formGroup={true}>
              <Input
                autoFocus={true}
                label={<> Stock Máximo <i className="fa fa-asterisk text-danger small"></i></>}
                placeholder={"ingrese..."}
                role={"float"}
                ref={refStockMaximo}
                value={stockMaximo}
                onChange={handleInputStockMaximo}
              />
            </Column>

            <Column className={"col-sm-6 col-12"} formGroup={true}>
              <Input
                label={<>Stock Mínimo <i className="fa fa-asterisk text-danger small"></i></>}
                placeholder="ingrese..."
                role={"float"}
                ref={refStockMinimo}
                value={stockMinimo}
                onChange={handleInputStockMinimo}
              />
            </Column>
          </Row>
        </>
      }
      footer={
        <>
          <Button
            type="submit"
            className="btn-primary"
          >
            Aceptar
          </Button>
          <Button
            className="btn-danger"
            onClick={async () => await refModal.current.handleOnClose()}
          >
            Cerrar
          </Button>
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