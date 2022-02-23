import {
    ProSidebar,
    Menu as Main,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
} from 'react-pro-sidebar';
import React, { useState } from "react";
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

    handleToggleSidebar = (value) =>{
        this.setState({toggled:value});
    }

    handleCollapsedSidebar = (value) =>{
        this.setState({collapsed:value});
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
                        <div style={{ padding: '24px', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 14, letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} >
                            INMOBILIARIA
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <Main >
                            <MenuItem
                                icon={<i className="bi bi-apple"></i>}
                                suffix={<span className="badge red">new</span>}
                            >
                                dashboard
                            </MenuItem>
                            {/* <MenuItem icon={<i className="bi bi-apple"></i>}> Seguridad</MenuItem> */}
                        
                            <SubMenu
                                suffix={<span className="badge yellow">3</span>}
                                title={'Seguridad'}
                                icon={<i className="bi bi-apple"></i>}
                            >
                                <MenuItem>Perfiles</MenuItem>
                                <MenuItem>Usuarios</MenuItem>
                                <MenuItem>Accesos</MenuItem>
                            </SubMenu>

                            <SubMenu
                                prefix={<span className="badge gray">3</span>}
                                title={'Facturacion'}
                                icon={<i className="bi bi-apple"></i>}
                            >
                                <MenuItem>submenu 1</MenuItem>
                                <MenuItem>submenu 2</MenuItem>
                                <MenuItem>submenu 3</MenuItem>
                            </SubMenu>

                            <SubMenu
                                prefix={<span className="badge gray">3</span>}
                                title={'Logistica'}
                                icon={<i className="bi bi-apple"></i>}
                            >
                                <MenuItem>submenu 1</MenuItem>
                                <MenuItem>submenu 2</MenuItem>
                                <MenuItem>submenu 3</MenuItem>
                            </SubMenu>

                            <SubMenu
                                prefix={<span className="badge gray">3</span>}
                                title={'Tesoreria'}
                                icon={<i className="bi bi-apple"></i>}
                            >
                                <MenuItem>submenu 1</MenuItem>
                                <MenuItem>submenu 2</MenuItem>
                                <MenuItem>submenu 3</MenuItem>
                            </SubMenu>

                            <SubMenu
                                prefix={<span className="badge gray">3</span>}
                                title={'Ajustes'}
                                icon={<i className="bi bi-apple"></i>}
                            >
                                <MenuItem>submenu 1</MenuItem>
                                <MenuItem>submenu 2</MenuItem>
                                <MenuItem>submenu 3</MenuItem>
                            </SubMenu>

                            <SubMenu
                                prefix={<span className="badge gray">3</span>}
                                title={'Reportes'}
                                icon={<i className="bi bi-apple"></i>}
                            >
                                <MenuItem>submenu 1</MenuItem>
                                <MenuItem>submenu 2</MenuItem>
                                <MenuItem>submenu 3</MenuItem>
                            </SubMenu>

                            {/* <SubMenu title={'multilevel'} icon={<i className="bi bi-apple"></i>}>
                                <MenuItem>submenu 1 </MenuItem>
                                <MenuItem>submenu 2 </MenuItem>
                                <SubMenu title={'submenu 3'}>
                                    <MenuItem>submenu 3.1 </MenuItem>
                                    <MenuItem>submenu 3.2 </MenuItem>
                                    <SubMenu title={'submenu 3.3'}>
                                        <MenuItem>submenu 3.3.1 </MenuItem>
                                        <MenuItem>submenu 3.3.2 </MenuItem>
                                        <MenuItem>submenu 3.3.3 </MenuItem>
                                    </SubMenu>
                                </SubMenu>
                            </SubMenu> */}
                        </Main>
                    </SidebarContent>
                </ProSidebar>
            </>
        );
    }
}
export default Menu;