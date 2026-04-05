import { cn } from '@/lib/utils';
import { forwardRef, ReactNode, TextareaHTMLAttributes } from 'react';

interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | ReactNode;
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
      ...rest
    },
    ref
  ) => {
    const textareaElement = (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "form-control border border-primary",
          className,
        )}
        {...rest}
      />
    );

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
            {textareaElement}
            {buttonRight && (
              <div className="input-group-append">
                {buttonRight}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {label && (
          typeof label === "string"
            ? <label>{label}</label>
            : label
        )}
        {textareaElement}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;