import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de columna.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.className - Clase CSS adicional para la columna.
 * @param {boolean} props.formGroup - Si debe usar un grupo de formulario.
 * @param {ReactNode} props.children - Elementos hijos del componente.
 * @param {React.Ref} ref - Referencia al elemento DOM.
 * @returns {JSX.Element} Componente de columna.
 */
const Column = forwardRef(({ className, formGroup, children }, ref) => {
  return (
    <div ref={ref} className={className ? className : 'col'}>
      {formGroup ? <div className="form-group">{children}</div> : children}
    </div>
  );
});

// Definir propTypes para las propiedades del componente
Column.propTypes = {
  className: PropTypes.string,
  formGroup: PropTypes.bool,
  children: PropTypes.node,
};

// Opcional: para mejorar en React DevTools
Column.displayName = 'Column';

export default Column;
