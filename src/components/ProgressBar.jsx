import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

/**
 * ProgressBar
 *
 * Componente reutilizable para mostrar una barra de progreso con estilos Bootstrap.
 *
 * @component
 * @param {Object} props
 * @param {number} props.value - Porcentaje actual de progreso (entre 0 y 100).
 * @param {string} [props.label] - Texto opcional a mostrar dentro de la barra (por defecto, `${value}%`).
 * @param {string} [props.className] - Clases adicionales para el contenedor de `progress-bar`.
 *
 * @returns {JSX.Element} Barra de progreso Bootstrap.
 *
 * @example
 * <ProgressBar value={25} />
 * <ProgressBar value={60} className="bg-success" label="Completado" />
 */
const ProgressBar = ({ value, label, className }) => {
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <div className="progress position-relative h-6">
      <div
        className={cn(
          "progress-bar",
          className
        )}
        role="progressbar"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
      <span
        className="position-absolute w-100 text-center top-0 left-0 font-medium leading-5"
      >
        {label !== undefined ? label : `${progress}%`}
      </span>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default ProgressBar;
