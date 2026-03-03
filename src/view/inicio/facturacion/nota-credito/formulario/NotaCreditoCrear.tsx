import React from 'react';
import {
  spinnerLoading,
  formatCurrency,
  currentDate,
  calculateTaxBruto,
  calculateTax,
  isEmpty,
} from '@/helper/utils.helper';
import ContainerWrapper from '@/components/ui/container-wrapper';
import Select from '@/components/Select';
import { alertKit } from 'alert-kit';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import { useHistory } from 'react-router-dom';
import Button from '@/components/Button';
import { NOTA_DE_CREDITO } from '@/model/types/tipo-comprobante';
import { useAppSelector } from '@/redux/hooks';
import { comboComprobante, getDetailsByIdVenta } from '@/network/rest/principal.network';
import { createNotaCredito, filterAllVenta } from '@/network/rest/api-client';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import SearchInput from '@/components/SearchInput';
import { optionsMotivo } from '@/network/rest/api-client';
import { CreditNotesReasonsOptionsInterface } from '@/model/ts/interface/credit-notes-reasons';
import Input from '@/components/Input';
import { SaleDetailsInterface, SaleFilterAllInterface } from '@/model/ts/interface/sale';
import TextArea from '@/components/TextArea';

const NotaCreditoCrear = () => {
  const history = useHistory();
  const token = useAppSelector((state) => state.principal);

  const [initialLoad, setInitialLoad] = React.useState(true);
  const [initialMessage, setInitialMessage] = React.useState("Cargando datos...");

  const [idComprobante, setIdComprobante] = React.useState("");
  const [comprobantes, setComprobantes] = React.useState([]);

  const [fechaRegistro, setFechaRegistro] = React.useState(currentDate());

  const [venta, setVenta] = React.useState<SaleFilterAllInterface>(null);
  const [ventas, setVentas] = React.useState<SaleFilterAllInterface[]>([]);

  const [idMotivo, setIdMotivo] = React.useState("");
  const [motivos, setMotivos] = React.useState<CreditNotesReasonsOptionsInterface[]>([]);

  const [observacion, setObservacion] = React.useState("");

  const [ventasDetalles, setVentasDetalles] = React.useState<SaleDetailsInterface[]>([]);

  const refComprobante = React.useRef<HTMLSelectElement>(null);
  const refVenta = React.useRef<SearchInput>(null);
  const refFiltrarDocumento = React.useRef<HTMLInputElement>(null);
  const refMotivo = React.useRef<HTMLSelectElement>(null);

  const abortControllerComprobante = React.useRef(null);
  const abortControllerMotivo = React.useRef(null);
  const abortControllerVenta = React.useRef(null);
  const abortControllerDetallesVenta = React.useRef(null);

  const loadComprobantes = async () => {
    abortControllerComprobante.current = new AbortController();

    const params = {
      tipo: NOTA_DE_CREDITO,
      idSucursal: token.project.idSucursal,
    };

    const response = await comboComprobante(params, abortControllerComprobante.current.signal);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Nota de Crédito",
        message: response.getMessage(),
      });
      return;
    }

    abortControllerComprobante.current = null;
    setComprobantes(response.data);
  };

  const loadMotivos = async () => {
    abortControllerMotivo.current = new AbortController();

    const { success, data, message } = await optionsMotivo(abortControllerMotivo.current.signal);

    if (!success) {
      alertKit.warning({
        title: "Nota de Crédito",
        message: message,
      });
      return;
    }

    abortControllerMotivo.current = null;
    setMotivos(data);
  };

  const loadAll = async () => {
    setInitialLoad(false);
    setInitialMessage("Cargando datos...");

    await loadComprobantes();
    await loadMotivos();

    setInitialLoad(false);
  }

  React.useEffect(() => {
    loadAll();

    return () => {
      if (abortControllerComprobante.current) {
        abortControllerComprobante.current.abort();
      }
      if (abortControllerMotivo.current) {
        abortControllerMotivo.current.abort();
      }
      if (abortControllerVenta.current) {
        abortControllerVenta.current.abort();
      }
      if (abortControllerDetallesVenta.current) {
        abortControllerDetallesVenta.current.abort();
      }
    };
  }, []);

  //------------------------------------------------------------------------------------------
  // Eventos para seleccionar el comprobante
  //------------------------------------------------------------------------------------------

  const handleSelectComprobante = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIdComprobante(event.target.value);
  };

  //------------------------------------------------------------------------------------------
  // Eventos para fecha de registro
  //------------------------------------------------------------------------------------------

  const handleInputFechaRegistro = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFechaRegistro(event.target.value);
  };


  //------------------------------------------------------------------------------------------
  // Eventos para seleccionar el comprobante
  //------------------------------------------------------------------------------------------

  const handleSelectMotivo = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIdMotivo(event.target.value);
  };

  //------------------------------------------------------------------------------------------
  // Eventos ingresar las observaciones
  //------------------------------------------------------------------------------------------

  const handleInputObservacion = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacion(event.target.value);
  };

  //------------------------------------------------------------------------------------------
  // Filtrar documento a modificar
  //------------------------------------------------------------------------------------------
  const handleClearInputVenta = () => {
    setVentas([]);
    setVenta(null);
  };

  const handleFilterVenta = async (text: string) => {
    const searchWord = text;
    setVenta(null);

    if (isEmpty(searchWord)) {
      setVentas([]);
      return;
    }

    abortControllerVenta.current = new AbortController();

    const params = {
      tipo: 1,
      idSucursal: token.project.idSucursal,
      filtrar: searchWord,
    };

    const result = await filterAllVenta(params, abortControllerVenta.current.signal);

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      alertKit.warning({
        title: "Nota de Crédito",
        message: result.getMessage(),
      });
      return;
    }

    abortControllerVenta.current = null;
    setVentas(result.data);
  };

  const handleSelectVenta = async (value: any) => {
    refVenta.current.initialize(`${value.nombreComprobante} (${value.serie}-${value.numeracion})`)
    setVenta(value);
    setVentas([]);

    abortControllerDetallesVenta.current = new AbortController();

    setInitialLoad(true);
    setInitialMessage("Cargando datos...");
    const response = await getDetailsByIdVenta(value.idVenta);

    if (response instanceof ErrorResponse) {
      if (response.getType() === CANCELED) return;

      alertKit.warning({
        title: "Nota de Crédito",
        message: response.getMessage(),
      });
      return;
    }

    abortControllerDetallesVenta.current = null;
    setInitialLoad(false);
    setVentasDetalles(response.data);
  };

  //------------------------------------------------------------------------------------------
  // Acciones del formulario
  //------------------------------------------------------------------------------------------

  const handleSave = async () => {
    const payload = {
      idComprobante: idComprobante,
      idMotivo: idMotivo,
      idVenta: venta.idVenta,
      fechaRegistro: fechaRegistro,
      idUsuario: token.userToken.usuario.idUsuario,
      idSucursal: token.project.idSucursal,
      observacion: observacion
    };

    const accept = await alertKit.question({
      title: "Nota de Crédito",
      message: "¿Está seguro de continuar?",
      acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
      cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
    });

    if (accept) {
      alertKit.loading({
        message: "Procesando información...",
      });

      const { success, data, message } = await createNotaCredito(payload);

      if (!success) {
        alertKit.warning({
          title: "Error",
          message: message,
        });
        return;
      }

      alertKit.success({
        title: "Guardado",
        message: data,
        onClose: () => {
          history.goBack();
        },
      });
    }
  };

  const handleClear = () => {
    alertKit.success({
      title: "Limpiado",
      message: "La nota de crédito ha sido limpiada exitosamente.",
    });
  };

  const handleBack = () => {
    history.goBack();
  };


  return (
    <ContainerWrapper>
      <SpinnerView
        loading={initialLoad}
        message={initialMessage}
      />

      {/* Encabezado */}
      <Title
        title="Notas de Crédito"
        subTitle="CREAR"
        handleGoBack={() => history.goBack()}
      />


      {/* Opciones del formulario */}
      <div className="flex gap-3 mb-3">
        <Button className="btn-success" onClick={handleSave}>
          <i className="fa fa-save"></i> Guardar
        </Button>
        <Button
          className="btn-outline-info"
          onClick={handleClear}
        >
          <i className="fa fa-trash"></i> Limpiar
        </Button>{' '}
        <Button
          className="btn-outline-danger"
          onClick={handleBack}
        >
          <i className="fa fa-close"></i> Cancelar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="w-full flex flex-col mb-3">
          <Select
            label={
              <>
                Comprobante: <i className="fa fa-asterisk text-danger small"></i>
              </>
            }
            ref={refComprobante}
            value={idComprobante}
            onChange={handleSelectComprobante}
          >
            <option value="">-- Seleccione --</option>
            {comprobantes.map((item, index) => (
              <option key={index} value={item.idComprobante}>
                {item.nombre}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full flex flex-col mb-3">
          <Input
            label={
              <>
                Fecha de Registro: <i className="fa fa-asterisk text-danger small"></i>
              </>
            }
            type="date"
            value={fechaRegistro}
            onChange={handleInputFechaRegistro}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="w-full flex mb-3">
          <SearchInput
            ref={refVenta}
            label={
              <>
                Venta a modificar: <i className="fa fa-asterisk text-danger small"></i>
              </>
            }
            placeholder="Filtrar por serie y numeración de la factura o boleta..."
            refValue={refFiltrarDocumento}
            data={ventas}
            handleClearInput={handleClearInputVenta}
            handleFilter={handleFilterVenta}
            handleSelectItem={handleSelectVenta}
            renderItem={(value) => (
              <>
                <span>
                  {value.nombreComprobante} {value.serie}-{value.numeracion}
                </span>
                {' / '}
                <span>{value.informacion}</span>
              </>
            )}
            classNameContainer="w-full relative group"
          />
        </div>

        <div className="w-full flex flex-col mb-3">
          <Select
            label={
              <>
                Motivo de Anulación: <i className="fa fa-asterisk text-danger small"></i>
              </>
            }
            ref={refMotivo}
            value={idMotivo}
            onChange={handleSelectMotivo}
          >
            <option value="">-- Seleccione --</option>
            {
              motivos.map((item, index) => (
                <option key={index} value={item.idMotivo}>
                  {item.nombre}
                </option>
              ))
            }
          </Select>
        </div>
      </div>

      <div className="flex flex-col mb-3">
        <TextArea
          label={
            <>
              Observaciones: <i className="fa fa-asterisk text-danger small"></i>
            </>
          }
          placeholder="Ingrese las observaciones"
          value={observacion}
          onChange={handleInputObservacion}
        />
      </div>

      <div className="bg-white rounded border border-primary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center w-[5%]">#</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Precio</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">Descripción</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Cantidad</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Unidad</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {
                isEmpty(ventasDetalles) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-gray-500">Agregar datos a la tabla</p>
                      </div>
                    </td>
                  </tr>
                )
              }
              {
                !isEmpty(ventasDetalles) && ventasDetalles.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-gray-600 text-center">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-600"> {formatCurrency(item.precio, venta.codiso)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.codigo}
                      <br />
                      {item.producto}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.cantidad}</td>
                    <td className="px-6 py-4 text-gray-600">{item.medida}</td>
                    <td className="px-6 py-4 text-gray-600">{formatCurrency(item.cantidad * item.precio, venta.codiso)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <div>

      </div>
    </ContainerWrapper>
  );

}

export default NotaCreditoCrear;

