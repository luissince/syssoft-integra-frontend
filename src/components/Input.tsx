import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

/**
 * Componente Input con soporte para etiquetas, iconos y tipo color.
 *
 * @component
 * @example
 * <Input
 *   label={<>Nombre:<i className="fa fa-asterisk text-danger small"></i></>}
 *   placeholder="Ingrese el nombre"
 *   ref={this.refNombre}
 *   value={this.state.nombre}
 *   onChange={this.handleInputNombre}
 * />
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode | string; // Puede ser string o un nodo de React (JSX)
  group?: boolean; // Indica si debe envolver el input en un grupo
  iconLeft?: ReactNode; // Icono a la izquierda del input
  buttonRight?: ReactNode; // Botón a la derecha del input
  contentRight?: ReactNode; // Contenido adicional a la derecha del input
  type?: string; // Tipo de input (text, color, etc.)
  className?: string; // Clases CSS adicionales
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      group = false,
      iconLeft,
      buttonRight,
      contentRight,
      type = 'text',
      className = 'border border-primary',
      ...rest // ← Aquí van las demás props como onChange, value, etc.
    },
    ref,
  ) => {
    if (type === 'color') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <div className="d-flex align-items-center">
            <input
              type="color"
              className="h-10 w-10 border rounded"
              ref={ref}
              {...rest}
            />
          </div>
        </div>
      );
    }

    if (group) {
      return (
        <div className="flex flex-col gap-2">
          {label && (
            typeof label === "string"
              ? <label>{label}</label>
              : label
          )}
          <div className="input-group">
            {iconLeft && (
              <div className="input-group-prepend">
                <span className="btn btn-primary">{iconLeft}</span>
              </div>
            )}

            <input
              ref={ref}
              type={type}
              className={`form-control border border-primary ${className}`}
              {...rest}
            />

            {contentRight}
            {buttonRight && (
              <div className="input-group-append">{buttonRight}</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        {label && (
          typeof label === "string"
            ? <label>{label}</label>
            : label
        )}
        <input
          ref={ref}
          type={type}
          className={`form-control border border-primary ${className}`}
          {...rest}
        />
      </>
    );
  },
);

Input.displayName = 'Input';

export default Input;
