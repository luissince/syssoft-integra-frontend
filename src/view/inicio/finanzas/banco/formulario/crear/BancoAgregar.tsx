import React, { useEffect, useRef, useState } from "react";
import ContainerWrapper from '@/components/ui/container-wrapper';
import {
  isEmpty,
} from '@/helper/utils.helper';
import {
  addBanco,
  comboMoneda,
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
import { useHistory } from 'react-router-dom';

const BancoAgregar = () => {

  // =============================
  // REDUX
  // =============================
  const token = useAppSelector((state) => state.principal);

  // =============================
  // ROUTER
  // =============================
  const history = useHistory();

  // =============================
  // STATE
  // =============================
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState("Cargando datos...");

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

  const abortController = useRef<AbortController | null>(null);

  // =============================
  // API
  // =============================

  const fetchMonedaCombo = async () => {
    abortController.current?.abort();
    abortController.current = new AbortController();

    const result = await comboMoneda(abortController.current.signal);

    if (result instanceof SuccessReponse) {
      return result.data;
    }

    if (result instanceof ErrorResponse) {
      if (result.getType() === CANCELED) return;

      return [];
    }
  }

  // =============================
  // EFFECTS
  // =============================

  useEffect(() => {
    loadData();

    return () => {
      abortController.current?.abort();
    };
  }, []);

  // =============================
  // FLOWS
  // =============================

  const loadData = async () => {
    const [monedas] = await Promise.all([fetchMonedaCombo()]);

    setMonedas(monedas);
    setLoading(false);
  }

  // =============================
  // HANDLERS
  // =============================

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
      const data = {
        nombre: nombre.trim().toUpperCase(),
        tipoCuenta: tipoCuenta,
        idMoneda: idMoneda.trim().toUpperCase(),
        numCuenta: numCuenta.trim().toUpperCase(),
        idSucursal: token.project.idSucursal,
        cci: cci.trim().toUpperCase(),
        preferido: preferido,
        vuelto: vuelto,
        reporte: reporte,
        compartir: compartir,
        estado: estado,

        idUsuario: token.userToken.usuario.idUsuario,
      };

      alertKit.loading({
        message: "Procesando información...",
      });

      const response = await addBanco(data, abortController.current.signal);

      if (response instanceof SuccessReponse) {
        alertKit.success({
          title: "Banco",
          message: response.data,
        }, () => {
          history.goBack();
        });
      }

      if (response instanceof ErrorResponse) {
        if (response.getType() === CANCELED) return;

        alertKit.warning({
          title: "Banco",
          message: response.getMessage(),
        });
      }
    }
  };


  // =============================
  // RENDER
  // =============================

  return (
    <ContainerWrapper>
      <SpinnerView
        loading={loading}
        message={msgLoading}
      />

      <Title
        title="Banco"
        subTitle="AGREGAR"
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
        <Button className="btn-success" onClick={handleGuardar}>
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

export default BancoAgregar;