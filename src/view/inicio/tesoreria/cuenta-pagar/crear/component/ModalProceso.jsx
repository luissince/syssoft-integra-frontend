import React from 'react';
import { CustomModalForm } from '../../../../../../components/CustomModal';
import PropTypes from 'prop-types';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Input from '../../../../../../components/Input';
import Button from '../../../../../../components/Button';
import {
  alertWarning,
  getNumber,
  isNumeric,
  formatCurrency,
} from '../../../../../../helper/utils.helper';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProceso extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      monto: '',
      pago: 0,
      pagado: 0,
    };

    this.refModal = React.createRef();

    this.refMonto = React.createRef();
  }

  handleOnOpen = () => {
    const pagado = this.props.plazo.transacciones
      .flatMap((transaccion) => transaccion.detalles)
      .reduce((acc, detalle) => acc + detalle.monto, 0);
    this.setState({ pago: this.props.plazo.monto, pagado });
  };

  handleOnHidden = () => {
    this.setState({
      monto: '',
    });
  };

  handleInputMonto = (event) => {
    this.setState({ monto: event.target.value });
  };

  handleOnSummit = async () => {
    if (!isNumeric(this.state.monto)) {
      alertWarning('Cuentas por Pagar', 'Ingrese un monto valido.', () => {
        this.refMonto.current.focus();
      });
      return;
    }

    const valor =
      this.state.pago - this.state.pagado - getNumber(this.state.monto);
    if (valor < 0) {
      alertWarning(
        'Cuentas por Pagar',
        'El monto a cobrar es mayor que el restante.',
        () => {
          this.refMonto.current.focus();
        },
      );
      return;
    }

    await this.refModal.current.handleOnClose();
    this.props.handleAction(this.props.plazo, this.state.monto);
  };

  render() {
    const { isOpen, onClose } = this.props;

    const { monto } = this.state;

    return (
      <CustomModalForm
        contentRef={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal de Pago"
        titleHeader="Completar Pago"
        onSubmit={this.handleOnSummit}
        body={
          <>
            <Row>
              <Column formGroup={true}>
                <Input
                  autoFocus={true}
                  label={
                    <>
                      Monto a pagar:{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  placeholder={'0.00'}
                  role="float"
                  ref={this.refMonto}
                  value={monto}
                  onChange={this.handleInputMonto}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <p className="text-left m-1">
                  Pago Total: {formatCurrency(this.state.pago, this.props.codiso)}
                </p>
                <p className="text-left text-success  m-1">
                  Monto Pagado:{' '}
                  {formatCurrency(this.state.pagado, this.props.codiso)}
                </p>
              </Column>

              <Column formGroup={true}>
                <p className="text-left text-secondary  m-1">
                  Monto por Pagar:{' '}
                  {formatCurrency(
                    this.state.pago - this.state.pagado,
                    this.props.codiso,
                  )}
                </p>
                <p className="text-left text-secondary  m-1">
                  Monto a Pagar:{' '}
                  {formatCurrency(getNumber(this.state.monto), this.props.codiso)}
                </p>
                <hr className="m-1" />
                <p className="text-left text-danger  m-1">
                  Saldo Restante:{' '}
                  {formatCurrency(
                    this.state.pago -
                      this.state.pagado -
                      getNumber(this.state.monto),
                    this.props.codiso,
                  )}
                </p>
              </Column>
            </Row>
          </>
        }
        footer={
          <>
            <p>
              Los campos con{' '}
              <i className="fa fa-asterisk text-danger small"></i> son
              obligatorios{' '}
            </p>
            <div>
              <Button type="submit" className="btn-outline-success">
                <i className="fa fa-arrow-right"></i> Continuar
              </Button>
            </div>
          </>
        }
        classNameFooter={'footer-cm-content'}
      />
    );
  }
}

ModalProceso.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  codiso: PropTypes.string,
  plazo: PropTypes.object,

  handleAction: PropTypes.func.isRequired,
};

export default ModalProceso;
