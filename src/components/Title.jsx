import PropTypes from 'prop-types';

/**
 * Componente de título.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.title - Título principal.
 * @param {string} props.subTitle - Subtítulo.
 * @param {Function} props.icon - Función que devuelve un icono opcional.
 * @param {Function} props.handleGoBack - Función de devolución de llamada para manejar el evento de retroceso.
 * @returns {JSX.Element} Componente de título.
 */
const Title = ({ title, subTitle, icon, handleGoBack }) => {
    return (
        <div className="row">
            <div className="col">
                <div className="form-group">
                    <h5>
                        {/* Renderiza un botón de retroceso si se proporciona la función handleGoBack */}
                        {handleGoBack !== undefined &&
                            <span role="button" onClick={handleGoBack}>
                                <i className="bi bi-arrow-left-short"></i>
                            </span>}
                        {/* Título principal */}
                        {title}
                        {/* Renderiza el subtítulo y el icono si se proporciona */}
                        <small className="text-secondary"> {subTitle} {icon && icon()}</small>
                    </h5>
                </div>
            </div>
        </div>
    );
}

// Definir propTypes para las propiedades del componente
Title.propTypes = {
    title: PropTypes.string.isRequired, // Título es requerido y debe ser una cadena
    subTitle: PropTypes.string.isRequired, // Subtítulo es requerido y debe ser una cadena
    icon: PropTypes.func, // Icono es opcional y debe ser una función
    handleGoBack: PropTypes.func // handleGoBack es opcional y debe ser una función
}

export default Title;