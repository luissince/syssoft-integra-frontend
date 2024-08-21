import { ButtonMenu } from './Button';
import Footer from './footer/Footer';
import PropTypes from 'prop-types';
import Input from './Input';
import React from 'react';
import { isEmpty } from '../helper/utils.helper';

const ContainerWrapper = ({ children }) => {
  return (
    <main>
      <div className="container-xl mt-3">
        <div className="bg-white p-3  rounded position-relative">
          {children}
        </div>
      </div>

      <Footer />
    </main>
  );
};

ContainerWrapper.propTypes = {
  children: PropTypes.node.isRequired
}


export const PosContainerWrapper = ({ children, className = '' }) => {
  return (
    <main className="main-pos">
      <div className="h-100">
        <div className={`d-flex position-relative h-100 ${className}`}>
          {children}
        </div>
      </div>
    </main>
  );
};

PosContainerWrapper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

/**
 * Componente que representa una funcionalidad específica.
 * @class
 * @extends React.Component
 */
export class ContainerMenu extends React.Component {

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

    const subMenus = this.state.cache.filter((item) => item.nombre.toUpperCase().includes(value.toUpperCase()),);
    this.setState({ subMenus });
  }


  handleFocus = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const buttons = Array.from(this.refContent.current.querySelectorAll('a'));
      if (isEmpty(buttons)) return;
      const button = buttons[0];
      button.focus();
    }
  }

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
        <div className="d-flex flex-column align-items-center justify-content-center">

          <h4 className="my-4">{this.props.title}</h4>

          <div className="w-100  border-bottom"></div>

          <h5 className="my-3">Ingrese la opción a buscar</h5>

          <Input
            autoFocus={true}
            placeholder={"Buscar..."}
            className="d-md-none w-100"
            value={this.state.search}
            onChange={(event) => this.handleSearch(event.target.value)}
            onKeyDown={this.handleFocus}
          />
          <Input
            autoFocus={true}
            placeholder={"Buscar..."}
            className="d-none d-md-block w-50"
            value={this.state.search}
            onChange={(event) => this.handleSearch(event.target.value)}
            onKeyDown={this.handleFocus}
          />

          <div
            ref={this.refContent}
            className="d-flex justify-content-center align-items-center flex-wrap  w-100 py-3"
            style={{
              "columnGap": "50px",
              "rowGap": "20px"
            }}>
            {
              this.state.subMenus.map((item, index) => (
                <ButtonMenu
                  key={index}
                  title={item.nombre}
                  icon={item.icon}
                  category={"Configurar"}
                  path={`${this.props.url}/${item.ruta}`}
                />
              ))
            }
          </div>
        </div>
      </ContainerWrapper>
    );
  }
}


ContainerMenu.propTypes = {
  title: PropTypes.string.isRequired,
  subMenus: PropTypes.array.isRequired,
  url: PropTypes.string.isRequired
}


export default ContainerWrapper;
