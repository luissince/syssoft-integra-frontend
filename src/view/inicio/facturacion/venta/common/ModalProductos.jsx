import PropTypes from 'prop-types';
import Paginacion from "../../../../../components/Paginacion";
import { CustomModalContent } from '../../../../../components/CustomModal';
import { SpinnerTable } from '../../../../../components/Spinner';
import { getRowCellIndex, isEmpty, numberFormat, rounded } from '../../../../../helper/utils.helper';
import Image from '../../../../../components/Image';
import { images } from '../../../../../helper';
import Button from '../../../../../components/Button';
import CustomComponent from "../../../../../model/class/custom-component";
import React from 'react';
import { filtrarProductoVenta } from '../../../../../network/rest/principal.network';
import { Table } from '../../../../../components/Table';
import { A_GRANEL, UNIDADES, VALOR_MONETARIO } from '../../../../../model/types/tipo-tratamiento-producto';
import ErrorResponse from '../../../../../model/class/error-response';
import { CANCELED } from '../../../../../model/types/types';
import SuccessReponse from '../../../../../model/class/response';
import Row from '../../../../../components/Row';
import Column from '../../../../../components/Column';
import Select from '../../../../../components/Select';
import Search from '../../../../../components/Search';

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
class ModalProductos extends CustomComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            show: false,
            buscar: '',
            lista: [],
            restart: false,
            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
        }

        this.abortController = new AbortController();
        this.refInputBuscar = React.createRef();
        this.refTable = React.createRef();
        this.eventSource = null;
        this.index = 0;
    }

    handleOnOpen = async () => {
        this.refInputBuscar.current.focus();
        this.setState({
            lista: this.props.productos
        })
    }

    loadInit = async () => {
        if (this.state.loading) return;

        this.setState({ lista: this.props.productos });

        // await this.setStateAsync({ paginacion: 1, restart: true });
        // this.fillTable(0);
        // await this.setStateAsync({ opcion: 0 });
    }

    handleSearchText = async (text) => {
        if (this.state.loading) return;

        if (isEmpty(text)) {
            this.setState({ lista: this.props.productos });
            return;
        }

        await this.setStateAsync({ paginacion: 1, restart: false, buscar: text });
        this.fillTable(0, text.trim());
        await this.setStateAsync({ opcion: 0 });
    }

    handlePaginacion = async (listid) => {
        await this.setStateAsync({ paginacion: listid, restart: false });
        this.handleSelectPaginacion();
    }

    handleSelectPaginacion = () => {
        switch (this.state.opcion) {
            case 0:
                this.fillTable(0);
                break;
            case 1:
                this.fillTable(1, this.state.buscar);
                break;
            default:
                this.fillTable(0);
        }
    }

    fillTable = async (opcion, buscar = '') => {
        // this.setState({
        //     loading: true,
        //     show: false,
        //     lista: [],
        //     messageTable: 'Cargando información...',
        // });

        // this.index = 0;

        // const searchParams = new URLSearchParams();
        // searchParams.append("tipo", opcion);
        // searchParams.append("filtrar", buscar);
        // searchParams.append("idSucursal", this.props.idSucursal);
        // searchParams.append("idAlmacen", this.props.idAlmacen);
        // searchParams.append("posicionPagina", (this.state.paginacion - 1) * this.state.filasPorPagina);
        // searchParams.append("filasPorPagina", this.state.filasPorPagina);

        // this.eventSource = new EventSource(filtrarStreamProductoVenta(searchParams.toString()));

        // this.eventSource.onopen = () => {
        //     this.setState({
        //         show: true,
        //     });
        // }

        // this.eventSource.onmessage = (event) => {
        //     const data = JSON.parse(event.data);
        //     if (data === "__END__") {
        //         this.setState({
        //             loading: false,
        //         });

        //         this.eventSource.close()
        //         return
        //     }

        //     if (typeof data === 'object') {
        //         this.setState(prevState => ({
        //             lista: [...prevState.lista, data],
        //         }));
        //     }

        //     if (typeof data === 'number') {
        //         const totalPaginacion = parseInt(
        //             Math.ceil(parseFloat(data) / this.state.filasPorPagina),
        //         );

        //         this.setState({
        //             totalPaginacion: totalPaginacion,
        //         });
        //     }
        // };

        // this.eventSource.onerror = () => {
        //     this.setState({
        //         loading: false,
        //     });
        // };

        this.index = 0;

        this.setState({
            loading: true,
            lista: [],
            messageTable: 'Cargando información...',
        });

        const params = {
            tipo: opcion,
            filtrar: buscar.trim(),
            idSucursal: this.props.idSucursal,
            idAlmacen: this.props.idAlmacen,
            posicionPagina: (this.state.paginacion - 1) * this.state.filasPorPagina,
            filasPorPagina: this.state.filasPorPagina,
        };

        const response = await filtrarProductoVenta(params, this.abortController.signal);

        if (response instanceof SuccessReponse) {
            const totalPaginacion = parseInt(
                Math.ceil(parseFloat(response.data.total) / this.state.filasPorPagina),
            );

            this.setState({
                loading: false,
                lista: response.data.lists,
                totalPaginacion: totalPaginacion,
            });
        }

        if (response instanceof ErrorResponse) {
            if (response.getType() === CANCELED) return;

            this.setState({
                loading: false,
                lista: [],
                totalPaginacion: 0,
                messageTable: response.getMessage(),
            });
        }
    }

    handleOnHidden = () => {
        this.setState({
            loading: false,
            show: false,
            buscar: '',
            lista: [],
            restart: false,
            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
        });
    }

    handleInputKeyDown = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.refTable.current.focus()
            if (!isEmpty(this.state.lista)) {
                const table = this.refTable.current;
                if (!table) return;

                const children = table.tBodies[0].children;
                if (children.length === 0) return;

                children[this.index].classList.add("table-active");
                children[this.index].focus();
            }
        }
    }

    handleKeyDown = (event) => {
        const table = this.refTable.current;
        if (!table) return;

        const children = table.tBodies[0].children;
        if (children.length === 0) return;

        if (event.key === 'ArrowUp') {
            if (this.index > 0) {
                this.index--;
                this.updateSelection(children);
            }
        }

        if (event.key === 'ArrowDown') {
            if (this.index < children.length - 1) {
                this.index++;
                this.updateSelection(children);
            }
        }

        if (event.key === 'Enter') {
            if (this.index >= 0) {
                const item = this.state.lista[this.index];
                if (item) {
                    this.props.handleSeleccionar(item)
                    this.refInputBuscar.current.focus();
                    this.refInputBuscar.current.select();

                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }
    }

    handleOnClick = async (event) => {
        const { rowIndex, tBody } = getRowCellIndex(event);

        if (rowIndex === -1) return;

        const item = this.state.lista[rowIndex];
        if (item) {
            this.index = rowIndex;
            this.updateSelection(tBody.children);
            this.props.handleSeleccionar(item);
            this.refInputBuscar.current.focus();
            this.refInputBuscar.current.select();
        }

    }

    updateSelection = (children) => {
        for (const child of children) {
            child.classList.remove("table-active");
        }
        const selectedChild = children[this.index];
        selectedChild.classList.add("table-active");
        selectedChild.scrollIntoView({ block: 'center' });
        selectedChild.focus();
    }


    generateBody = () => {
        const { loading, show, lista } = this.state;

        if (loading && !show) {
            return (
                <SpinnerTable
                    colSpan='8'
                    message='Cargando información de la tabla...'
                />
            );
        }

        if (isEmpty(lista)) {
            return (
                <tr>
                    <td className="text-center" colSpan="8">¡No hay datos registrados!</td>
                </tr>
            );
        }

        return lista.map((item, index) => {
            const tipo = function () {
                if (item.tipo === 'PRODUCTO') {
                    return (
                        <>
                            <span>
                                Producto <i className="bi bi-basket"></i>
                            </span>
                            <br />
                            <span>{item.venta}</span>
                        </>
                    );
                }

                if (item.tipo === 'SERVICIO') {
                    return (
                        <>
                            <span>
                                Servicio <i className="bi bi-person-workspace"></i>{' '}
                            </span>
                            <br />
                            <span>{item.venta}</span>
                        </>
                    );
                }

                return (
                    <>
                        <span>
                            Combo <i className="bi bi-fill"></i>{' '}
                        </span>
                        <br />
                        <span>{item.venta}</span>
                    </>
                );
            };

            const tipoTratamiento = item.idTipoTratamientoProducto === UNIDADES ? "EN UNIDADES"
                : item.idTipoTratamientoProducto === VALOR_MONETARIO ? "VALOR MONETARIO"
                    : item.idTipoTratamientoProducto === A_GRANEL ? "A GRANEL" : "SERVICIO"

            return (
                <tr key={index} tabIndex="0">
                    <td className={`text-center`}>{item.id || ++index}</td>
                    <td>
                        {tipo()}
                        {tipoTratamiento}</td>
                    <td>
                        {item.codigo}
                        <br />
                        <b>{item.nombreProducto}</b>{' '}
                        {item.preferido === 1 && (<i className="fa fa-star text-warning"></i>)}
                    </td>
                    <td className="text-right">
                        {numberFormat(item.precio, this.props.codiso)}
                    </td>
                    <td>{item.medida}</td>
                    <td>{item.categoria}</td>
                    <td className={`${item.tipo === 'PRODUCTO' && item.cantidad <= 0 ? 'text-danger' : 'text-success'}`}>
                        {item.tipo === 'PRODUCTO' ? (
                            <>
                                {item.almacen}
                                <br />
                                INV. {rounded(item.cantidad)}
                            </>
                        ) : (
                            'SERVICIO'
                        )}
                    </td>
                    <td className='text-center'>
                        <Image
                            default={images.noImage}
                            src={item.imagen}
                            alt="Logo"
                            width={100}
                        />
                    </td>
                </tr>
            );
        });
    }

    render() {
        const {
            loading,
            lista,
            totalPaginacion,
            paginacion,
            restart
        } = this.state;

        const {
            refModal,
            isOpen,
            almacenes,
            refAlmacen,
            idAlmacen,
            handleSelectIdIdAlmacen,
            handleClose
        } = this.props;

        return (
            <CustomModalContent
                contentRef={refModal}
                isOpen={isOpen}
                onOpen={this.handleOnOpen}
                onHidden={this.handleOnHidden}
                onClose={handleClose}
                contentLabel="Modal de Productos"
                titleHeader="Productos"
                className={"modal-custom-lg"}
                body={
                    <div className='w-100 h-100 overflow-hidden d-flex'>
                        <div className='w-100 h-100 d-flex'>
                            <div className='w-100 d-flex flex-column position-relative'>
                                <div className="px-3 py-3">
                                    <Row>
                                        <Column className='col-8'>
                                            <label><i className="fa fa-search"></i> Buscar por código o nombres:</label>

                                            <Search
                                                group={true}
                                                iconLeft={<i className="bi bi-search"></i>}
                                                placeholder={`Buscar por código, nombres...`}
                                                refInput={this.refInputBuscar}
                                                onSearch={this.handleSearchText}
                                                buttonRight={
                                                    <Button
                                                        className="btn-outline-secondary"
                                                        title="Recargar"
                                                        icono={<i className="bi bi-arrow-clockwise"></i>}
                                                        onClick={this.loadInit}
                                                    />
                                                }
                                                onKeyDown={this.handleInputKeyDown}
                                            />
                                        </Column>

                                        <Column className='col-4'>
                                            <label>
                                                Almacen: <i className="fa fa-asterisk text-danger small"></i>{' '}
                                            </label>
                                            <Select
                                                title="Lista de Almacenes"
                                                refSelect={refAlmacen}
                                                value={idAlmacen}
                                                onChange={async (event) => handleSelectIdIdAlmacen(event, true, () => this.handleOnOpen())}>
                                                <option value="">-- Almacen --</option>
                                                {almacenes.map((item, index) => (
                                                    <option key={index} value={item.idAlmacen}>
                                                        {item.nombre}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Column>
                                    </Row>
                                </div>

                                <div
                                    className='ml-3 mr-3 h-100 overflow-auto'
                                    onKeyDown={this.handleKeyDown}>
                                    <Table
                                        refTable={this.refTable}
                                        onClick={this.handleOnClick}
                                        className="table table-bordered table-hover table-sticky"
                                        tHead={
                                            <tr>
                                                <th width="5%" className="text-center">#</th>
                                                <th width="13%">Tipo/Venta</th>
                                                <th width="20%">Nombres</th>
                                                <th width="7%">Precio</th>
                                                <th width="5%">Medida</th>
                                                <th width="5%">Categoría</th>
                                                <th width="10%">Inventario</th>
                                                <th width="5%">Imagen</th>
                                            </tr>
                                        }
                                        tBody={this.generateBody()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                classNameBody="p-0"
                footer={
                    <Paginacion
                        className="w-100"
                        loading={loading}
                        data={lista}
                        totalPaginacion={totalPaginacion}
                        paginacion={paginacion}
                        fillTable={this.handlePaginacion}
                        restart={restart}
                    />
                }
                classNameFooter="footer-cm-table"
            />
        );
    };
}

ModalProductos.propTypes = {
    refModal: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    productos: PropTypes.array,
    codiso: PropTypes.string.isRequired,
    idSucursal: PropTypes.string.isRequired,

    almacenes: PropTypes.array,
    idAlmacen: PropTypes.string.isRequired,
    refAlmacen: PropTypes.object,
    handleSelectIdIdAlmacen: PropTypes.func,

    handleClose: PropTypes.func.isRequired,
    handleSeleccionar: PropTypes.func.isRequired,
}

export default ModalProductos;