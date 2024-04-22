import PropTypes from 'prop-types';

/**
 * Componente de columna.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.className - Clase CSS adicional para la columna.
 * @param {Object} props.refChildren - Referencia al elemento hijo.
 * @param {ReactNode} props.children - Elementos hijos del componente.
 * @returns {JSX.Element} Componente de columna.
 */
const Column = ({ className, refChildren, children }) => {
    return (
        <div ref={refChildren} className={className ? className : "col"}>
            {children}
        </div>
    );
}

// Definir propTypes para las propiedades del componente
Column.propTypes = {
    className: PropTypes.string, // Clase CSS adicional es opcional y debe ser una cadena
    refChildren: PropTypes.object, // Referencia al elemento hijo es opcional y debe ser un objeto
    children: PropTypes.node, // Elementos hijos son opcionales y pueden ser cualquier nodo React
};

export default Column;