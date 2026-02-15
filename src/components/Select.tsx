import { forwardRef, useState, useEffect } from 'react';

interface SelectActiveProps {
  id: string;
  name: string;
  active?: boolean;
  background?: string;
  handleSelect: (data: { idAtributo: string; nombre: string; hexadecimal: string }) => void;
}

export const SelectActive = ({
  id,
  name,
  active = false,
  background,
  handleSelect,
}: SelectActiveProps) => {
  const [isActive, setIsActive] = useState(active);

  useEffect(() => {
    setIsActive(active || false);
  }, [active]);

  const handleSelectActive = () => {
    const newState = !isActive;
    setIsActive(newState);
    handleSelect({
      idAtributo: id,
      nombre: name,
      hexadecimal: background,
    });
  };

  return (
    <span
      className={`border border-secondary ${isActive ? 'bg-primary text-white' : 'bg-white text-secondary'
        } position-relative px-4 py-2 btn`}
      onClick={handleSelectActive}
    >
      <span
        className="btn position-absolute p-2"
        style={{
          left: '0',
          bottom: '0',
          backgroundColor: background,
        }}
      />
      {name}
    </span>
  );
};


// -----------------------------------------

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string | React.ReactNode;
  id?: string;
  group?: boolean;
  iconLeft?: React.ReactNode;
  buttonRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  id,
  group = false,
  iconLeft,
  buttonRight,
  className = 'border border-primary',
  children,
  ...rest
},
  ref,
) => {
  const selectElement = (
    <select
      id={id}
      ref={ref}
      className={`form-control border border-primary ${className}`}
      {...rest}
    >
      {children}
    </select>
  );

  if (group) {
    return (
      <>
        {label && <label htmlFor={id}>{label}</label>}
        <div className="input-group">
          {iconLeft && (
            <div className="input-group-prepend">
              <span className="btn btn-primary">{iconLeft}</span>
            </div>
          )}
          {selectElement}
          {buttonRight && (
            <div className="input-group-append">{buttonRight}</div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      {selectElement}
    </>
  );
},
);

Select.displayName = 'Select';

export default Select;
