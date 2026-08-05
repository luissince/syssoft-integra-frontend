import Button from "@/components/Button";
import { Switches } from "@/components/Checks";
import Input from "@/components/Input";
import Select from "@/components/Select";

interface Props {
    type: "crear" | "editar";

    refTxtNombre: React.RefObject<HTMLInputElement>;
    nombre: string;
    handleChangeNombre: (event: React.ChangeEvent<HTMLInputElement>) => void;

    refTipoCuenta: React.RefObject<HTMLSelectElement>;
    tipoCuenta: string;
    handleChangeTipoCuenta: (event: React.ChangeEvent<HTMLSelectElement>) => void;

    monedas: any[];
    refTxtMoneda: React.RefObject<HTMLSelectElement>;
    idMoneda: string;
    handleChangeIdMoneda: (event: React.ChangeEvent<HTMLSelectElement>) => void;

    refTxtNumCuenta: React.RefObject<HTMLInputElement>;
    numCuenta: string;
    handleChangeNumCuenta: (event: React.ChangeEvent<HTMLInputElement>) => void;

    refTxtCci: React.RefObject<HTMLInputElement>;
    cci: string;
    handleChangeCci: (event: React.ChangeEvent<HTMLInputElement>) => void;

    vuelto: boolean;
    handleChangeVuelto: (event: React.ChangeEvent<HTMLInputElement>) => void;

    estado: boolean;
    handleChangeEstado: (event: React.ChangeEvent<HTMLInputElement>) => void;

    preferido: boolean;
    handleChangePrefereido: (event: React.ChangeEvent<HTMLInputElement>) => void;

    reporte: boolean;
    handleChangeReporte: (event: React.ChangeEvent<HTMLInputElement>) => void;

    compartir: boolean;
    handleChangeCompartir: (event: React.ChangeEvent<HTMLInputElement>) => void;

    handleSave: () => void;
    handleGoBack: () => void;
}

const Formulario = ({
    type,

    refTxtNombre,
    nombre,
    handleChangeNombre,

    refTipoCuenta,
    tipoCuenta,
    handleChangeTipoCuenta,

    monedas,
    refTxtMoneda,
    idMoneda,
    handleChangeIdMoneda,

    refTxtNumCuenta,
    numCuenta,
    handleChangeNumCuenta,

    refTxtCci,
    cci,
    handleChangeCci,

    vuelto,
    handleChangeVuelto,

    estado,
    handleChangeEstado,

    preferido,
    handleChangePrefereido,

    reporte,
    handleChangeReporte,

    compartir,
    handleChangeCompartir,

    handleSave,
    handleGoBack
}: Props) => {
    return (
        <div className="flex flex-col gap-3">

            <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full">
                    <Input
                        label={
                            <label>
                                Nombre Banco: <i className="fa fa-asterisk text-danger small"></i>
                            </label>
                        }
                        ref={refTxtNombre}
                        placeholder="BCP, BBVA, etc"
                        value={nombre}
                        onChange={handleChangeNombre}
                    />
                </div>

                <div className="w-full">
                    <Select
                        label={
                            <label>
                                Tipo de Cuenta: <i className="fa fa-asterisk text-danger small"></i>
                            </label>
                        }
                        ref={refTipoCuenta}
                        value={tipoCuenta}
                        onChange={handleChangeTipoCuenta}
                    >
                        <option value="">- Seleccione -</option>
                        <option value="1">Cuenta Bancaría</option>
                        <option value="2">Efectivo</option>
                        <option value="3">Billetera Digital</option>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full">
                    <Select
                        label={
                            <label>
                                Moneda: <i className="fa fa-asterisk text-danger small"></i>
                            </label>
                        }
                        ref={refTxtMoneda}
                        value={idMoneda}
                        onChange={handleChangeIdMoneda}
                    >
                        <option value="">- Seleccione -</option>
                        {monedas.map((item, index) => (
                            <option key={index} value={item.idMoneda}>
                                {item.nombre}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="w-full">
                    <Input
                        label={<label>Número de cuenta:</label>}
                        placeholder="##############"
                        ref={refTxtNumCuenta}
                        value={numCuenta}
                        onChange={handleChangeNumCuenta}
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full">
                    <Input
                        label={<label>CCI:</label>}
                        placeholder="##############"
                        ref={refTxtCci}
                        value={cci}
                        onChange={handleChangeCci}
                    />
                </div>

                <div className="w-full">
                    <Switches
                        label={'Vuelto:'}
                        id={'vueltoChecked'}
                        checked={vuelto}
                        onChange={handleChangeVuelto}
                    >
                        {vuelto ? 'Si' : 'No'}
                    </Switches>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full">
                    <Switches
                        label={'Estado:'}
                        id={'estadoChecked'}
                        checked={estado}
                        onChange={handleChangeEstado}
                    >
                        {estado ? 'Activo' : 'Inactivo'}
                    </Switches>
                </div>

                <div className="w-full">
                    <Switches
                        label={'Preferido:'}
                        id={'preferidoChecked'}
                        checked={preferido}
                        onChange={handleChangePrefereido}
                    >
                        {preferido ? 'Si' : 'No'}
                    </Switches>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full">
                    <Switches
                        label={'Mostrar en Reporte:'}
                        id={'reporteChecked'}
                        checked={reporte}
                        onChange={handleChangeReporte}
                    >
                        {reporte ? 'Si' : 'No'}
                    </Switches>
                </div>

                <div className="w-full">
                    <Switches
                        label={'Compartir Cuenta:'}
                        id={'compartirChecked'}
                        checked={compartir}
                        onChange={handleChangeCompartir}
                    >
                        {compartir ? 'Si' : 'No'}
                    </Switches>
                </div>
            </div>

            <div className="dropdown-divider"></div>

            <div className="flex gap-3">
                <Button
                    className="btn-warning"
                    onClick={handleSave}>
                    {type === "crear" && <><i className="fa fa-save"></i> Guardar</>}
                    {type === "editar" && <><i className="fa fa-save"></i> Guardar</>}
                </Button>
                <Button
                    className="btn-danger"
                    onClick={handleGoBack}
                >
                    <i className="fa fa-close"></i> Cerrar
                </Button>
            </div>
        </div>
    );
};

export default Formulario;