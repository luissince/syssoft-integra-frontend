import { NavLink } from 'react-router-dom';
import { images } from '../../helper';
import { isEmpty } from '../../helper/utils.helper';
import PropTypes from 'prop-types';
import Image from '../Image';
import { useScreenSize } from '@/hooks/use-mobile';
import { MoveLeft, MoveRight } from 'lucide-react';
import { useState } from 'react';

const MenuMobile = ({ menus, url }) => {
  const pageSize = 3;
  const [page, setPage] = useState(0);

  const activeMenus = menus.filter((menu) => menu.estado === 1);
  const totalPages = Math.ceil(activeMenus.length / pageSize);

  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  const offset = page * pageSize;
  const visibleMenus = activeMenus.slice(offset, offset + pageSize);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111827] border-white z-50 lg:hidden ">
        <div className="flex justify-between mx-auto">
          {hasPrev && (
            <button
              onClick={() => setPage(prev => prev - 1)}
              className="w-full flex flex-col items-center px-2 py-2 text-gray-400 hover:text-white"
            >
              <MoveLeft className="h-6 w-6" />
              <span className="text-xs mt-1">Atrás</span>
            </button>
          )}

          {visibleMenus.map((menu, index) => (
            <NavLink
              key={index}
              to={`${url}/${menu.ruta}`}
              className="w-full flex flex-col items-center px-2 py-2 text-gray-400 hover:text-white"
              activeClassName="text-white bg-[#004099]"
            >
              <i className={`${menu.icon} text-xl`} />
              <span className="text-xs mt-1">{menu.nombre}</span>
            </NavLink>
          ))}


          {hasNext && (
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="w-full flex flex-col items-center px-2 py-2 text-gray-400 hover:text-white"
            >
              <MoveRight className="h-6 w-6" />
              <span className="text-xs mt-1">Más</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

const MenuDesktop = ({ refSideBar, url, menus, nombres, apellidos, rutaLogo, project }) => {

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
              alt={'Logo'}
              width={130}
            />
            <h6 className="m-0">GESTIONA TU EMPRESA</h6>
          </div>

          <ul className="list-unstyled components">
            <p>{project.nombre}</p>
            <div className="line"></div>
            {menus.map((menu, index) => {
              if (isEmpty(menu.subMenus) && menu.estado == 1) {
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

              if (
                menu.subMenus.filter((submenu) => submenu.estado == 1)
                  .length !== 0
              ) {
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
                              (submenu) => submenu.estado == 1,
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
            })}
          </ul>

          <ul className="list-unstyled sidebar-footer">
            <li>
              <span className="article">
                {nombres + ' ' + apellidos}
              </span>
            </li>
            <li className="text-center mt-3">
              <span>VERSIÓN {__APP_VERSION__}</span>
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
}

const Menu = ({ refSideBar, url, pathname, project, userToken, rutaLogo }) => {
  const isScreen = useScreenSize();

  if (isScreen) {
    return (
      <MenuMobile
        menus={userToken.menus}
        url={url}
      />
    );
  }

  return (
    <MenuDesktop
      refSideBar={refSideBar}
      url={url}
      menus={userToken.menus}
      nombres={userToken.nombres}
      apellidos={userToken.apellidos}
      rutaLogo={rutaLogo}
      project={project}
    />
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
