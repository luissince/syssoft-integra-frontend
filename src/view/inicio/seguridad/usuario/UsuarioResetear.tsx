import { useState, useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import ContainerWrapper from '@/components/ui/container-wrapper';
import Title from '@/components/Title';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { alertKit } from 'alert-kit';
import { isEmpty, isText } from '@/helper/utils.helper';
import { resetUsuario } from '@/network/rest/api-client';

const UsuarioResetear = () => {
    const history = useHistory();
    const location = useLocation();

    const [idUsuario, setIdUsuario] = useState("");
    const [resetClave, setResetClave] = useState("");
    const [lookPassword, setLookPassword] = useState(false);
    const refResetClave = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('idUsuario');

        if (isText(id)) {
            setIdUsuario(id!);
        } else {
            history.goBack();
        }
    }, [location.search, history]);

    const handleLookPassword = () => {
        setLookPassword(!lookPassword);
    };

    const handleGuardar = async () => {
        if (isEmpty(resetClave)) {
            alertKit.warning({
                title: "Usuario",
                message: "!Ingrese la nueva clave.",
            }, () => {
                refResetClave.current?.focus();
            });
            return;
        }

        const accept = await alertKit.question({
            title: "Usuario",
            message: "¿Está seguro de continuar?",
            acceptButton: { html: "<i class='fa fa-check'></i> Aceptar" },
            cancelButton: { html: "<i class='fa fa-close'></i> Cancelar" },
        });

        if (accept) {
            const payload = {
                clave: resetClave,
                idUsuario: idUsuario,
            };

            alertKit.loading({ message: "Procesando información..." });

            const { success, data, message } = await resetUsuario(payload);

            if (!success) {
                alertKit.warning({
                    title: "Usuario",
                    message: message,
                });

                return;
            }

            alertKit.success({
                title: "Usuario",
                message: data,
                onClose: () => history.goBack(),
            });
        }
    };

    return (
        <ContainerWrapper>
            <Title
                title="Usuario"
                subTitle="CAMBIAR CONTRASEÑA"
                handleGoBack={() => history.goBack()}
            />

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <Input
                        group={true}
                        label={<>Nueva Clave <span className="text-red-500">*</span></>}
                        placeholder="Ingrese nueva clave"
                        ref={refResetClave}
                        value={resetClave}
                        onChange={(e) => setResetClave(e.target.value)}
                        type={lookPassword ? "text" : "password"}
                        className="w-full"
                        buttonRight={
                            <Button
                                className="btn-outline-secondary"
                                onClick={handleLookPassword}
                            >
                                <i
                                    className={
                                        lookPassword
                                            ? 'fa fa-eye'
                                            : 'fa fa-eye-slash'
                                    }
                                ></i>
                            </Button>
                        }
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 justify-center">
                    <Button
                        className="btn-primary sm:w-auto w-full flex items-center justify-center gap-2"
                        onClick={handleGuardar}
                    >
                        <i className="fa fa-check"></i> Aceptar
                    </Button>
                    <Button
                        className="btn-danger sm:w-auto w-full flex items-center justify-center gap-2"
                        onClick={() => history.goBack()}
                    >
                        <i className="fa fa-close"></i> Cerrar
                    </Button>
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default UsuarioResetear;
