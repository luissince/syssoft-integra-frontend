import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de fila.
 * @param {Object} props - Propiedades del componente.
 * @param {ReactNode} props.children - Elementos hijos del componente.
 * @param {string} [props.className] - Clase CSS adicional para el contenedor.
 * @param {React.Ref} ref - Referencia al elemento DOM.
 * @returns {JSX.Element} Componente de fila.
 */
const Row = forwardRef(({ className = '', children }, ref) => {
  return (
    <div ref={ref} className={`row ${className}`}>
      {children}
    </div>
  );
});

// Definir propTypes para las propiedades del componente
Row.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

// Opcional: para mejor visualización en React DevTools
Row.displayName = 'Row';

export default Row;
