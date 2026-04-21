import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import ContainerWrapper from '@/components/ui/container-wrapper';
import CustomComponent from '@/components/CustomComponent';
import {
  isEmpty,
  isText,
} from '@/helper/utils.helper';
import {
  getIdBando,
  comboMoneda,
  updateBanco,
} from '@/network/rest/principal.network';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import { CANCELED } from '@/constants/requestStatus';
import Title from '@/components/Title';
import Button from '@/components/Button';
import { SpinnerView } from '@/components/Spinner';
import Select from '@/components/Select';
import Input from '@/components/Input';
import { Switches } from '@/components/Checks';
import { alertKit } from 'alert-kit';
import { FaAsterisk } from 'react-icons/fa';
import { useAppSelector } from '@/redux/hooks';
import { useHistory, useLocation } from 'react-router-dom';

const BancoEditar = () => {

  // =============================
  // REDUX
  // =============================
  const token = useAppSelector((state) => state.principal);

  // =============================
  // ROUTER
  // =============================
  const history = useHistory();

  const location = useLocation<{
    idBanco: string;
  }>();

  // =============================
  // STATE
  // =============================
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState("Cargando datos...");

  const [idBanco, setIdBanco] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [idMoneda, setIdMoneda] = useState("");
  const [monedas, setMonedas] = useState([]);
  const [numCuenta, setNumCuenta] = useState("");
  const [cci, setCci] = useState("");

  const [preferido, setPreferido] = useState(false);
  const [vuelto, setVuelto] = useState(false);
  const [reporte, setReporte] = useState(false);
  const [compartir, setCompartir] = useState(false);
  const [estado, setEstado] = useState(false);

  // =============================
  // REFS
  // =============================

  const refTxtNombre = useRef(null);
  const refTipoCuenta = useRef(null);
  const refTxtMoneda = useRef(null);
  const refTxtNumCuenta = useRef(null);
  const refTxtCci = useRef(null);

  // =============================
  // CONTROLLERS
  // =============================

  const abortControllerMoneda = useRef<AbortController | null>(null);
  const abortControllerBanco = useRef<AbortController | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // =============================
  // EFFECTS
  // =============================

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const idBanco = queryParams.get("idBanco");

    if (isText(idBanco)) {
      loadData(idBanco);
    } else {
      history.goBack();
    }

    return () => {
      abortControllerMoneda.current?.abort();
      abortControllerBanco.current?.abort();
    };
  }, []);

  // =============================
  // FLOWS
  // =============================

  const loadData = async (idBanco: string) => {
    const [monedas, banco] = await Promise.all([
      fetchMonedaCombo(),
      fetchObtenerBanco(idBanco),
    ]);

    setMonedas(monedas);
    setNombre(banco.nombre);
    setTipoCuenta(banco.tipoCuenta);
    setIdMoneda(banco.idMoneda);
    setNumCuenta(banco.numCuenta);
    setCci(banco.cci);
    setPreferido(banco.preferido === 1 ? true : false);
    setVuelto(banco.vuelto === 1 ? true : false);
    setReporte(banco.reporte === 1 ? true : false);
    setCompartir(banco.compartir === 1 ? true : false);
    setEstado(banco.estado === 1 ? true : false);
    setIdBanco(idBanco);
    setLoading(false);
  }

  const fetchMonedaCombo = async () => {
    abortControllerMoneda.current?.abort();
    abortControllerMoneda.current = new AbortController();

    const result = await comboMoneda(abortControllerMoneda.current.signal);

    if (result instanceof SuccessReponse) {
      abortControllerMoneda.current = null;
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      abortControllerMoneda.current = null;
      return [];
    }
  }

  const fetchObtenerBanco = async (id) => {
    abortControllerBanco.current?.abort();
    abortControllerBanco.current = new AbortController();

    const params = {
      idBanco: id,
    };

    const { success, data, type } = await getIdBando(params, abortControllerBanco.current.signal);

    if (!success) {
      if (type === CANCELED) return;

      abortControllerBanco.current = null;
      return [];
    }

    abortControllerBanco.current = null;
    return data;
  }

  /*
    |--------------------------------------------------------------------------
    | Método de eventos
    |--------------------------------------------------------------------------
    |
    | El método handle es una convención utilizada para denominar funciones que manejan eventos específicos
    | en los componentes de React. Estas funciones se utilizan comúnmente para realizar tareas o actualizaciones
    | en el estado del componente cuando ocurre un evento determinado, como hacer clic en un botón, cambiar el valor
    | de un campo de entrada, o cualquier otra interacción del usuario. Los métodos handle suelen recibir el evento
    | como parámetro y se encargan de realizar las operaciones necesarias en función de la lógica de la aplicación.
    | Por ejemplo, un método handle para un evento de clic puede actualizar el estado del componente o llamar a
    | otra función específica de la lógica de negocio. La convención de nombres handle suele combinarse con un prefijo
    | que describe el tipo de evento que maneja, como handleInputChange, handleClick, handleSubmission, entre otros. 
    |
    */

  const handleGuardar = async () => {
    if (isEmpty(nombre)) {
      alertKit.warning({
        title: "Banco",
        message: "Ingrese el nombre del banco.",
      }, () => {
        refTxtNombre.current.focus();
      });
      return;
    }

    if (isEmpty(tipoCuenta)) {
      alertKit.warning({
        title: "Banco",
        message: "Seleccione el tipo de cuenta.",
      }, () => {
        refTipoCuenta.current.focus();
      });
      return;
    }

    if (isEmpty(idMoneda)) {
      alertKit.warning({
        title: "Banco",
        message: "Seleccione el tipo de moneda.",
      }, () => {
        refTxtMoneda.current.focus();
      });
      return;
    }

    const accept = await alertKit.question({
      title: "Banco",
      message: "¿Estás seguro de continuar?",
      acceptButton: {
        html: "<i class='fa fa-check'></i> Aceptar",
      },
      cancelButton: {
        html: "<i class='fa fa-close'></i> Cancelar",
      },
    });

    if (accept) {
      abortController.current?.abort();
      abortController.current = new AbortController();

      const body = {
        nombre: nombre.trim().toUpperCase(),
        tipoCuenta: tipoCuenta,
        idMoneda: idMoneda.trim().toUpperCase(),
        numCuenta: numCuenta.trim().toUpperCase(),
        cci: cci.trim().toUpperCase(),
        preferido: preferido,
        vuelto: vuelto,
        reporte: reporte,
        compartir: compartir,
        estado: estado,

        idUsuario: token.userToken.usuario.idUsuario,
        idBanco: idBanco,
      };

      alertKit.loading({
        message: "Procesando información...",
      });

      const { success, data, message, type } = await updateBanco(body, abortController.current.signal);

      if (!success) {
        if (type === CANCELED) return;

        abortController.current = null;
        alertKit.success({
          title: "Banco",
          message: message,
        }, () => {
          history.goBack();
        });
      }

      abortController.current = null;
      alertKit.warning({
        title: "Banco",
        message: data,
      });
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Método de renderizado
    |--------------------------------------------------------------------------
    |
    | El método render() es esencial en los componentes de React y se encarga de determinar
    | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
    | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
    | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
    | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
    | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
    | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
    | actuales del componente para determinar lo que se mostrará.
    |
    */

  return (
    <ContainerWrapper>
      <SpinnerView
        loading={loading}
        message={msgLoading}
      />

      <Title
        title="Banco"
        subTitle="EDITAR"
        handleGoBack={() => history.goBack()}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full flex flex-col gap-2">
            <Input
              label={
                <div className="flex items-center gap-1">
                  <p>Nombre:</p> <FaAsterisk className="text-red-500" size={8} />
                </div>
              }
              ref={refTxtNombre}
              placeholder="BCP, BBVA, etc"
              value={nombre}
              onChange={(event) =>
                setNombre(event.target.value)
              }
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <Select
              label={
                <div className="flex items-center gap-1">
                  <p>Tipo De Cuenta:</p> <FaAsterisk className="text-red-500" size={8} />
                </div>
              }
              ref={refTipoCuenta}
              value={tipoCuenta}
              onChange={(event) =>
                setTipoCuenta(event.target.value)
              }
            >
              <option value="">- Seleccione -</option>
              <option value="1">Banco</option>
              <option value="2">Tarjeta</option>
              <option value="3">Efectivo</option>
              <option value="4">Billetera Digital</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full flex flex-col gap-2">
            <Select
              label={
                <div className="flex items-center gap-1">
                  <p>Moneda:</p> <FaAsterisk className="text-red-500" size={8} />
                </div>
              }
              ref={refTxtMoneda}
              value={idMoneda}
              onChange={(event) =>
                setIdMoneda(event.target.value)
              }
            >
              <option value="">- Seleccione -</option>
              {monedas.map((item, index) => (
                <option key={index} value={item.idMoneda}>
                  {item.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full flex flex-col gap-2">
            <Input
              label={
                <div className="flex items-center gap-1">
                  <p>Número de Cuenta:</p> <FaAsterisk className="text-red-500" size={8} />
                </div>
              }
              placeholder="##############"
              ref={refTxtNumCuenta}
              value={numCuenta}
              onChange={(event) =>
                setNumCuenta(event.target.value)
              }
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full flex flex-col gap-2">
            <Input
              label={
                <div className="flex items-center gap-1">
                  <p>CCI:</p>
                </div>
              }
              placeholder="##############"
              ref={refTxtCci}
              value={cci}
              onChange={(event) =>
                setCci(event.target.value)
              }
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <Switches
              label={
                <div className="flex items-center gap-1">
                  <p>Vuelto:</p>
                </div>
              }
              id={'vueltoChecked'}
              checked={vuelto}
              onChange={(value) =>
                setVuelto(value.target.checked)
              }
            >
              {vuelto ? 'Si' : 'No'}
            </Switches>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full flex flex-col gap-2">
            <Switches
              label={
                <div className="flex items-center gap-1">
                  <p>Estado:</p>
                </div>
              }
              id={'estadoChecked'}
              checked={estado}
              onChange={(value) =>
                setEstado(value.target.checked)
              }
            >
              {estado ? 'Activo' : 'Inactivo'}
            </Switches>
          </div>

          <div className="w-full flex flex-col gap-2">
            <Switches
              label={
                <div className="flex items-center gap-1">
                  <p>Preferido:</p>
                </div>
              }
              id={'preferidoChecked'}
              checked={preferido}
              onChange={(value) =>
                setPreferido(value.target.checked)
              }
            >
              {preferido ? 'Si' : 'No'}
            </Switches>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full flex flex-col gap-2">
            <Switches
              label={
                <div className="flex items-center gap-1">
                  <p>Mostrar en Reporte:</p>
                </div>
              }
              id={'reporteChecked'}
              checked={reporte}
              onChange={(value) =>
                setReporte(value.target.checked)
              }
            >
              {reporte ? 'Si' : 'No'}
            </Switches>
          </div>

          <div className="w-full flex flex-col gap-2">
            <Switches
              label={
                <div className="flex items-center gap-1">
                  <p>Compartir Cuenta:</p>
                </div>
              }
              id={'compartirChecked'}
              checked={compartir}
              onChange={(value) =>
                setCompartir(value.target.checked)
              }
            >
              {compartir ? 'Si' : 'No'}
            </Switches>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mt-3 pt-3 border-t border-gray-200">
        <Button className="btn-warning" onClick={handleGuardar}>
          <i className="fa fa-save"></i> Guardar
        </Button>
        <Button
          className="btn-outline-danger"
          onClick={() => history.goBack()}
        >
          <i className="fa fa-close"></i> Cerrar
        </Button>
      </div>

    </ContainerWrapper>
  );
}

export default BancoEditar;
