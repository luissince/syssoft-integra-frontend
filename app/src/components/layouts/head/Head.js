import React from "react";
import { connect } from 'react-redux';
import { signOut, closeProject } from '../../../redux/actions';
import usuario from '../../../recursos/images/usuario.png';

class Menu extends React.Component {


    onEventSignIn = async (event) => {
        try {
            window.localStorage.removeItem('login');
            window.localStorage.removeItem('project');
            this.props.restore();
            this.props.history.push("login");
        } catch (e) {
            this.props.restore();
            this.props.history.push("login");
        }
    }

    onEventCloseProject() {
        window.localStorage.removeItem('project');
        this.props.close();
    }

    render() {
        return (
            <header className="app-header">
                <span className="app-sidebar__toggle" type="button" onClick={this.props.openAndClose}>
                </span>

                <ul className="app-nav">
                    <div className="dropdown">
                        <span className="app-nav__item" type="button">
                            <i className="fa fa-bell-o fa-sm  fa-sm"></i>
                            <span className="pl-1 pr-1 badge-warning rounded h7 icon-absolute ">0</span>
                        </span>
                    </div>
                    <div className="dropdown">
                        <a className="app-nav__item" href=""
                            data-bs-toggle="dropdown"
                            aria-label="Open Profile Menu"
                            aria-expanded="false"
                            type="button">
                            <img src={usuario} className="user-image" alt="Usuario" />
                        </a>
                        <ul className="dropdown-menu settings-menu dropdown-menu-right">
                            <li className="user-header">
                                <img src={usuario} className="img-circle" alt="Usuario" />
                                <p>
                                    <span>{this.props.token.userToken.nombres + " " + this.props.token.userToken.apellidos}</span>
                                    <small> <i>{this.props.token.userToken.rol}</i> </small>
                                </p>
                            </li>
                            <li className="user-footer">
                                <button className="btn btn-secondary" onClick={() => this.onEventCloseProject()}>
                                    <i className="fa fa-sign-out fa-sm" ></i> Cerrar Módulo
                                </button>

                                <button className="btn btn-secondary" onClick={() => this.onEventSignIn()}>
                                    <i className="fa fa-window-close fa-sm"></i> Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </div>
                </ul>
            </header>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        restore: () => dispatch(signOut()),
        close: () => dispatch(closeProject())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);