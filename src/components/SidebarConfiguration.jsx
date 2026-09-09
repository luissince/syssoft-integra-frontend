import PropTypes from 'prop-types';
import Select from './Select';
import Button from './Button';
import TextArea from './TextArea';
import { Printer } from 'lucide-react';
import { usePrivilegios } from '@/hooks/use-privilegios';
import { CAMBIAR_DE_ALMACEN, CAMBIAR_IMPUESTO, FACTURACION, VENTAS } from '@/model/types/menu';
import { FaAsterisk } from 'react-icons/fa';

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

  const { handleSaveOptions, handleCloseOptions } = props;

  return (
    <div id={idSidebarConfiguration} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-full border-0 rounded-none">
          <div className="card-header">
            <h5>Configuración</h5>
          </div>
          <Button contentClassName="close" onClick={handleCloseOptions}>
            <span>&times;</span>
          </Button>

          <div className="card-body h-full overflow-y-auto">
            {/* <Row>
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
            </Row> */}

            <div className="flex flex-col mb-3 gap-3">
              <Select
                label={
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Impuesto:</span> <FaAsterisk className="text-danger" />
                  </div>
                }
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
            </div>

            <div className="flex flex-col mb-3 gap-3">
              <Select
                label={
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Moneda:</span> <FaAsterisk className="text-danger" />
                  </div>
                }
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
            </div>

            {refAlmacen && (
              <div className="flex flex-col mb-3 gap-3">
                <Select
                  label={
                    <div className="flex items-center gap-1">
                      <span className="text-sm">Almacen:</span> <FaAsterisk className="text-danger" />
                    </div>
                  }
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
              </div>
            )}

            {
              refObservacion && (
                <div className="flex flex-col mb-3 gap-3">
                  <TextArea
                    label={
                      <span className="text-sm">
                        Observación (Visible internamente):
                      </span>
                    }
                    placeholder="Ingrese alguna observación."
                    ref={refObservacion}
                    value={observacion ?? ''}
                    onChange={handleInputObservacion}
                  />
                </div>
              )
            }

            <div className="flex flex-col mb-3 gap-2">
              <TextArea
                label={
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Nota (Visible en los documentos impresos):</span> <Printer className='w-4 h-4' />
                  </div>
                }
                placeholder="Ingrese alguna nota o información adicional."
                ref={refNota}
                value={nota ?? ''}
                onChange={handleInputNota}
              />
            </div>
          </div>

          <div className="card-footer bg-white">
            <div className="flex items-center justify-between">
              <span className="d-block">
                Campos obligatorios <i className="fa fa-asterisk text-danger small"></i>
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
  menus: PropTypes.array,
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

  refObservacion: PropTypes.object,
  observacion: PropTypes.string,
  handleInputObservacion: PropTypes.func,

  refNota: PropTypes.object.isRequired,
  nota: PropTypes.string.isRequired,
  handleInputNota: PropTypes.func.isRequired,

  handleSaveOptions: PropTypes.func.isRequired,
  handleCloseOptions: PropTypes.func.isRequired,
};

export default SidebarConfiguration;
