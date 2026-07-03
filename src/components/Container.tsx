import React, { forwardRef, ReactNode } from 'react';
import { ButtonMenu } from './Button';
import Footer from './footer/Footer';
import Input from './Input';
import { isEmpty } from '../helper/utils.helper';
import { cn } from '@/lib/utils';

interface ContainerWrapperProps {
    className?: string;
    children: ReactNode;
}

const ContainerWrapper = forwardRef<HTMLDivElement, ContainerWrapperProps>(
    ({ className, children }, ref) => {
        return (
            <main className="mb-[60px] md:mb-0" ref={ref}>
                <div className="container-xl mx-auto mt-3">
                    <div className={cn("bg-white p-3 rounded relative", className)}>
                        {children}
                    </div>
                </div>
                <Footer />
            </main>
        );
    }
);

interface PosContainerWrapperProps {
    className?: string;
    children: ReactNode;
}

const PosContainerWrapper = forwardRef<HTMLDivElement, PosContainerWrapperProps>(
    ({ className, children }, ref) => {
        return (
            <main className="main-pos mb-[60px] md:mb-0" ref={ref}>
                <div className="h-full">
                    <div className={cn("flex relative h-full", className)}>
                        {children}
                    </div>
                </div>
            </main>
        );
    },
);

interface ContainerMenuProps {
    url: string;
    project: any;
    userToken: any;
    rutaLogo: string;
    title: string;
    subMenus: any[];
}

interface ContainerMenuState {
    search: string;
    subMenus: any[];
    cache: any[];
}

class ContainerMenu extends React.Component<ContainerMenuProps, ContainerMenuState> {

  private refContent: React.RefObject<HTMLDivElement>;
  
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      subMenus: props.subMenus,
      cache: props.subMenus,
    };

    this.refContent = React.createRef();
  }

  handleSearch = (value) => {
    this.setState({ search: value });

    if (isEmpty(value)) {
      this.setState({ subMenus: this.state.cache });
      return;
    }

    const subMenus = this.state.cache.filter((item) =>
      item.nombre.toUpperCase().includes(value.toUpperCase()),
    );
    this.setState({ subMenus });
  };

  handleFocus = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const buttons = Array.from(this.refContent.current.querySelectorAll('a'));
      if (isEmpty(buttons)) return;
      const button = buttons[0];
      button.focus();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Método de renderización
  |--------------------------------------------------------------------------
  |
  | El método render() es esencial en los componentes de React y se encarga de determinar
  | qué debe mostrarse en la interfaz de usuario basado en el estado y las propiedades actuales
  | del componente. Este método devuelve un elemento React que describe lo que debe renderizarse
  | en la interfaz de usuario. La salida del método render() puede incluir otros componentes
  | de React, elementos HTML o una combinación de ambos. Es importante que el método render()
  | sea una función pura, es decir, no debe modificar el estado del componente ni interactuar
  | directamente con el DOM. En su lugar, debe basarse únicamente en los props y el estado
  | actuales del componente para determinar lo que se mostrará.
  |
  */

  render() {
    return (
      <ContainerWrapper>
       <div className="flex flex-col items-center justify-center">
          <h4 className="my-4">{this.props.title}</h4>

          <div className="w-full border-b border-solid border-[#cbd5e1]"></div>

          <h5 className="my-3">Ingrese la opción a buscar</h5>

          <div className="w-full md:w-1/2 mb-3">
            <Input
              autoFocus={true}
              placeholder={'Buscar...'}
              value={this.state.search}
              onChange={(event) => this.handleSearch(event.target.value)}
              onKeyDown={this.handleFocus}
            />
          </div>

          <div
            ref={this.refContent}
            className="flex justify-center items-center flex-wrap w-full gap-x-14 gap-y-5"
          >
            {this.state.subMenus.map((item, index) => {
              if (item.estado === 0) return null;

              return (
                <ButtonMenu
                  key={index}
                  title={item.nombre}
                  icon={item.icon}
                  category={'Módulo'}
                  path={`${this.props.url}/${item.ruta}`}
                />
              );
            })}
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}

export {
    ContainerMenu,
    PosContainerWrapper
}

export default ContainerWrapper;