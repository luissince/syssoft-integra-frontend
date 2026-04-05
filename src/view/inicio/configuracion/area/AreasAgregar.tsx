import React from 'react';
import {
    isEmpty,
} from '../../../../helper/utils.helper';
import { connect } from 'react-redux';
import SuccessReponse from '../../../../model/class/response';
import ErrorResponse from '../../../../model/class/error-response';
import ContainerWrapper from '../../../../components/ui/container-wrapper';
import Title from '../../../../components/Title';
import Row from '../../../../components/Row';
import Column from '../../../../components/Column';
import Input from '../../../../components/Input';
import { Switches } from '../../../../components/Checks';
import Button from '../../../../components/Button';
import { alertKit } from 'alert-kit';
import { createArea } from '@/network/rest/api-client';

interface Props {
    token: {
        userToken: {
            usuario: {
                idUsuario: string;
            };
        };
    };
    history: {
        goBack: () => void;
    };
}

interface State {
    nombre: string;
    descripcion: string;
    estado: boolean;

    idUsuario: string;
}

class AreasAgregar extends React.Component<Props, State> {

    private refNombre: React.RefObject<any>;
    private refValor: React.RefObject<any>;
    private abortController: AbortController;

    constructor(props: Props) {
        super(props);

        this.state = {
            nombre: "",
            descripcion: "",
            estado: true,

            idUsuario: this.props.token.userToken.usuario.idUsuario,
        };

        this.refNombre = React.createRef();
        this.refValor = React.createRef();

        this.abortController = new AbortController();
    }

    async componentDidMount() {
        this.loadingData();
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    async loadingData() {
    }

    handleInputNombre = (event) => {
        this.setState({ nombre: event.target.value });
    };

    handleInputDescripcion = (event) => {
        this.setState({ descripcion: event.target.value });
    };

    handleSelectEstado = (event) => {
        this.setState({ estado: event.target.checked });
    };

    handleGuardar = async () => {

        if (isEmpty(this.state.nombre)) {
            alertKit.warning({
                title: "Area",
                message: "Ingrese el nombre de la área.",
            }, () => {
                this.refNombre.current.focus();
            });
            return;
        }

        const accept = await alertKit.question({
            title: "Area",
            message: "¿Está seguro de continuar?",
            acceptButton: {
                html: "<i class='fa fa-check'></i> Aceptar",
            },
            cancelButton: {
                html: "<i class='fa fa-close'></i> Cancelar",
            },
        });

        if (accept) {
            const data = {
                nombre: this.state.nombre,
                descripcion: this.state.descripcion,
                estado: this.state.estado,
                idUsuario: this.state.idUsuario,
            };

            alertKit.loading({
                message: "Procesando información...",
            });

            const response = await createArea(data);

            if (response instanceof SuccessReponse) {
                alertKit.success({
                    title: "Area",
                    message: response.data,
                }, () => {
                    this.props.history.goBack();
                });
            }

            if (response instanceof ErrorResponse) {
                alertKit.warning({
                    title: "Area",
                    message: response.getMessage(),
                });
            }
        }
    };

    render() {
        return (
            <ContainerWrapper>
                <Title
                    title="Area"
                    subTitle="AGREGAR"
                    icon={<i className="fa fa-plus"></i>}
                    handleGoBack={() => this.props.history.goBack()}
                />

                <Row>
                    <Column formGroup={true}>
                        <Input
                            label={
                                <>
                                    Nombre:<i className="fa fa-asterisk text-danger small"></i>
                                </>
                            }
                            placeholder="Ingrese el nombre"
                            ref={this.refNombre}
                            value={this.state.nombre}
                            onChange={this.handleInputNombre}
                        />
                    </Column>
                </Row>

                <Row>
                    <Column formGroup={true}>
                        <Input
                            label={
                                <>
                                    Descripción:
                                </>
                            }
                            placeholder="Ingrese la descripción"
                            value={this.state.descripcion}
                            onChange={this.handleInputDescripcion}
                        />
                    </Column>
                </Row>

                <Row>
                    <Column formGroup={true}>
                        <Switches
                            id="customSwitchEstado"
                            checked={this.state.estado}
                            onChange={this.handleSelectEstado}
                        >
                            {this.state.estado ? 'Activo' : 'Inactivo'}
                        </Switches>
                    </Column>
                </Row>

                <Row>
                    <Column formGroup={true}>
                        <Button
                            className="btn-success"
                            onClick={() => this.handleGuardar()}
                        >
                            <i className="fa fa-save"></i> Guardar
                        </Button>{' '}
                        <Button
                            className="btn-outline-danger"
                            onClick={() => this.props.history.goBack()}
                        >
                            <i className="fa fa-close"></i> Cerrar
                        </Button>
                    </Column>
                </Row>
            </ContainerWrapper>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.principal,
    };
};

const ConnectedAreasAgregar = connect(
    mapStateToProps,
    null,
)(AreasAgregar);

export default ConnectedAreasAgregar;