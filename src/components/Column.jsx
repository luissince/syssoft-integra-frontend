import PropTypes from 'prop-types';

/**
 * Componente de columna.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.className - Clase CSS adicional para la columna.
 * @param {Object} props.refChildren - Referencia al elemento hijo.
 * @param {Object} props.formGroup - Crear un grupo de elementos.
 * @param {ReactNode} props.children - Elementos hijos del componente.
 * @returns {JSX.Element} Componente de columna.
 */
const Column = ({ className, refChildren, formGroup, children }) => {
    return (
        <div ref={refChildren} className={className ? className : "col"}>
            {formGroup && (
                <div className='form-group'>
                    {children}
                </div>
            )}
            {!formGroup && children}
        </div>
    );
}

// Definir propTypes para las propiedades del componente
Column.propTypes = {
    className: PropTypes.string, // Clase CSS adicional es opcional y debe ser una cadena
    refChildren: PropTypes.object, // Referencia al elemento hijo es opcional y debe ser un objeto
    formGroup: PropTypes.bool, // Agregar un grupo de elementos.
    children: PropTypes.node, // Elementos hijos son opcionales y pueden ser cualquier nodo React
};

export default Column;