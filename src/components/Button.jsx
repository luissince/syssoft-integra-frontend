import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Button
 *
 * Componente de botón reutilizable basado en Bootstrap.
 * Soporta todas las props estándar de un `<button>`, y permite pasar children personalizados.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.type="button"] - Tipo de botón (`button`, `submit`, etc.).
 * @param {string} [props.contentClassName] - Clases que reemplazan el estilo completo del botón.
 * @param {string} [props.className] - Clases adicionales (si no se usa `contentClassName`).
 * @param {React.ReactNode} props.children - Contenido interno del botón.
 * @param {...any} rest - Otras props estándar del botón (`onClick`, `disabled`, etc.).
 *
 * @example
 * <Button type="submit" className="btn-success">
 *   Guardar
 * </Button>
 */

const Button = forwardRef(
  (
    {
      refButton,
      contentClassName = '',
      className = '',
      type = 'button',
      children,
      ...rest // ← Aquí van las demás props como onChange, value, etc.
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={contentClassName ? contentClassName : `btn ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

Button.propTypes = {
  contentClassName: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Button;

/**
 * ButtonMenu
 *
 * Componente de botón vertical con ícono y texto, útil para accesos rápidos a secciones.
 * Usa `NavLink` de React Router para navegación interna.
 *
 * @component
 * @param {Object} props
 * @param {string} props.icon - Clase del ícono (ej. `"fa fa-cog"`).
 * @param {string} props.path - Ruta destino para navegar.
 * @param {string} props.title - Título principal del botón.
 * @param {string} props.category - Subcategoría o descripción adicional.
 *
 * @example
 * <ButtonMenu
 *   icon="fa fa-cube"
 *   path="/productos"
 *   title="Productos"
 *   category="Inventario"
 * />
 */

const ButtonMenu = ({ icon, path, title, category }) => {
  return (
    <NavLink
      to={path}
      className="d-flex flex-column align-items-center btn btn-link text-dark border-0"
    >
      <i className={`${icon} text-5xl mb-2`}></i>
      <p className="text-base m-0">{title}</p>
      <p className="text-sm text-primary m-0">{category}</p>
    </NavLink>
  );
};

ButtonMenu.propTypes = {
  icon: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
};

export { ButtonMenu };
