import PropTypes from 'prop-types';
import React from 'react';

/**
 * DropdownActions
 *
 * Componente reutilizable que renderiza un botón con menú desplegable de acciones.
 * Cada opción puede mostrar un ícono (imagen o componente) y ejecutar una función al hacer clic.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.iconClass="fa fa-th-list"] - Clase del ícono del botón principal.
 * @param {Array} props.options - Lista de acciones en el menú desplegable.
 * @param {string|React.Element} props.options[].image - Imagen (ruta string) o componente React para el ícono.
 * @param {string} [props.options[].tooltip] - Texto que se muestra al pasar el mouse (atributo title).
 * @param {string} props.options[].label - Texto visible de la opción.
 * @param {function} props.options[].onClick - Función a ejecutar al hacer clic en la opción.
 * @param {number} [props.options[].imgWidth=22] - Ancho en píxeles si `image` es un string.
 *
 * @returns {JSX.Element} Menú desplegable con opciones personalizadas.
 *
 * @example
 * import DropdownActions from './DropdownActions';
 * import { FaFilePdf } from 'react-icons/fa';
 *
 * const options = [
 *   {
 *     image: "/img/pdf.png",
 *     tooltip: "Descargar PDF",
 *     label: "PDF A4",
 *     onClick: () => console.log("PDF A4")
 *   },
 *   {
 *     image: <FaFilePdf className="text-danger" />,
 *     tooltip: "PDF Ticket",
 *     label: "PDF 80mm",
 *     onClick: () => console.log("PDF 80mm")
 *   }
 * ];
 *
 * return (
 *   <DropdownActions
 *     iconClass="fa fa-ellipsis-v"
 *     options={options}
 *   />
 * );
 */

const DropdownActions = ({ iconClass = 'fa fa-th-list', options = [] }) => {
  return (
    <div className="dropdown">
      <a
        className="btn btn-primary dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className={iconClass}></i>
      </a>

      <ul className="dropdown-menu">
        {options.map((opt, idx) => (
          <li key={idx}>
            <a
              className="dropdown-item d-flex align-items-center gap-2 p-2"
              href="#"
              title={opt.tooltip}
              onClick={(e) => {
                e.preventDefault();
                opt.onClick?.();
              }}
            >
              {typeof opt.image === 'string' ? (
                <img
                  src={opt.image}
                  width={opt.imgWidth || 22}
                  alt={opt.tooltip || opt.label}
                />
              ) : (
                opt.image
              )}
              <span> {opt.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

DropdownActions.propTypes = {
  iconClass: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.oneOfType([
        PropTypes.string, // URL de imagen
        PropTypes.element, // Componente React (ícono, svg, etc.)
      ]).isRequired,
      tooltip: PropTypes.string,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      imgWidth: PropTypes.number,
    }),
  ).isRequired,
};

export default DropdownActions;
