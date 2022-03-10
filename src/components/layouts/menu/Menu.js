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
                    <div style={{ padding: '24px 24px 24px 12px', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 14, letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >
                        <img src={logoEmpresa} alt="logo" width="50" height="50" className='mr-3' />
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
                            <MenuItem>Perfiles</MenuItem>
                            <MenuItem>Usuarios</MenuItem>
                            <MenuItem>Accesos</MenuItem>
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
                            <MenuItem>
                                <Link to={`${this.props.url}/cotizaciones`} style={{ fontWeight: 'bold' }}>Cotizaciones</Link>
                            </MenuItem>
                            <MenuItem>
                                <Link to={`${this.props.url}/reservas`} style={{ fontWeight: 'bold' }}>Reservas</Link>
                            </MenuItem>
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
                            <MenuItem>submenu 1</MenuItem>
                            <MenuItem>submenu 2</MenuItem>
                            <MenuItem>submenu 3</MenuItem>
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
                                <Link to={`${this.props.url}/proyectos`}>Proyectos</Link>
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