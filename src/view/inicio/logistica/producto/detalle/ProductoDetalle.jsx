import { connect } from 'react-redux';
import ContainerWrapper from '../../../../../components/Container';
import CustomComponent from '../../../../../model/class/custom-component';

/**
 * Componente que representa una funcionalidad específica.
 * @extends CustomComponent
 */
class ProductoDetalle extends CustomComponent {
  
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <ContainerWrapper></ContainerWrapper>;
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.principal,
  };
};

const ConnectedProductoDetalle = connect(
  mapStateToProps,
  null,
)(ProductoDetalle);

export default ConnectedProductoDetalle;
