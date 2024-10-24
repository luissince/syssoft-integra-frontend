import PropTypes from 'prop-types';
import Select from '../../../../../../components/Select';
import Row from '../../../../../../components/Row';
import Column from '../../../../../../components/Column';
import Button from '../../../../../../components/Button';
import TextArea from '../../../../../../components/TextArea';

const SidebarConfiguration = (props) => {
  const { idSidebarConfiguration } = props;

  const { refImpuesto, impuestos, idImpuesto, handleSelectIdImpuesto } = props;

  const { refMoneda, monedas, idMoneda, handleSelectIdMoneda } = props;

  const { refAlmacen, almacenes, idAlmacen, handleSelectIdIdAlmacen } = props;

  const { refObservacion, observacion, handleInputObservacion } = props;

  const { refONota, nota, handleInputNota } = props;

  const { handleSaveOptions, handleCloseOptions } = props;

  return (
    <div id={idSidebarConfiguration} className="side-modal">
      <div className="side-modal_wrapper">
        <div className="card h-100 border-0 rounded-0">
          <div className="card-header">Configuración de Venta</div>
          <Button
            contentClassName="close"
            onClick={handleCloseOptions}
          >
            <span>&times;</span>
          </Button>

          <div className="card-body h-100 overflow-y-auto">
            <Row>
              <Column formGroup={true}>
                  <label>
                    Impuesto:{' '}
                    <i className="fa fa-asterisk text-danger small"></i>
                  </label>
                  <Select
                    title="Lista de Impuestos"
                    refSelect={refImpuesto}
                    value={idImpuesto}
                    onChange={handleSelectIdImpuesto}
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
                    refSelect={refMoneda}
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

            <Row>
              <Column formGroup={true}>
                  <label>
                    Almacen: <i className="fa fa-asterisk text-danger small"></i>{' '}
                  </label>
                  <Select
                    title="Lista de Almacenes"
                    refSelect={refAlmacen}
                    value={idAlmacen}
                    onChange={handleSelectIdIdAlmacen}
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

            <Row>
              <Column formGroup={true}>
                  <label>Observación:</label>
                  <TextArea
                    placeholder="Ingrese alguna observación."
                    refInput={refObservacion}
                    value={observacion}
                    onChange={handleInputObservacion}
                  />
              </Column>
            </Row>

            <Row>
              <Column formGroup={true}>
                  <label>Nota (Visible en los documentos impresos):</label>
                  <TextArea
                    placeholder="Ingrese alguna nota."
                    refInput={refONota}
                    value={nota}
                    onChange={handleInputNota}
                  />
              </Column>
            </Row>
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
                  text={"Aceptar"}
                />
                <Button
                  className="btn-outline-secondary "
                  onClick={handleCloseOptions}
                  text={"Cancelar"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="side-modal_bottom"></div>
      </div>
      <div
        className="side-modal_overlay"
        onClick={handleCloseOptions}
      ></div>
    </div>
  );
};

SidebarConfiguration.propTypes = {
  idSidebarConfiguration: PropTypes.string.isRequired,

  impuestos: PropTypes.array.isRequired,
  refImpuesto: PropTypes.object.isRequired,
  idImpuesto: PropTypes.string.isRequired,
  handleSelectIdImpuesto: PropTypes.func.isRequired,

  monedas: PropTypes.array.isRequired,
  refMoneda: PropTypes.object.isRequired,
  idMoneda: PropTypes.string.isRequired,
  handleSelectIdMoneda: PropTypes.func.isRequired,

  almacenes: PropTypes.array.isRequired,
  refAlmacen: PropTypes.object.isRequired,
  idAlmacen: PropTypes.string.isRequired,
  handleSelectIdIdAlmacen: PropTypes.func.isRequired,

  refObservacion: PropTypes.object.isRequired,
  observacion: PropTypes.string.isRequired,
  handleInputObservacion: PropTypes.func.isRequired,

  refONota: PropTypes.object.isRequired,
  nota: PropTypes.string.isRequired,
  handleInputNota: PropTypes.func.isRequired,

  handleSaveOptions: PropTypes.func.isRequired,
  handleCloseOptions: PropTypes.func.isRequired,
}


export default SidebarConfiguration;
