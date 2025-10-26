import PropTypes from 'prop-types';
import Select from './Select';
import Row from './Row';
import Column from './Column';
import Button from './Button';
import TextArea from './TextArea';
import { Printer } from 'lucide-react';
import { usePrivilegios } from '@/hooks/use-privilegios';
import { CAMBIAR_DE_ALMACEN, CAMBIAR_IMPUESTO, FACTURACION, VENTAS } from '@/model/types/menu';

const SidebarConfiguration = (props) => {

  const { getPrivilegio } = usePrivilegios(props.menus);
  const cambiarAlmacen = getPrivilegio(FACTURACION, VENTAS, CAMBIAR_DE_ALMACEN);
  const cambiarImpuesto = getPrivilegio(FACTURACION, VENTAS, CAMBIAR_IMPUESTO);

  const { idSidebarConfiguration } = props;

  const { refImpuesto, impuestos, idImpuesto, handleSelectIdImpuesto } = props;

  const { refMoneda, monedas, idMoneda, handleSelectIdMoneda } = props;

  const { refAlmacen, almacenes, idAlmacen, handleSelectIdIdAlmacen } = props;

  const { refObservacion, observacion, handleInputObservacion } = props;

  const { refNota, nota, handleInputNota } = props;

  const { refInstruccion, instruccion, handleInputInstruccion } = props;

  const { handleSaveOptions, handleCloseOptions } = props;

  return (
    <div id={idSidebarConfiguration} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-100 border-0 rounded-0">
          <div className="card-header">Configuración</div>
          <Button contentClassName="close" onClick={handleCloseOptions}>
            <span>&times;</span>
          </Button>

          <div className="card-body h-100 overflow-y-auto">
            <Row>
              <Column formGroup={true}>
                <label>
                  Impuesto: <i className="fa fa-asterisk text-danger small"></i>
                </label>
                <Select
                  title="Lista de Impuestos"
                  ref={refImpuesto}
                  value={idImpuesto}
                  onChange={handleSelectIdImpuesto}
                  disabled={!cambiarImpuesto}
                >
                  <option value="">-- Impuesto --</option>
                  {impuestos.map((item, index) => (
                    <option key={index} value={item.idImpuesto}>
                      {item.nombre}
                    </option>
                  ))}
                </Select>
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <label>
                  Moneda: <i className="fa fa-asterisk text-danger small"></i>{' '}
                </label>
                <Select
                  title="Lista de Monedas"
                  ref={refMoneda}
                  value={idMoneda}
                  onChange={handleSelectIdMoneda}
                >
                  <option value="">-- Moneda --</option>
                  {monedas.map((item, index) => (
                    <option key={index} value={item.idMoneda}>
                      {item.nombre}
                    </option>
                  ))}
                </Select>
              </Column>
            </Row>

            {refAlmacen && (
              <Row>
                <Column formGroup={true}>
                  <label>
                    Almacen:{' '}
                    <i className="fa fa-asterisk text-danger small"></i>{' '}
                  </label>
                  <Select
                    title="Lista de Almacenes"
                    ref={refAlmacen}
                    value={idAlmacen}
                    onChange={handleSelectIdIdAlmacen}
                    disabled={!cambiarAlmacen}
                  >
                    <option value="">-- Almacen --</option>
                    {almacenes.map((item, index) => (
                      <option key={index} value={item.idAlmacen}>
                        {item.nombre}
                      </option>
                    ))}
                  </Select>
                </Column>
              </Row>
            )}

            <Row>
              <Column formGroup={true}>
                <label>Observación (Visible internamente):</label>
                <TextArea
                  placeholder="Ingrese alguna observación."
                  ref={refObservacion}
                  value={observacion}
                  onChange={handleInputObservacion}
                />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                <label>
                  <div className='flex items-center gap-2'>
                    <span>Nota (Visible en los documentos impresos):</span> <Printer className='w-4 h-4' />
                  </div>
                </label>
                <TextArea
                  placeholder="Ingrese alguna nota o información adicional."
                  ref={refNota}
                  value={nota}
                  onChange={handleInputNota}
                />
              </Column>
            </Row>

            {
              refInstruccion && (
                <Row>
                  <Column formGroup={true}>
                    <label>
                      <div className='flex items-center gap-2'>
                        <span> Instrucciones (Visible en los documentos impresos):</span> <Printer className='w-4 h-4' />
                      </div>
                    </label>
                    <TextArea
                      placeholder="Ingrese las instrucciones de entrega."
                      ref={refInstruccion}
                      value={instruccion}
                      onChange={handleInputInstruccion}
                    />
                  </Column>
                </Row>
              )
            }
          </div>

          <div className="card-footer bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-block">
                Campos obligatorios{' '}
                <i className="fa fa-asterisk text-danger small"></i>
              </span>
              <div>
                <Button
                  className="btn-outline-success mr-2"
                  onClick={handleSaveOptions}
                >
                  <i className="fa fa-save"></i> Guardar
                </Button>
                <Button
                  className="btn-outline-secondary "
                  onClick={handleCloseOptions}
                >
                  <i className="fa fa-close"></i> Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="side-modal_bottom"></div>
      </div>
      <div className="side-modal_overlay" onClick={handleCloseOptions}></div>
    </div>
  );
};

SidebarConfiguration.propTypes = {
  menus: PropTypes.array.isRequired,
  idSidebarConfiguration: PropTypes.string.isRequired,

  impuestos: PropTypes.array.isRequired,
  refImpuesto: PropTypes.object.isRequired,
  idImpuesto: PropTypes.string.isRequired,
  handleSelectIdImpuesto: PropTypes.func.isRequired,

  monedas: PropTypes.array.isRequired,
  refMoneda: PropTypes.object.isRequired,
  idMoneda: PropTypes.string.isRequired,
  handleSelectIdMoneda: PropTypes.func.isRequired,

  almacenes: PropTypes.array,
  refAlmacen: PropTypes.object,
  idAlmacen: PropTypes.string,
  handleSelectIdIdAlmacen: PropTypes.func,

  refObservacion: PropTypes.object.isRequired,
  observacion: PropTypes.string.isRequired,
  handleInputObservacion: PropTypes.func.isRequired,

  refNota: PropTypes.object.isRequired,
  nota: PropTypes.string.isRequired,
  handleInputNota: PropTypes.func.isRequired,

  refInstruccion: PropTypes.object,
  instruccion: PropTypes.string,
  handleInputInstruccion: PropTypes.func,

  handleSaveOptions: PropTypes.func.isRequired,
  handleCloseOptions: PropTypes.func.isRequired,
};

export default SidebarConfiguration;
