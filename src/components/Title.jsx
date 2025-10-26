import PropTypes from 'prop-types';
import Row from './Row';
import Column from './Column';
import { ArrowLeft } from 'lucide-react';

/**
 * Componente de título.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.title - Título principal.
 * @param {string} props.subTitle - Subtítulo.
 * @param {Element} props.icon - Elemento que devuelve un icono opcional.
 * @param {Function} props.handleGoBack - Función de devolución de llamada para manejar el evento de retroceso.
 * @returns {JSX.Element} Componente de título.
 */
const Title = ({ title, subTitle, icon, handleGoBack }) => {
  return (
    <Row>
      <Column formGroup={true}>
        <div className='flex items-center gap-2'>
          {/* Renderiza un botón de retroceso si se proporciona la función handleGoBack */}
          {handleGoBack !== undefined && (
            <button className="mr-2" role="button" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {/* Título principal */}
          <h5 className="m-0 p-0">{title}</h5>
          {/* Renderiza el subtítulo y el icono si se proporciona */}
          <small className="text-gray-500">
            {subTitle} {icon}
          </small>
        </div>
      </Column>
    </Row>
  );
};

// Definir propTypes para las propiedades del componente
Title.propTypes = {
  title: PropTypes.string.isRequired, // Título es requerido y debe ser una cadena
  subTitle: PropTypes.string.isRequired, // Subtítulo es requerido y debe ser una cadena
  icon: PropTypes.element, // Icono es opcional y debe ser una función
  handleGoBack: PropTypes.func, // handleGoBack es opcional y debe ser una función
};

export default Title;
