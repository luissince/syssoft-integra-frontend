import React from "react";
import {
    ProSidebar,
    Menu as Main,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
} from 'react-pro-sidebar';
import {Redirect,Link, } from 'react-router-dom';

import "react-pro-sidebar/dist/css/styles.css";
import logoEmpresa from '../../../recursos/images/inmobiliarianav.png';
import logoEmpresa2 from '../../../recursos/images/inmobiliarianav2.png';
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

    setActive = (id) => {

    }

    render() {

        return (
            <>
                <ProSidebar image={this.state.image ? sidebarBg : false}
                    rtl={this.state.rtl}
                    collapsed={this.state.collapsed}
                    toggled={this.state.toggled}
                    breakPoint="md"
                    onToggle={this.handleToggleSidebar} >
                    <SidebarHeader>
                        <div style={{ padding: '24px 24px 24px 12px', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 14, letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >
                            <img src={logoEmpresa} width="50" height="50" className='mr-3' />
                            INMOBILIARIA GMYC
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <Main >
                            <MenuItem icon={<i className="bi bi-apple"></i>} id='dashboard'>
                                <Link to='/dashboard' style={{ fontWeight: 'bold' }}>Dashboard</Link>
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
                                <MenuItem id='clientes'>
                                    <Link to='/clientes' style={{ fontWeight: 'bold' }}>Clientes</Link>
                                </MenuItem>
                                <MenuItem>Ventas</MenuItem>
                                <MenuItem>Créditos</MenuItem>
                                <MenuItem> <Link to='/cobros' style={{ fontWeight: 'bold' }}>Cobros</Link></MenuItem>
                                <MenuItem>Cotizaciones</MenuItem>
                                <MenuItem>Reservas</MenuItem>
                            </SubMenu>

                            <SubMenu
                                prefix={<span className="badge gray">3</span>}
                                title={'Logistica'}
                                icon={<i className="bi bi-bar-chart-line-fill"></i>}
                            >
                                <MenuItem>submenu 1</MenuItem>
                                <MenuItem>submenu 2</MenuItem>
                                <MenuItem>submenu 3</MenuItem>
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
                                <MenuItem>submenu 1</MenuItem>
                                <MenuItem>submenu 2</MenuItem>
                                <MenuItem>submenu 3</MenuItem>
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
            </>
        );
    }
}
export default Menu;