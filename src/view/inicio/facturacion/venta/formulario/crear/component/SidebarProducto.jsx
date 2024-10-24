import { handlePasteFloat, keyNumberFloat, rounded } from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { UNIDADES } from '../../../../../../../model/types/tipo-tratamiento-producto';
import { SpinnerView } from '../../../../../../../components/Spinner';
import Input from '../../../../../../../components/Input';
import TextArea from '../../../../../../../components/TextArea';
import Button from '../../../../../../../components/Button';
import Row from '../../../../../../../components/Row';
import Column from '../../../../../../../components/Column';

const SidebarProducto = (props) => {

  const { idSidebar, loading, producto } = props;

  const { refPrecio, refBonificacion, refDescripcion } = props;

  const { listPrecio } = props;

  const { handleSave, handleClose } = props;

  const handleSeleccionar = (precio) => {
    refPrecio.current.value = precio.valor;
  };

  return (
    <div id={idSidebar} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-100 border-0 rounded-0">
          <div className="card-header">Editar producto</div>
          <Button
            contentClassName="close"
            aria-label="Close"
            onClick={handleClose}
          >
            <span>&times;</span>
          </Button>

          <div className="card-body h-100 overflow-y-auto">
            <SpinnerView
              loading={loading}
              message={"Cargando datos..."}
            />

            <Row>
              <Column formGroup={true}>
                <h5>
                  <i className="fa fa-pencil"></i>{' '}
                  {producto && producto.nombreProducto}
                </h5>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  autoFocus={true}
                  label={<>Precio: <i className="fa fa-asterisk text-danger small"></i></>}
                  placeholder="0.00"
                  refInput={refPrecio}
                  onKeyDown={keyNumberFloat}
                  onPaste={handlePasteFloat}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={"Bonificación:"}
                  placeholder="0"
                  refInput={refBonificacion}
                  onKeyDown={keyNumberFloat}
                  onPaste={handlePasteFloat}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <TextArea
                  label={<>Descripción: <i className="fa fa-asterisk text-danger small"></i></>}
                  placeholder="Ingrese los datos del producto"
                  refInput={refDescripcion}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <label>Lista de Precios:</label>
                <ul className="list-group">
                  {listPrecio.map((item, index) => (
                    <Button
                      key={index}
                      contentClassName="list-group-item list-group-item-action"
                      onClick={() => handleSeleccionar(item)}
                    >
                      {item.nombre} - {item.valor}
                    </Button>
                  ))}
                </ul>

              </Column>
            </Row>
            {
              producto && producto.idTipoTratamientoProducto === UNIDADES && (
                <Row>
                  <Column formGroup={true}>
                    <label>Cantidad por Almacen:</label>
                    <ul className="list-group">
                      {producto.inventarios.map((item, index) => (
                        <li key={index} className="list-group-item">
                          <div className='d-flex justify-content-between flex-row'>
                            <div className=''>
                              <span>{item.almacen}</span>
                            </div>
                            <div>
                              <span>cantidad: {rounded(item.cantidad)}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                  </Column>
                </Row>
              )
            }
          </div>

          <div className="card-footer bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-block">
                Campos obligatorios{' '}
                <i className="fa fa-asterisk text-danger small"></i>
              </span>
              <div>
                <Button
                  className="btn-outline-success mr-2"
                  onClick={handleSave}
                >
                  Aceptar
                </Button>
                <Button
                  className="btn-outline-secondary "
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="side-modal_overlay" onClick={handleClose}></div>
    </div>
  );
};

SidebarProducto.propTypes = {
  idSidebar: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  producto: PropTypes.object,

  refPrecio: PropTypes.object.isRequired,
  refBonificacion: PropTypes.object.isRequired,
  refDescripcion: PropTypes.object.isRequired,

  listPrecio: PropTypes.any.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
}

export default SidebarProducto;
