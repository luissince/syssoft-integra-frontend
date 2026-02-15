import React from 'react';
import PropTypes from 'prop-types';
import CustomModal, {
  CustomModalContentBody,
  CustomModalContentFooter,
  CustomModalContentForm,
  CustomModalContentHeader,
} from '../../../../../../components/CustomModal';
import Input from '../../../../../../components/Input';
import Button from '../../../../../../components/Button';
import {
  getNumber,
  isNumeric,
  formatCurrency,
} from '../../../../../../helper/utils.helper';
import { alertKit } from 'alert-kit';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProceso extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      monto: "",
      restante: 0,
    };

    this.refModal = React.createRef();

    this.refMonto = React.createRef();
  }

  handleOnOpen = () => {
    this.setState({ restante: this.props.restante });
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
    const { monto, restante } = this.state;

    if (!isNumeric(monto)) {
      alertKit.warning({
        title: "Cuentas por Cobrar",
        message: "Ingrese un monto válido.",
      }, () => this.refMonto.current.focus());
      return;
    }

    const valor = restante - getNumber(monto);
    if (valor < 0) {
      alertKit.warning({
        title: "Cuentas por Cobrar",
        message: "El monto a cobrar es mayor que el restante.",
      }, () => this.refMonto.current.focus());
      return;
    }

    await this.refModal.current.handleOnClose();
    this.props.handleAction(monto);
  };


  render() {
    const { isOpen, onClose } = this.props;
    const { monto, restante } = this.state;

    const nuevoRestante = isNumeric(monto)
      ? restante - getNumber(monto)
      : restante;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onOpen={this.handleOnOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Completar Cobro"
      >
        <CustomModalContentForm onSubmit={this.handleOnSummit}>
          <CustomModalContentHeader contentRef={this.refModal}>
            💰 Completar Cobro
          </CustomModalContentHeader>

          <CustomModalContentBody>
            {/* Campo de monto */}
            <Input
              autoFocus
              label={
                <>
                  Monto a cobrar: <i className="fa fa-asterisk text-red-500 text-xs"></i>
                </>
              }
              placeholder="0.00"
              role="float"
              className="mb-3"
              ref={this.refMonto}
              value={monto}
              onChange={this.handleInputMonto}
            />

            {/* Resumen de totales */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto restante:</span>
                <strong>{formatCurrency(restante, this.props.codiso)}</strong>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">Nuevo restante:</span>
                <strong className={nuevoRestante < 0 ? 'text-red-500' : 'text-green-600'}>
                  {formatCurrency(Math.max(0, nuevoRestante), this.props.codiso)}
                </strong>
              </div>
            </div>
          </CustomModalContentBody>

          <CustomModalContentFooter className="flex items-center justify-between px-3 py-3 border-t border-solid border-gray-200">
            <p className="text-gray-500 text-xs">
              Los campos con <i className="fa fa-asterisk text-danger small"></i> son obligatorios.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                className="btn-outline-secondary"
                onClick={onClose}
              >
                <i className="fa fa-times"></i> Cancelar
              </Button>

              <Button type="submit" className="btn-outline-success">
                <i className="fa fa-arrow-right"></i> Continuar
              </Button>
            </div>
          </CustomModalContentFooter>
        </CustomModalContentForm>
      </CustomModal>
    );
  }
}

ModalProceso.propTypes = {
  refModal: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  idCompra: PropTypes.string,
  codiso: PropTypes.string,
  transaccion: PropTypes.array,
  restante: PropTypes.number,
  handleAction: PropTypes.func.isRequired,
};

export default ModalProceso;
