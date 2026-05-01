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
import { FaAsterisk } from 'react-icons/fa';
import { CANCELED } from '@/constants/requestStatus';

const UsuarioEditar = () => {
    // =============================
    // REDUX
    // =============================
    const history = useHistory();
    const location = useLocation();

    // =============================
    // ROUTER
    // =============================


    // =============================
    // STATE
    // =============================

    // Estados de carga
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState("Cargando datos...");

    // Estados del formulario
    const [idUsuario, setIdUsuario] = useState("");

    const [idPerfil, setIdPerfil] = useState("");
    const [perfiles, setPerfiles] = useState<any[]>([]);

    const [usuario, setUsuario] = useState("");
    const [estado, setEstado] = useState(true);

    // =============================
    // REFS
    // =============================

    const refPerfil = useRef<HTMLSelectElement>(null);
    const refUsuario = useRef<HTMLInputElement>(null);

    // =============================
    // CONTROLLERS
    // =============================

    const abortControllerPerfil = useRef<AbortController | null>(null);
    const abortControllerUsuario = useRef<AbortController | null>(null);

    // =============================
    // API
    // =============================

    const loadOptionsPerfil = async () => {
        abortControllerPerfil.current = new AbortController();

        const { success, data, message, type } = await optionsPerfil(abortControllerPerfil.current.signal);

        if (!success) {
            if (type === CANCELED) return;

            abortControllerPerfil.current = null;
            alertKit.warning({
                title: "Usuario",
                message: message,
            });
            return;
        }

        abortControllerPerfil.current = null;
        return data;
    };

    const loadGetUsuario = async (idUsuario: string) => {
        abortControllerUsuario.current = new AbortController();

        const { success, data, message, type } = await getUsuario(idUsuario, abortControllerUsuario.current.signal);

        if (!success) {
            if (type === CANCELED) return;

            alertKit.warning({
                title: "Usuario",
                message: message,
            });

            abortControllerUsuario.current = null;
            return;
        }

        abortControllerUsuario.current = null;
        return data;
    };

    // =============================
    // EFFECTS
    // =============================

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const idUsuario = searchParams.get('idUsuario');

        if (isText(idUsuario)) {
            loadData(idUsuario);
        } else {
            history.goBack();
        }

        return () => {
            abortControllerPerfil.current?.abort();
            abortControllerUsuario.current?.abort();
        };
    }, []);

    // =============================
    // FLOWS
    // =============================

    const loadData = async (idUsuario: string) => {
        const [perfiles, usuario] = await Promise.all([
            loadOptionsPerfil(),
            loadGetUsuario(idUsuario),
        ]);

        setPerfiles(perfiles);
        setIdPerfil(perfiles.find((item) => item.idPerfil === usuario.idPerfil)?.idPerfil);
        setUsuario(usuario.usuario);
        setEstado(usuario.estado === 1);
        setLoading(false);
    }

    // =============================
    // HANDLERS
    // =============================

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
                title="Usuario"
                subTitle="EDITAR"
                handleGoBack={() => history.goBack()}
            />

            <div className="flex flex-col gap-3">
                {/*  */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="w-full flex flex-col gap-2">
                        <Select
                            label={
                                <div className="flex items-center gap-1">
                                    <p>Perfil:</p> <FaAsterisk className="text-red-500" size={8} />
                                </div>
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

                    <div className="w-full flex flex-col gap-2">
                        <Input
                            label={
                                <div className="flex items-center gap-1">
                                    <p>Usuario:</p> <FaAsterisk className="text-red-500" size={8} />
                                </div>
                            }
                            id="usuario"
                            ref={refUsuario}
                            value={usuario}
                            onChange={(event) => setUsuario(event.target.value)}
                            placeholder="Ingrese el nombre de usuario"
                            className="w-full"
                        />
                    </div>
                </div>

                {/*  */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="w-full flex flex-col gap-2">
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
            <div className="flex flex-col md:flex-row gap-3 mt-3 pt-3 border-t border-gray-200">
                <Button
                    className="btn-warning"
                    onClick={handleGuardar}
                >
                    <i className="fa fa-save"></i> Guardar
                </Button>
                <Button
                    className="btn-danger"
                    onClick={() => history.goBack()}
                >
                    <i className="fa fa-close"></i> Cancelar
                </Button>
            </div>
        </ContainerWrapper>
    );
};

export default UsuarioEditar;
