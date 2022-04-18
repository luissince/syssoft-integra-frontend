import React from "react";
import {
    ProSidebar,
    Menu as Main,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarContent,
    SidebarFooter
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
        const { project, userToken } = this.props.token;
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
                        <div className="text-center">{project.nombre}</div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <Main >
                        {
                            userToken.menus.map((menu, index) => (
                                menu.submenu.length === 0 && menu.estado === 1 ?
                                    <MenuItem key={index} icon={<i className="bi bi-apple"></i>} id={`${menu.nombre.toLowerCase()}`}>
                                        <Link to={`${this.props.url}/${menu.nombre.toLowerCase()}`} >{menu.nombre}</Link>
                                    </MenuItem>
                                    :

                                    menu.submenu.filter(submenu => submenu.estado === 1).length !== 0 ?
                                        <SubMenu
                                            key={index}
                                            suffix={<span className="badge yellow">{menu.submenu.filter(submenu => submenu.estado === 1).length}</span>}
                                            title={menu.nombre}
                                            icon={<i className={menu.icon}></i>}>
                                            {
                                                menu.submenu.map((submenu, indexm) => (
                                                    submenu.estado === 1 ?
                                                        <MenuItem key={indexm}>
                                                            <Link to={`${this.props.url}/${submenu.nombre.toLowerCase()}`}>{submenu.nombre}</Link>
                                                        </MenuItem>
                                                        :
                                                        null
                                                ))
                                            }
                                        </SubMenu>
                                        :
                                        null
                            ))
                        }
                    </Main>
                </SidebarContent>
                <SidebarFooter className="text-center">
                    <div
                        className="sidebar-btn-wrapper"
                        style={{
                            padding: '20px 24px',
                        }}>
                        <span className="sidebar-btn">
                            {userToken.nombres + " " + userToken.apellidos}
                        </span>
                    </div>
                </SidebarFooter>
            </ProSidebar>
        );
    }
}
export default Menu;