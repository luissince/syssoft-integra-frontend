import React from "react";
import { Link } from "react-router-dom";
// import logoEmpresa from '../../../recursos/images/inmobiliarianav.png';
// import logoEmpresa2 from '../../../recursos/images/inmobiliarianav2.png';
// import sidebarBg from '../../../recursos/images/bg2.jpg';

const Menu = () => {

    return (
        <>
            <footer>
                <small>
                    © {new Date().getFullYear()} Desarrollado por - {' '}
                    <Link to="#" target="_blank" rel="noopener noreferrer">
                        SysSoftIntegra
                    </Link>
                </small>
                <br />
                {/* <div className="social-bagdes">
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
                </div> */}
            </footer>
        </>
    );

}
export default Menu;