import Button from '../../../../../../components/Button';
import Column from '../../../../../../components/Column';
import Input from '../../../../../../components/Input';
import Row from '../../../../../../components/Row';
import { images } from '../../../../../../helper';
import { keyNumberFloat } from '../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';

const ItemProducto = (props) => {
  const { item } = props;
  const { handleInputCantidadCombos, handleRemoveItemCombo } = props;

  return (
    <Row>
      <Column className="col-md-2" formGroup={true}>
        <div className="rounded border border-secondary d-flex justify-content-center align-items-center p-4">
          <img src={images.sale} width={50} />
        </div>
      </Column>

      <Column className="col-md-6" formGroup={true}>
        <div className="d-flex flex-column align-items-start justify-content-center">
          <span>Producto: {item.nombre}</span>
          <span>Costo: {item.costo}</span>
        </div>
      </Column>

      <Column className="col-md-2" formGroup={true}>
        <div className="d-flex align-self-center">
          <Input
            placeholder="0"
            value={item.cantidad}
            onChange={(event) =>
              handleInputCantidadCombos(event, item.idProducto)
            }
            onKeyDown={keyNumberFloat}
          />
        </div>
      </Column>

      <Column className="col-md-2" formGroup={true}>
        <div className="d-flex justify-content-end">
          <Button
            className="btn-danger"
            onClick={() => handleRemoveItemCombo(item.idProducto)}
          >
            <i className="fa fa-remove"></i>
          </Button>
        </div>
      </Column>
    </Row>
  );
};

ItemProducto.propTypes = {
  item: PropTypes.object,

  handleInputCantidadCombos: PropTypes.func,
  handleRemoveItemCombo: PropTypes.func,
}

export default ItemProducto;
