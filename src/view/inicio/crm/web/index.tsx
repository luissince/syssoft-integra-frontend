import Button from "@/components/Button";
import ContainerWrapper from "@/components/Container";
import Title from "@/components/Title";
import { isEmpty } from "@/helper/utils.helper";
import { CANCELED } from "@/model/types/types";
import { comboAlmacen, comboSucursal, getIdWeb, processWeb } from "@/network/rest/api-client";
import { useAppSelector } from "@/redux/hooks";
import { alertKit } from "alert-kit";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

const WebCrm = () => {
    const history = useHistory();
    const token = useAppSelector((state) => state.principal);

    const [configWeb, setConfigWeb] = useState<any>(null);

    const [idSucursal, setIdSucursal] = useState("");
    const [idAlmacen, setIdAlmacen] = useState("");

    const [sucursales, setSucursales] = useState<any[]>([]);
    const [almacenes, setAlmacenes] = useState<any[]>([]);

    const [loadingSucursal, setLoadingSucursal] = useState(false);
    const [loadingAlmacen, setLoadingAlmacen] = useState(false);

    const abortSucursal = useRef<AbortController | null>(null);
    const abortAlmacen = useRef<AbortController | null>(null);
    const abortWeb = useRef<AbortController | null>(null);

    useEffect(() => {
        if (loadingSucursal) {
            return;
        }

        loadInit();

        return () => {
            abortSucursal.current?.abort();
            abortAlmacen.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (loadingAlmacen) {
            return;
        }

        if (!isEmpty(idSucursal)) {
            setAlmacenes([]);
            setIdAlmacen("");
            loadAlmacenes();
        }
    }, [idSucursal]);

    const loadInit = async () => {
        const web = await loadIdWeb();

        const sucursales = await loadSucursales();

        if (web && sucursales) {

            setConfigWeb(web);

            const sucursal = sucursales.find(
                x => x.idSucursal === web.idSucursal
            );

            if (sucursal) {
                setIdSucursal(web.idSucursal);
            }
        }
    };

    const loadIdWeb = async () => {
        abortWeb.current?.abort();
        const controller = new AbortController();
        abortWeb.current = controller;

        const { success, data, message, type } = await getIdWeb(controller.signal);

        if (!success) {
            if (type === CANCELED) return null;

            alertKit.warning({
                title: 'Web CRM',
                message: message,
            });
            return null;
        }

        return data.success ? data.data : null;
    };

    const loadSucursales = async () => {
        setLoadingSucursal(true);

        abortSucursal.current?.abort();
        const controller = new AbortController();
        abortSucursal.current = controller;

        const response = await comboSucursal(
            controller.signal
        );

        if (!response.success) {
            if (response.type === CANCELED) return null;

            alertKit.warning({
                title: "Web CRM",
                message: response.message
            }, handleGoBack);
            return null;
        }

        setSucursales(response.data);
        setLoadingSucursal(false);

        return response.data;
    };

    const loadAlmacenes = async () => {
        setLoadingAlmacen(true);

        abortAlmacen.current?.abort();

        const controller = new AbortController();
        abortAlmacen.current = controller;

        const params = {
            idSucursal: idSucursal
        }

        const response = await comboAlmacen(
            params,
            controller.signal
        );

        if (!response.success) {
            if (response.type === CANCELED) return;

            alertKit.warning({
                title: "Web CRM",
                message: response.message
            }, handleGoBack);
            return;
        }

        setAlmacenes(response.data);
        setLoadingAlmacen(false);

        if (configWeb?.idAlmacen) {
            const almacen = response.data.find(
                x => x.idAlmacen === configWeb.idAlmacen
            );

            if (almacen) {
                setIdAlmacen(configWeb.idAlmacen);
            }
        }
    };

    const handleSelectSucursal = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setIdSucursal(event.target.value);
    };

    const handleSelectAlmacen = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setIdAlmacen(event.target.value);
    };

    const handleSave = async () => {
        if (!idSucursal) {
            alertKit.warning({
                title: "Web CRM",
                message: "Seleccione una sucursal"
            });
            return;
        }

        if (!idAlmacen) {
            alertKit.warning({
                title: "Web CRM",
                message: "Seleccione un almacén"
            });
            return;
        }

        const accept = await alertKit.question({
            title: "Web CRM",
            message: "¿Estás seguro de continuar?",
            acceptButton: {
                html: "<i class='fa fa-check'></i> Aceptar",
            },
            cancelButton: {
                html: "<i class='fa fa-close'></i> Cancelar",
            },
        });

        if (accept) {
            alertKit.loading({
                message: 'Procesando información...',
            });

            const body = {
                idSucursal,
                idAlmacen,
                idUsuario: token.userToken.idUsuario,
            }

            const { success, data, message, type } = await processWeb(
                body,
                abortWeb.current.signal,
            );

            if (!success) {
                if (type === CANCELED) return;

                alertKit.warning({
                    title: 'Web CRM',
                    message: message,
                });
                return;
            }

            alertKit.success({
                title: 'Web CRM',
                message: data,
            });
        }
    };

    const handleGoBack = () => {
        history.goBack();
    };

    return (
        <ContainerWrapper>
            <Title
                title="Web CRM"
                subTitle="Configuración"
                handleGoBack={handleGoBack}
            />

            <div className="flex flex-col gap-3">

                <div>
                    <p className="text-gray-600 mt-1">
                        Modulo de configuración para la plataforma WEB
                    </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                    <select
                        value={idSucursal}
                        onChange={handleSelectSucursal}
                        className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">- SUCURSALES -</option>
                        {sucursales.map((item, index) => (
                            <option key={index} value={item.idSucursal}>
                                {index + 1 + '.- ' + item.nombre}
                            </option>
                        ))}
                    </select>

                    <select
                        value={idAlmacen}
                        onChange={handleSelectAlmacen}
                        className="w-full px-4 py-2 h-10 border border-gray-300 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">- ALMACENES -</option>
                        {almacenes.map((item, index) => (
                            <option key={index} value={item.idAlmacen}>
                                {index + 1 + '.- ' + item.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ===================== Botones ===================== */}
                <div className="flex gap-3">
                    <Button className="btn-primary" onClick={handleSave}>
                        <i className="fa fa-save"></i> Guardar
                    </Button>
                    <Button
                        className="btn-danger"
                        onClick={handleGoBack}
                    >
                        <i className="fa fa-close"></i> Cerrar
                    </Button>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default WebCrm;