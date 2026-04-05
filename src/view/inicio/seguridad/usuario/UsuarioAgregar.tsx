import { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import ContainerWrapper from '@/components/ui/container-wrapper';
import SuccessReponse from '@/model/class/response';
import ErrorResponse from '@/model/class/error-response';
import {
    filtrarPersona,
} from '@/network/rest/principal.network';
import { CANCELED } from '@/constants/requestStatus';
import { SpinnerView } from '@/components/Spinner';
import Title from '@/components/Title';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Select from '@/components/Select';
import { alertKit } from 'alert-kit';
import { Switches } from '@/components/Checks';
import SearchInput from '@/components/SearchInput';
import { isEmpty } from '@/helper/utils.helper';
import { createUsuario, optionsPerfil } from '@/network/rest/api-client';

const UsuarioAgregar = () => {
    const history = useHistory();

    // Estados de carga
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState("Cargando datos...");

    // Estados del formulario
    const [cliente, setCliente] = useState<any>(null);
    const [clientes, setClientes] = useState<any[]>([]);

    const [idPerfil, setIdPerfil] = useState("");
    const [perfiles, setPerfiles] = useState<any[]>([]);

    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [configClave, setConfigClave] = useState("");
    const [estado, setEstado] = useState(true);

    // Referencias para el foco
    const refCliente = useRef<any>(null);
    const refValueCliente = useRef<any>(null);
    const refPerfil = useRef<HTMLSelectElement>(null);
    const refUsuario = useRef<HTMLInputElement>(null);
    const refClave = useRef<HTMLInputElement>(null);
    const refConfigClave = useRef<HTMLInputElement>(null);

    const abortController = useRef(null);

    // Cargar datos iniciales
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

        const loadData = async () => {
            try {
                await loadOptionsPerfil();

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
    }, []);

    // Manejo de filtro de clientes
    const handleClearInputCliente = () => {
        setClientes([]);
        setCliente(null);
    };

    const handleFilterCliente = async (text: string) => {
        abortController.current = new AbortController();

        if (isEmpty(text)) {
            setClientes([]);
            return;
        }

        const params = {
            opcion: 1,
            filter: text,
            cliente: true,
        };

        const response = await filtrarPersona(params, abortController.current.signal);

        if (response instanceof SuccessReponse) {
            setClientes(response.data);
        } else {
            setClientes([]);
        }
    };

    const handleSelectItemCliente = (value: any) => {
        if (refCliente.current) {
            refCliente.current.initialize(value.documento + ' - ' + value.informacion);
        }
        setCliente(value);
        setClientes([]);
    };

    // Guardar usuario
    const handleGuardar = async () => {
        if (!cliente) {
            alertKit.warning({
                title: "Usuario",
                message: "Seleccione un cliente.",
            }, () => {
                refCliente.current?.focus();
            });
            return;
        }

        if (isEmpty(idPerfil)) {
            alertKit.warning({
                title: "Usuario",
                message: "Seleccione un perfil.",
            }, () => {
                refPerfil.current?.focus();
            });
            return;
        }

        if (isEmpty(usuario)) {
            alertKit.warning({
                title: "Usuario",
                message: "Ingrese el usuario.",
            }, () => {
                refUsuario.current?.focus();
            });
            return;
        }

        if (isEmpty(clave)) {
            alertKit.warning({
                title: "Usuario",
                message: "Ingrese su contraseña.",
            }, () => {
                refClave.current?.focus();
            });
            return;
        }

        if (isEmpty(configClave)) {
            alertKit.warning({
                title: "Usuario",
                message: "Confirme su contraseña.",
            }, () => {
                refConfigClave.current?.focus();
            });
            return;
        }

        if (clave !== configClave) {
            alertKit.warning({
                title: "Usuario",
                message: "Las contraseñas no coinciden.",
            }, () => {
                refClave.current?.focus();
            });
            return;
        }

        const accept = await alertKit.question({
            title: "Usuario",
            message: "¿Está seguro de guardar el usuario?",
            acceptButton: {
                html: "<i class='fa fa-check'></i> Aceptar",
            },
            cancelButton: {
                html: "<i class='fa fa-close'></i> Cancelar",
            },
        });

        if (accept) {
            const payload = {
                idPersona: cliente.idPersona,
                idPerfil: idPerfil,
                usuario: usuario,
                clave: clave,
                estado: estado,
            };

            alertKit.loading({
                message: "Procesando información...",
            });

            try {
                const { success, data, message } = await createUsuario(payload);

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
                alertKit.error({
                    title: "Error",
                    message: error.message || "Error inesperado al guardar.",
                });
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
                subTitle="AGREGAR"
                handleGoBack={() => history.goBack()}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <SearchInput
                        group={true}
                        label={
                            <span className="text-gray-700 font-medium">
                                Cliente <span className="text-red-500">*</span>
                            </span>
                        }
                        ref={refCliente}
                        placeholder="Buscar personal"
                        refValue={refValueCliente}
                        data={clientes}
                        handleClearInput={handleClearInputCliente}
                        handleFilter={handleFilterCliente}
                        handleSelectItem={handleSelectItemCliente}
                        renderItem={(value: any) => (
                            <div className="flex flex-col">
                                <span className="font-medium">{value.documento}</span>
                                <span className="text-sm">{value.informacion}</span>
                            </div>
                        )}
                        classNameContainer="w-full relative group"
                    />
                </div>

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

                <div className="md:col-span-1">
                    <Input
                        group={true}
                        label={
                            <span className="text-gray-700 font-medium">
                                Contraseña <span className="text-red-500">*</span>
                            </span>
                        }
                        type="password"
                        id="contraseña"
                        placeholder="Ingrese su contraseña"
                        ref={refClave}
                        value={clave}
                        onChange={(event) => setClave(event.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="md:col-span-1">
                    <Input
                        group={true}
                        label={
                            <span className="text-gray-700 font-medium">
                                Confirmar Contraseña <span className="text-red-500">*</span>
                            </span>
                        }
                        type="password"
                        id="contraseña2"
                        value={configClave}
                        ref={refConfigClave}
                        onChange={(event) => setConfigClave(event.target.value)}
                        placeholder="Confirme su contraseña"
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

            <div className="flex flex-col sm:flex-row gap-4 mt-3 pt-6 border-t border-gray-100">
                <Button
                    className="btn-success sm:w-auto w-full flex items-center justify-center gap-2"
                    onClick={handleGuardar}
                >
                    <i className="fa fa-save"></i> Guardar Usuario
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

export default UsuarioAgregar;
