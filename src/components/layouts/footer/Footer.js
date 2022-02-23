import React, { useState } from "react";
import "react-pro-sidebar/dist/css/styles.css";
import logoEmpresa from '../../../recursos/images/inmobiliarianav.png';
import logoEmpresa2 from '../../../recursos/images/inmobiliarianav2.png';
import sidebarBg from '../../../recursos/images/bg2.jpg';

const Menu = () => {

    return (
        <>
            <footer>
                <small>
                    © {new Date().getFullYear()} Desarrollado por - {' '}
                    <a target="_blank" rel="noopener noreferrer" href="">
                        SysSoftIntegra
                    </a>
                </small>
                <br />
                <div className="social-bagdes">
                    <a href="" target="_blank" rel="noopener noreferrer">
                        <img
                            alt="GitHub followers"
                            src="https://img.shields.io/github/followers/azouaoui-med?label=github&style=social"
                        />
                    </a>
                    <a href="" target="_blank" rel="noopener noreferrer">
                        <img
                            alt="Twitter Follow"
                            src="https://img.shields.io/twitter/follow/azouaoui_med?label=twitter&style=social"
                        />
                    </a>
                </div>
            </footer>
        </>
    );

}
export default Menu;