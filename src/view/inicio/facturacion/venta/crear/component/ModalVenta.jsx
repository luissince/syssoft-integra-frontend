import PropTypes from 'prop-types';
import Row from "../../../../../../components/Row";
import Column from "../../../../../../components/Column";
import { TableResponsive } from "../../../../../../components/Table";
import Paginacion from "../../../../../../components/Paginacion";
import { CustomModalForm } from '../../../../../../components/CustomModal';
import { SpinnerTable } from '../../../../../../components/Spinner';
import { formatNumberWithZeros, formatTime, isEmpty, keyUpSearch, numberFormat } from '../../../../../../helper/utils.helper';

const ModalVenta = ({
    refModal,
    isOpen,
    handleOpen,
    handleHidden,
    handleClose,

    loading,
    lista,
    totalPaginacion,
    paginacion,
    fillTable,
    restart,
    fechaInicio,
    fechaFinal,
    searchText,
    handleRestart,
    handleFechaInicio,
    handleFechaFinal,
    handleSeleccionar
}) => {

    const generateBody = () => {
        if (loading) {
            return (
                <tr>
                    <td className="text-center" colSpan="8">
                        <SpinnerTable
                            message='Cargando información de la tabla...'
                        />
                    </td>
                </tr>
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

            const estado = <span className={`${item.estado === 1 ? "text-success" : "text-danger"}`}>{item.estado === 1 ? "ACTIVO" : "ANULADO"}</span>;

            return (
                <tr key={index}>
                    <td className={`text-center`}>{item.id}</td>
                    <td>{item.fecha}<br />{formatTime(item.hora)}</td>
                    <td>{item.documento}<br />{item.informacion}</td>
                    <td>{item.comprobante}<br />{item.serie}-{formatNumberWithZeros(item.numeracion)}</td>
                    <td className='text-center'>{estado}</td>
                    <td className='text-center'>{numberFormat(item.total, item.codiso)} </td>
                    <td className="text-center">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            title="Seleccionar"
                            onClick={() => handleSeleccionar(item.idVenta)}>
                            <i className="fa fa-plus"></i>
                        </button>
                    </td>
                </tr>
            );
        });
    }

    return (
        <CustomModalForm
            contentRef={refModal}
            isOpen={isOpen}
            onOpen={handleOpen}
            onHidden={handleHidden}
            onClose={handleClose}
            contentLabel="Modal de Venta"
            titleHeader="Venta"
            className={"modal-custom-lg"}
            body={
                <>
                    <Row>
                        <Column className={"col-md-6 col-12"}>
                            <div className="form-group">
                                <label><i className="fa fa-search"></i> Buscar por N° de Venta o Cliente:</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="form-control"
                                        onKeyUp={(event) => keyUpSearch(event, () => searchText(event.target.value))}
                                    />
                                    <div className="input-group-append">
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            title="Recargar"
                                            onClick={handleRestart}>
                                            <i className="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Column>

                        <Column>
                            <div className="form-group">
                                <label><i className="fa fa-calendar"></i> Fecha Inicio:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fechaInicio}
                                    onChange={handleFechaInicio}
                                />
                            </div>
                        </Column>

                        <Column>
                            <div className="form-group">
                                <label><i className="fa fa-calendar"></i> Fecha  Final:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fechaFinal}
                                    onChange={handleFechaFinal}
                                />
                            </div>
                        </Column>
                    </Row>

                    <Row>
                        <Column>
                            <TableResponsive
                                tHead={
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="10%">Fecha</th>
                                        <th width="15%">Comprobante</th>
                                        <th width="15%">Cliente</th>
                                        <th width="5%">Estado</th>
                                        <th width="10%" className="text-center">Total</th>
                                        <th width="5%" className="text-center">
                                            Usar
                                        </th>
                                    </tr>
                                }
                                tBody={generateBody()}
                            />
                        </Column>
                    </Row>

                    <Paginacion
                        loading={loading}
                        data={lista}
                        totalPaginacion={totalPaginacion}
                        paginacion={paginacion}
                        fillTable={fillTable}
                        restart={restart}
                    />
                </>
            }
        />
    );
}

ModalVenta.propTypes = {
    refModal: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired,
    handleHidden: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,

    loading: PropTypes.bool.isRequired,
    lista: PropTypes.array.isRequired,
    totalPaginacion: PropTypes.number.isRequired,
    paginacion: PropTypes.number.isRequired,
    fillTable: PropTypes.func.isRequired,
    restart: PropTypes.bool.isRequired,
    fechaInicio: PropTypes.string.isRequired,
    fechaFinal: PropTypes.string.isRequired,
    searchText: PropTypes.func.isRequired,
    handleRestart: PropTypes.func.isRequired,
    handleFechaInicio: PropTypes.func.isRequired,
    handleFechaFinal: PropTypes.func.isRequired,
    handleSeleccionar: PropTypes.func.isRequired
}

export default ModalVenta;