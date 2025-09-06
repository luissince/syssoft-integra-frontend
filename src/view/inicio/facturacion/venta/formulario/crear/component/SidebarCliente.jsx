import Button from '../../../../../../../components/Button';
import Column from '../../../../../../../components/Column';
import Input from '../../../../../../../components/Input';
import RadioButton from '../../../../../../../components/RadioButton';
import Row from '../../../../../../../components/Row';
import Select from '../../../../../../../components/Select';
import { SpinnerView } from '../../../../../../../components/Spinner';
import { images } from '../../../../../../../helper';
import {
  handlePasteInteger,
  keyNumberInteger,
  keyNumberPhone,
} from '../../../../../../../helper/utils.helper';
import PropTypes from 'prop-types';
import { RUC } from '../../../../../../../model/types/tipo-documento';
import { JURIDICA, NATURAL } from '@/model/types/tipo-entidad';

const SidebarCliente = (props) => {
  // Desestructurar props para extraer valores específicos
  const { idSidebarCliente, loading } = props;

  const { handleSave, handleClose } = props;

  const { tiposDocumentos } = props;

  const { refIdTipoDocumento, idTipoDocumento, handleSelectIdTipoDocumento } =
    props;

  const {
    refNumeroDocumento,
    numeroDocumento,
    handleInputNumeroDocumento,
    handleApiReniec,
    handleApiSunat,
  } = props;

  const { refInformacion, informacion, handleInputInformacion } = props;

  const { refNumeroCelular, numeroCelular, handleInputNumeroCelular } = props;

  const { refDireccion, direccion, handleInputDireccion } = props;

  const tipoDocumento = tiposDocumentos.find((item) => item.idTipoDocumento === idTipoDocumento);

  // Renderizar el componente modal
  return (
    <div id={idSidebarCliente} className="side-modal">
      <div className="side-modal_wrapper">
        {/* Tarjeta para el contenido del modal */}
        <div className="card h-100 border-0 rounded-0">
          {/* Encabezado de la tarjeta para el modal */}
          <div className="card-header">Agregar Cliente</div>
          {/* Botón de cerrar para el modal */}
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={handleClose}
          >
            <span>&times;</span>
          </button>

          {/* Cuerpo de la tarjeta que contiene el contenido principal del modal */}
          <div className="card-body h-100 overflow-y-auto">
            <SpinnerView loading={loading} message={'Cargando datos...'} />

            <Row>
              <Column formGroup={true}>
                <Select
                  label={
                    <>
                      {' '}
                      Tipo Documento:{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  ref={refIdTipoDocumento}
                  value={idTipoDocumento}
                  onChange={handleSelectIdTipoDocumento}
                >
                  <option value={''}>- Seleccione -</option>
                  {
                    tiposDocumentos
                      .map((item, index) => (
                        <option key={index} value={item.idTipoDocumento}>
                          {item.nombre}
                        </option>
                      ))
                  }
                </Select>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  autoFocus={true}
                  group={true}
                  label={
                    <>
                      {' '}
                      N° de documento ({numeroDocumento.length}):{' '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  placeholder={tipoDocumento && tipoDocumento.longitud ? `Ingrese ${tipoDocumento.longitud} dígitos` : 'Ingrese número de documento'}
                  ref={refNumeroDocumento}
                  value={numeroDocumento}
                  onChange={handleInputNumeroDocumento}
                  onKeyDown={keyNumberInteger}
                  onPaste={handlePasteInteger}
                  buttonRight={
                    <>
                      {
                        tipoDocumento && tipoDocumento.tipoEntidad === JURIDICA ?
                          (
                            <Button
                              className="btn-outline-secondary"
                              title="Sunat"
                              onClick={handleApiSunat}
                            >
                              <img src={images.sunat} alt="Sunat" width="12" />
                            </Button>
                          )
                          :
                          (
                            <Button
                              className="btn-outline-secondary"
                              title="Reniec"
                              onClick={handleApiReniec}
                            >
                              <img src={images.reniec} alt="Reniec" width="12" />
                            </Button>
                          )
                      }
                    </>
                  }
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={
                    <>
                      {tipoDocumento && tipoDocumento.tipoEntidad === JURIDICA ? 'Razón Social: ' : 'Apellidos y Nombres: '}
                      <i className="fa fa-asterisk text-danger small"></i>
                    </>
                  }
                  ref={refInformacion}
                  value={informacion}
                  onChange={handleInputInformacion}
                  placeholder={tipoDocumento && tipoDocumento.tipoEntidad === JURIDICA ? 'Ingrese Razón Social' : 'Ingrese Apellidos y Nombres'}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={'N° de Celular:'}
                  placeholder="Ingrese el número de celular."
                  onKeyDown={keyNumberPhone}
                  ref={refNumeroCelular}
                  value={numeroCelular}
                  onChange={handleInputNumeroCelular}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <Input
                  label={' Dirección:'}
                  placeholder="Ingrese la dirección"
                  ref={refDireccion}
                  value={direccion}
                  onChange={handleInputDireccion}
                />
              </Column>
            </Row>
          </div>

          {/* Pie de la tarjeta que contiene botones para Guardar y Cancelar */}
          <div className="card-footer bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-block">
                Campos obligatorios{' '}
                <i className="fa fa-asterisk text-danger small"></i>
              </span>
              <div>
                <Button
                  className="btn-outline-success mr-2"
                  onClick={handleSave}
                  text={'Aceptar'}
                />
                <Button
                  className="btn-outline-secondary"
                  onClick={handleClose}
                  text={'Cancelar'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="side-modal_overlay" onClick={handleClose}></div>
    </div>
  );
};

SidebarCliente.propTypes = {
  idSidebarCliente: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,

  tiposDocumentos: PropTypes.array.isRequired,

  refIdTipoDocumento: PropTypes.object.isRequired,
  idTipoDocumento: PropTypes.string.isRequired,
  handleSelectIdTipoDocumento: PropTypes.func.isRequired,

  refNumeroDocumento: PropTypes.object.isRequired,
  numeroDocumento: PropTypes.string.isRequired,
  handleInputNumeroDocumento: PropTypes.func.isRequired,

  handleApiReniec: PropTypes.func.isRequired,
  handleApiSunat: PropTypes.func.isRequired,

  refInformacion: PropTypes.object.isRequired,
  informacion: PropTypes.string.isRequired,
  handleInputInformacion: PropTypes.func.isRequired,

  refNumeroCelular: PropTypes.object.isRequired,
  numeroCelular: PropTypes.string.isRequired,
  handleInputNumeroCelular: PropTypes.func.isRequired,

  refDireccion: PropTypes.object.isRequired,
  direccion: PropTypes.string.isRequired,
  handleInputDireccion: PropTypes.func.isRequired,

  handleSave: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default SidebarCliente;
