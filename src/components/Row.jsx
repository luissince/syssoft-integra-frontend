import PropTypes from 'prop-types';

/**
 * Componente de fila.
 * @param {Object} props - Propiedades del componente.
 * @param {ReactNode} props.children - Elementos hijos del componente.
 * @returns {JSX.Element} Componente de fila.
 */
const Row = ({ className = "", children }) => {
    return (
        <div className={`row ${className}`}>
            {children}
        </div>
    );
}

// Definir propTypes para las propiedades del componente
Row.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired, // Los elementos hijos son requeridos y pueden ser cualquier nodo React
};

export default Row;