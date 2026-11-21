import React, { Component } from 'react';
import CustomModal, { CustomModalContentBody, CustomModalContentFooter, CustomModalContentForm, CustomModalContentHeader } from '../../../../../../../components/CustomModal';
import PropTypes from 'prop-types';
import Button from '../../../../../../../components/Button';
import { CANCELED } from '../../../../../../../model/types/types';
import { getListPresentacionProducto } from '../../../../../../../network/rest/principal.network';
import { SpinnerView } from '../../../../../../../components/Spinner';
import { alertKit } from 'alert-kit';
import { cn } from '@/lib/utils';
import { FaCheckCircle } from 'react-icons/fa';
import { ImRadioUnchecked } from "react-icons/im";

class ModalPresentacion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      message: 'Cargando datos...',

      presentacion: null,
      presentaciones: [],
      producto: null,
    };

    this.initial = { ...this.state };

    this.peticion = false;
    this.abortController = null;

    this.refModal = React.createRef();

    this.index = -1;
  }

  loadDatos = async (producto) => {
    this.abortController = new AbortController();

    const { success, data, message, type } = await getListPresentacionProducto(
      producto.idProducto,
      this.abortController.signal,
    );

    if (!success) {
      if (type === CANCELED) return;

      this.setState({
        loading: false,
        message: message,
      });

      this.peticion = false;
      this.abortController = null;

      return;
    }

    this.peticion = true;
    this.abortController = null;

    this.setState({
      loading: false,
      presentaciones: data,
      producto: producto,
    });
  };

  handleOnHidden = async () => {
    if (!this.peticion) {
      if (this.abortController) {
        this.abortController.abort();
      }
    }

    this.setState(this.initial);
    this.index = -1;
    this.peticion = false;
  };

  handleOnSubmit = async () => {
    const { producto, presentacion } = this.state;

    if (!presentacion) {
      alertKit.warning({
        title: 'Presentación',
        message: 'Seleccione una presentación.',
      });
      return;
    }

    this.props.handleSave(producto, presentacion);

    await this.refModal.current.handleOnClose();
  };

  render() {
    const { loading, message, presentaciones, producto, presentacion } = this.state;

    const { isOpen, onClose } = this.props;

    return (
      <CustomModal
        ref={this.refModal}
        isOpen={isOpen}
        onHidden={this.handleOnHidden}
        onClose={onClose}
        contentLabel="Modal Producto"
        titleHeader="Cambiar de precio al producto"
      >
        <CustomModalContentForm onSubmit={this.handleOnSubmit}>
          <CustomModalContentHeader contentRef={this.refModal}>
            {producto && producto.nombreProducto}
          </CustomModalContentHeader>

          <CustomModalContentBody>
            <SpinnerView loading={loading} message={message} />

            {!loading && (
              <div className="flex flex-col gap-3">

                {/* Información */}
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <i className="fa fa-info-circle"></i>
                    <span className="font-semibold text-sm">
                      Selecciona una presentación
                    </span>
                  </div>

                  <p className="mt-1 mb-0 text-sm text-gray-600">
                    Elige la presentación que deseas utilizar para este producto.
                  </p>
                </div>

                {/* Título */}
                <div className="flex items-center justify-between">
                  <h6 className="mb-0 font-semibold text-gray-700">
                    Presentaciones disponibles
                  </h6>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {presentaciones.length} opciones
                  </span>
                </div>

                {/* Lista */}
                {presentaciones.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {presentaciones.map((item, index) => {
                      const selected = presentacion === item;

                      return (
                        <Button
                          key={item.id || index}
                          type="button"
                          contentClassName={cn(
                            "w-full flex items-center justify-between",
                            "rounded-lg border p-3 text-left transition-all duration-200",
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50"
                          )}
                          onClick={() => {
                            this.index = index;
                            this.setState({ presentacion: item });
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex p-3 items-center justify-center rounded-lg",
                                selected
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              <i className="fa fa-cube"></i>
                            </div>

                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {item.nombre}
                              </span>

                              <span className="text-xs text-gray-500">
                                Factor de conversión: {item.factor}
                              </span>
                            </div>
                          </div>

                          <div>
                            {selected ? (
                              <FaCheckCircle className="text-blue-600 w-5 h-5" />
                            ) : (
                              <ImRadioUnchecked className="text-gray-300 w-5 h-5" />
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                    <i className="fa fa-inbox mb-3 text-3xl text-gray-400"></i>

                    <h6 className="font-semibold text-gray-700">
                      Sin presentaciones disponibles
                    </h6>

                    <p className="mb-0 text-sm text-gray-500">
                      No se encontraron presentaciones para este producto.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CustomModalContentBody>

          <CustomModalContentFooter>
            <Button type="submit" className="btn-primary">
              <i className="fa fa-check"></i> Selecionar
            </Button>
            <Button
              className="btn-danger"
              onClick={async () => await this.refModal.current.handleOnClose()}
            >
              <i className="fa fa-close"></i> Cerrar
            </Button>
          </CustomModalContentFooter>
        </CustomModalContentForm>
      </CustomModal>
    );
  }
}

ModalPresentacion.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
};

export default ModalPresentacion;
