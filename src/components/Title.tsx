import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Button from './Button';

interface TitlePosProps {
  title: string;
  subTitle: string;
  icon?: JSX.Element;
  handleGoBack?: () => void;
}

const TitlePos = ({ title, subTitle, icon, handleGoBack }: TitlePosProps) => {
  return (
    <div className="min-h-[50px] border-b border-r border-solid border-[#cbd5e1]">
      <div className="flex items-center px-3 h-full gap-x-2">
        <button  role="button" onClick={handleGoBack}>
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-center gap-x-1">
          <h5>{title}</h5> <small className="text-gray-500">{subTitle} {icon}</small>
        </div>
      </div>
    </div>
  );
};

export { TitlePos };

interface HeaderAction {
  icon: JSX.Element;
  onClick: () => void;
  title?: string; // opcional: tooltip o descripción
}

interface HeaderActionsProps {
  title: string;
  actions?: HeaderAction[];
  className?: string;
  borderRight?: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  title,
  actions = [],
  className,
  borderRight = false,
}) => {
  return (
    <div
      className={cn(
        "min-h-[50px] border-b border-solid border-[#cbd5e1] bg-white",
        borderRight && "border-r",
        className
      )}
    >
      <div className="flex items-center justify-between h-full">
        <div className="pl-3">
          <h5 className="m-0">{title}</h5>
        </div>

        {actions.length > 0 && (
          <div className="flex justify-end pr-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                className="btn-link"
                onClick={action.onClick}
                title={action.title}
              >
                {action.icon}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { HeaderActions };

interface Props {
  title: string;
  subTitle: string;
  icon?: JSX.Element;
  handleGoBack?: () => void;
}

const Title = ({ title, subTitle, icon, handleGoBack }: Props) => {
  return (
    <div className="mb-4">
      <div className='flex items-center gap-2'>
        {/* Renderiza un botón de retroceso si se proporciona la función handleGoBack */}
        {handleGoBack !== undefined && (
          <button className="mr-2" role="button" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {/* Título principal */}
        <h5>{title}</h5>
        {/* Renderiza el subtítulo y el icono si se proporciona */}
        <small className="text-gray-500">
          {subTitle} {icon}
        </small>
      </div>
    </div>
  );
};

export default Title;
