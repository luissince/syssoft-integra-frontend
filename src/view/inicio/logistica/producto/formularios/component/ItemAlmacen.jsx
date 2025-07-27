import PropTypes from 'prop-types';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Button from '../../../../../../components/Button';
import { images } from '../../../../../../helper';

const ItemAlmacen = (props) => {
  const { idAlmacen, nombreAlmacen } = props;
  const { cantidad, cantidadMinima, cantidadMaxima } = props;
  const { handleRemoveItemInventario } = props;

  return (
    <Row>
      <Column className="col-md-2" formGroup={true}>
        <div className="rounded border border-secondary d-flex justify-content-center align-items-center p-4">
          <img src={images.sale} width={50} />
        </div>
      </Column>

      <Column
        className="col-md-8 d-flex text-left align-items-center"
        formGroup={true}
      >
        {idAlmacen && (
          <>
            <p className="m-0">{nombreAlmacen}</p>
            <p className="m-0">
              {cantidad} cantidad - {cantidadMinima} min - {cantidadMaxima} max
            </p>
          </>
        )}
        {!idAlmacen && (
          <>
            <p className="m-0">
              Almacen <i className="fa fa-asterisk text-danger small"></i>{' '}
            </p>
            <p className="m-0">
              {' '}
              Agregar aquí la cantidad inicial de tu producto
            </p>
          </>
        )}
      </Column>

      <Column className="col-md-2 align-self-center" formGroup={true}>
        <Button
          className="btn-danger"
          onClick={() => handleRemoveItemInventario(idAlmacen)}
        >
          <i className="fa fa-remove"></i>
        </Button>
      </Column>
    </Row>
  );
};

ItemAlmacen.propTypes = {
  idAlmacen: PropTypes.string,
  nombreAlmacen: PropTypes.string,

  cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cantidadMinima: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cantidadMaxima: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  handleRemoveItemInventario: PropTypes.func,
};

export default ItemAlmacen;
