import { forwardRef, ReactNode, TextareaHTMLAttributes } from 'react';

interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | ReactNode;
  rows?: number;
  group?: boolean;
  iconLeft?: ReactNode;
  buttonRight?: ReactNode;
  className?: string;
}

/**
 *
 * @example
 * <TextArea
 *   label="Descripción Corta:"
 *   rows={3}
 *   ref={refDescripcionCorta}
 *   value={descripcionCorta}
 *   onChange={handleInputDescripcionCorta}
 * />
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      rows = 3,
      group = false,
      iconLeft,
      buttonRight,
      className = 'border border-primary',
      ...rest // autoFocus, placeholder, value, onChange, etc.
    },
    ref
  ) => {
    const textareaElement = (
      <textarea
        ref={ref}
        rows={rows}
        className={`form-control border border-primary ${className}`}
        {...rest}
      />
    );

    if (group) {
      return (
        <>
          {label && <label>{label}</label>}
          <div className="input-group">
            {iconLeft && (
              <div className="input-group-prepend">
                <span className="btn btn-primary">{iconLeft}</span>
              </div>
            )}
            {textareaElement}
            {buttonRight && (
              <div className="input-group-append">
                {buttonRight}
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        {label && <label>{label}</label>}
        {textareaElement}
      </>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
