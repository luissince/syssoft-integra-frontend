import { NavLink } from 'react-router-dom';
import { images } from '../../helper';
import { isEmpty } from '../../helper/utils.helper';
import PropTypes from 'prop-types';
import Image from '../Image';

const Menu = ({
  refSideBar,
  url,
  project,
  userToken,
  rutaLogo
}) => {
  const onEventOverlay = () => {
    refSideBar.current.classList.remove('toggled');
  };

  return (
    <nav id="sidebar" ref={refSideBar}>
      <div className="pro-sidebar-inner">
        <div className="pro-sidebar-layout">
          <div className="sidebar-header">
            <Image
              default={images.icono}
              src={rutaLogo}
              className="rounded-circle d-block mx-auto mb-2 object-contain"
              alt={"Logo"}
              width={130}
            />
            <h6 className="m-0">GESTIONA TU EMPRESA</h6>
          </div>

          <ul className="list-unstyled components">
            <p>{project.nombre}</p>
            <div className="line"></div>
            {
              userToken.menus.map((menu, index) => {
                if (isEmpty(menu.subMenus) && menu.estado === 1) {
                  return (
                    <li key={index}>
                      <NavLink
                        to={`${url}/${menu.ruta}`}
                        className="pro-inner-item"
                        activeClassName="active-link"
                        role="button"
                        id={`${menu.ruta}`}
                        onClick={() => {
                          if (refSideBar.current) {
                            refSideBar.current.classList.remove('toggled');
                          }
                        }}
                      >
                        <span className="pro-icon-wrapper">
                          <span className="pro-icon">
                            <i className={menu.icon}></i>
                          </span>
                        </span>
                        <span className="pro-item-content">{menu.nombre}</span>
                      </NavLink>
                    </li>
                  );
                }

                if (menu.subMenus.filter((submenu) => submenu.estado === 1).length !== 0) {
                  return (
                    <li key={index}>
                      <NavLink
                        to={`${url}/${menu.ruta}`}
                        className="pro-inner-item"
                        activeClassName="active-link"
                        role="button"
                        id={`${menu.ruta}`}
                        onClick={() => {
                          if (refSideBar.current) {
                            refSideBar.current.classList.remove('toggled');
                          }
                        }}
                      >
                        <span className="pro-icon-wrapper">
                          <span className="pro-icon">
                            <i className={menu.icon}></i>
                          </span>
                        </span>
                        <span className="pro-item-content">{menu.nombre}</span>
                        <span className="suffix-wrapper">
                          <span className="badge yellow">
                            {
                              menu.subMenus.filter(
                                (submenu) => submenu.estado === 1,
                              ).length
                            }
                          </span>
                        </span>
                        <span className="pro-arrow-wrapper">
                          <span className="bi bi-arrow-right-circle-fill"></span>
                        </span>
                      </NavLink>
                    </li>
                  );
                }
              })
            }

            {/* {userToken.menus.map((menu, index) => {
              if (isEmpty(menu.subMenus) && menu.estado === 1) {
                return (
                  <li key={index}>
                    <NavLink
                      to={`${url}/${menu.ruta}`}
                      className="pro-inner-item"
                      activeClassName="active-link"
                      role="button"
                      id={`${menu.ruta}`}
                    >
                      <span className="pro-icon-wrapper">
                        <span className="pro-icon">
                          {<i className={menu.icon}></i>}
                        </span>
                      </span>
                      <span className="pro-item-content">{menu.nombre}</span>
                    </NavLink>
                  </li>
                );
              }

              if (menu.subMenus.filter((submenu) => submenu.estado === 1).length !== 0) {
                return (
                  <li key={index}>
                    <a
                      href={'#mn' + index}
                      data-bs-toggle="collapse"
                      aria-expanded="false"
                      className="pro-inner-item"
                      role="button"
                    >
                      <span className="pro-icon-wrapper">
                        <span className="pro-icon">
                          {<i className={menu.icon}></i>}
                        </span>
                      </span>
                      <span className="pro-item-content">{menu.nombre}</span>
                      <span className="suffix-wrapper">
                        <span className="badge yellow">
                          {
                            menu.subMenus.filter(
                              (submenu) => submenu.estado === 1,
                            ).length
                          }
                        </span>
                      </span>
                      <span className="pro-arrow-wrapper">
                        <span className="pro-arrow"></span>
                      </span>
                    </a>

                    <ul
                      className="collapse list-unstyled transition-03"
                      id={'mn' + index}
                    >
                      {menu.subMenus.map((submenu, indexm) => {
                        const rutaCompleta = pathname;
                        const rutaBase = `${path}/${submenu.ruta}`;

                        if (rutaCompleta.toLowerCase().includes(rutaBase.toLowerCase())) {
                          if (refSideBar && refSideBar.current) {
                            const collapsibleItems =
                              refSideBar.current.querySelectorAll('ul li .pro-inner-item[data-bs-toggle="collapse"]');

                            collapsibleItems.forEach((element) => {
                              const anchorList = element.parentNode.querySelector('ul').querySelectorAll('li a');

                              anchorList.forEach((a) => {
                                if (rutaBase === a.getAttribute('href')) {
                                  const parentListItem =
                                    a.parentNode.parentNode.parentNode;
                                  const parentAnchor =
                                    parentListItem.querySelector('a');
                                  const parentUl =
                                    parentListItem.querySelector('ul');

                                  parentAnchor.setAttribute(
                                    'aria-expanded',
                                    'true',
                                  );
                                  parentAnchor.classList.remove('collapsed');
                                  parentUl.classList.add('show');
                                }
                              });
                            });
                          }
                        }

                        if (submenu.estado === 1) {
                          return (
                            <li key={indexm}>
                              <NavLink
                                to={`${url}/${submenu.ruta}`}
                                className="pro-inner-item"
                                activeClassName="active-link"
                                role="button"
                                id={`${submenu.ruta}`}
                              >
                                <span className="pro-icon-wrapper">
                                  <span className="pro-icon">
                                    <i className="fa fa-minus"></i>
                                  </span>
                                </span>
                                <span className="pro-item-content">
                                  {submenu.nombre}
                                </span>
                              </NavLink>
                            </li>
                          );
                        }

                        return <></>;
                      })}
                    </ul>
                  </li>
                );
              }

              return <></>;
            })} */}
          </ul>

          <ul className="list-unstyled sidebar-footer">
            <li>
              <span className="article">
                {userToken.nombres + ' ' + userToken.apellidos}
              </span>
            </li>
            <li className='text-center mt-3'>
              <span>VERSIÓN {import.meta.env.VITE_APP_VERSION}</span>
            </li>
          </ul>
        </div>
      </div>
      <div
        id="overlay-sidebar"
        role="button"
        tabIndex={0}
        aria-label="overlay"
        className="overlay"
        onClick={onEventOverlay}
      ></div>
    </nav>
  );
};

Menu.propTypes = {
  refSideBar: PropTypes.object,
  path: PropTypes.string,
  url: PropTypes.string,
  pathname: PropTypes.string,
  project: PropTypes.object,
  userToken: PropTypes.object,
  rutaLogo: PropTypes.string,
};


export default Menu;
