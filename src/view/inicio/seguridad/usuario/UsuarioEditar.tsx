import { useState, useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import ContainerWrapper from '@/components/ui/container-wrapper';

import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Select from '@/components/Select';
import { alertKit } from 'alert-kit';
import { Switches } from '@/components/Checks';
import { isText } from '@/helper/utils.helper';
import { getUsuario, optionsPerfil, updateUsuario } from '@/network/rest/api-client';

const UsuarioEditar = () => {
    // 
    const history = useHistory();
    const location = useLocation();

    // Estados de carga
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState("Cargando datos...");

    // Estados del formulario
    const [idUsuario, setIdUsuario] = useState("");

    const [idPerfil, setIdPerfil] = useState("");
    const [perfiles, setPerfiles] = useState<any[]>([]);

    const [usuario, setUsuario] = useState("");
    const [estado, setEstado] = useState(true);

    // Referencias
    const refPerfil = useRef<HTMLSelectElement>(null);
    const refUsuario = useRef<HTMLInputElement>(null);

    const abortController = useRef(null);

    // Cargar datos
    useEffect(() => {
        const loadOptionsPerfil = async () => {
            abortController.current = new AbortController();

            const { success, data, message } = await optionsPerfil(abortController.current.signal);

            if (!success) {
                throw new Error(message);
            }

            abortController.current = null;
            setPerfiles(data);
        };

        const loadGetUsuario = async (idUsuario: string) => {
            abortController.current = new AbortController();

            const { success, data, message } = await getUsuario(idUsuario, abortController.current.signal);

            if (!success) {
                throw new Error(message);
            }

            abortController.current = null;
            setIdPerfil(data.idPerfil);
            setUsuario(data.usuario);
            setEstado(data.estado === 1);

        };

        const loadData = async () => {
            const searchParams = new URLSearchParams(location.search);
            const id = searchParams.get('idUsuario');

            if (!isText(id)) {
                throw new Error("No se proporciono un id de usuario");
            }

            setIdUsuario(id);

            try {
                await loadOptionsPerfil();
                await loadGetUsuario(id);

                setLoading(false);
            } catch (error) {
                alertKit.error({
                    title: "Usuario",
                    message: error.message,
                    onClose: () => {
                        history.goBack();
                    }
                });
            }
        };

        loadData();

        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, [location.search, history]);


    const handleGuardar = async () => {
        const accept = await alertKit.question({
            title: "Usuario",
            message: "¿Está seguro de continuar?",
            acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
            cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
        });

        if (accept) {
            const payload = {
                idPerfil,
                usuario,
                estado: estado ? 1 : 0
            };

            alertKit.loading({ message: "Procesando información..." });

            try {
                const { success, data, message } = await updateUsuario(idUsuario, payload);

                if (!success) {
                    throw new Error(message);
                }

                alertKit.success({
                    title: "Usuario",
                    message: data,
                    onClose: () => {
                        history.goBack();
                    }
                });
            } catch (error: any) {
                alertKit.warning({ title: "Usuario", message: error.message || "Error al actualizar." });
            }
        }
    };

    return (
        <ContainerWrapper>
            <SpinnerView
                loading={loading}
                message={msgLoading}
            />

            <Title
                title="Usuario"
                subTitle="EDITAR"
                handleGoBack={() => history.goBack()}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                    <Select
                        group={true}
                        label={
                            <span className="text-gray-700 font-medium">
                                Perfil <span className="text-red-500">*</span>
                            </span>
                        }
                        ref={refPerfil}
                        value={idPerfil}
                        onChange={(event) => setIdPerfil(event.target.value)}
                        className="w-full"
                    >
                        <option value="">-- Seleccione --</option>
                        {perfiles.map((item, index) => (
                            <option key={index} value={item.idPerfil}>
                                {item.descripcion}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="md:col-span-1">
                    <Input
                        group={true}
                        label={
                            <span className="text-gray-700 font-medium">
                                Usuario <span className="text-red-500">*</span>
                            </span>
                        }
                        id="usuario"
                        value={usuario}
                        ref={refUsuario}
                        onChange={(event) => setUsuario(event.target.value)}
                        placeholder="Ingrese el nombre de usuario"
                        className="w-full"
                    />
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-center">
                        <Switches
                            id="customSwitchEstado"
                            checked={estado}
                            onChange={(e) => setEstado(e.target.checked)}
                        >
                            <span className={estado ? "text-green-600 font-medium" : "text-gray-500"}>
                                {estado ? "Usuario Activo" : "Usuario Inactivo"}
                            </span>
                        </Switches>
                    </div>
                </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-100">
                <Button
                    className="btn-warning sm:w-auto w-full flex items-center justify-center gap-2"
                    onClick={handleGuardar}
                >
                    <i className="fa fa-save"></i> Guardar Cambios
                </Button>
                <Button
                    className="btn-danger sm:w-auto w-full flex items-center justify-center gap-2"
                    onClick={() => history.goBack()}
                >
                    <i className="fa fa-close"></i> Cancelar
                </Button>
            </div>
        </ContainerWrapper>
    );
};

export default UsuarioEditar;
