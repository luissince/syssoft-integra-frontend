import React from "react";
import {
    ProSidebar,
    Menu as Main,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarContent,
} from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import logoEmpresa from '../../../recursos/images/inmobiliarianav.png';
import sidebarBg from '../../../recursos/images/bg2.jpg';

class Menu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            image: true,
            rtl: false,
            collapsed: false,
            toggled: false
        }
    }

    handleToggleSidebar = (value) => {
        this.setState({ toggled: value });
    }

    handleCollapsedSidebar = (value) => {
        this.setState({ collapsed: value });
    }

    render() {

        return (
            <ProSidebar
                image={this.state.image ? sidebarBg : false}
                rtl={this.state.rtl}
                collapsed={this.state.collapsed}
                toggled={this.state.toggled}
                breakPoint="md"
                onToggle={this.handleToggleSidebar} >
                <SidebarHeader>
                    <div className="pt-4 pb-4 pl-2 pr-2 font-weight-bold text-truncate  ">
                        <img src={logoEmpresa} alt="logo" width="70" className='mr-3' />
                        INMOBILIARIA GMYC
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <Main >
                        <MenuItem icon={<i className="bi bi-apple"></i>} id='dashboard'>
                            <Link to={`${this.props.url}/dashboard`} style={{ fontWeight: 'bold' }}>Dashboard</Link>
                        </MenuItem>

                        <SubMenu
                            suffix={<span className="badge yellow">3</span>}
                            title={'Seguridad'}
                            icon={<i className="bi bi-shield-fill-check"></i>}>
                            <MenuItem>
                                <Link to={`${this.props.url}/perfiles`} style={{ fontWeight: 'bold' }}>Perfiles</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/usuarios`} style={{ fontWeight: 'bold' }}>Usuarios</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/accesos`} style={{ fontWeight: 'bold' }}>Accesos</Link>
                            </MenuItem>
                        </SubMenu>

                        <SubMenu
                            prefix={<span className="badge gray">3</span>}
                            title={'Facturacion'}
                            icon={<i className="bi bi-file-earmark-bar-graph-fill"></i>}
                            id='facturacion'
                        >
                            <MenuItem>
                                <Link to={`${this.props.url}/clientes`} style={{ fontWeight: 'bold' }}>Clientes</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/ventas`} style={{ fontWeight: 'bold' }}>Ventas</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/creditos`} style={{ fontWeight: 'bold' }}>Creditos</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/cobros`} style={{ fontWeight: 'bold' }}>Cobros</Link>
                            </MenuItem>
                            {/* <MenuItem>
                                <Link to={`${this.props.url}/cotizaciones`} style={{ fontWeight: 'bold' }}>Cotizaciones</Link>
                            </MenuItem> */}
                            {/* <MenuItem>
                                <Link to={`${this.props.url}/reservas`} style={{ fontWeight: 'bold' }}>Reservas</Link>
                            </MenuItem> */}
                        </SubMenu>

                        <SubMenu
                            prefix={<span className="badge gray">3</span>}
                            title={'Logistica'}
                            icon={<i className="bi bi-bar-chart-line-fill"></i>}
                        >
                            <MenuItem>
                                <Link to={`${this.props.url}/manzanas`} style={{ fontWeight: 'bold' }}>Manzanas</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/lotes`} style={{ fontWeight: 'bold' }}>Lotes</Link>
                            </MenuItem>
                        </SubMenu>

                        <SubMenu
                            prefix={<span className="badge gray">3</span>}
                            title={'Tesoreria'}
                            icon={<i className="bi bi-chat-quote-fill"></i>}
                        >
                            <MenuItem>
                                <Link to={`${this.props.url}/conceptos`} style={{ fontWeight: 'bold' }}>Conceptos</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/gastos`} style={{ fontWeight: 'bold' }}>Gastos</Link>
                            </MenuItem>
                        </SubMenu>

                        <SubMenu
                            prefix={<span className="badge gray">3</span>}
                            title={'Ajustes'}
                            icon={<i className="bi bi-gear-fill"></i>}
                        >
                            <MenuItem>
                                <Link to={`${this.props.url}/comprobantes`}>Comprobantes</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/monedas`}>Monedas</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/bancos`}>Bancos</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/sedes`}>Sedes</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/proyecto`}>Proyectos</Link>
                            </MenuItem>
                        </SubMenu>

                        <SubMenu
                            prefix={<span className="badge gray">3</span>}
                            title={'Reportes'}
                            icon={<i className="bi bi-file-earmark-text-fill"></i>}
                        >
                            <MenuItem>R. Ventas</MenuItem>
                            <MenuItem>R. Financiero</MenuItem>
                            <MenuItem>R. Lotes</MenuItem>
                            <MenuItem>R. Clientes</MenuItem>
                        </SubMenu>

                    </Main>
                </SidebarContent>
            </ProSidebar>
        );
    }
}
export default Menu;