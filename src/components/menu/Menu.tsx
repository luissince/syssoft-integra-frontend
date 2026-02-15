import { NavLink } from 'react-router-dom';
import { images } from '../../helper';
import { isEmpty } from '../../helper/utils.helper';
import Image from '../Image';
import { useScreenSize } from '@/hooks/use-mobile';
import { MoveLeft, MoveRight } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { AuthenticateInterface } from '@/model/ts/interface/user';
import { ProjectInterface } from '@/model/ts/interface/project';

interface MenuMobileProps {
  userToken: AuthenticateInterface,
  url: string;
}

const MenuMobile = ({ userToken, url }: MenuMobileProps) => {
  const pageSize = 3;
  const [page, setPage] = useState(0);

  const activeMenus = userToken.menus.filter((menu) => menu.estado === 1);
  const totalPages = Math.ceil(activeMenus.length / pageSize);

  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  const offset = page * pageSize;
  const visibleMenus = activeMenus.slice(offset, offset + pageSize);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111827] border-white z-50 lg:hidden h-[60px]">
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

interface MenuDesktopProps {
  refSideBar: React.RefObject<HTMLDivElement>;
  userToken: AuthenticateInterface;
  url: string;
  rutaLogo: string;
  project: ProjectInterface;
}

const MenuDesktop = ({ refSideBar, userToken, url, rutaLogo, project }: MenuDesktopProps) => {

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
              className=" rounded-[50%]  block mx-auto mb-2 object-contain"
              alt={'Logo'}
              width={130}
            />
            <h6 className="m-0">GESTIONA TU EMPRESA</h6>
          </div>

          <ul className="list-unstyled components">
            <p>{project.nombre}</p>
            <div className="line"></div>
            {
              userToken.menus.map((menu, index) => {
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
              })
            }
          </ul>

          <ul className="list-unstyled sidebar-footer">
            <li>
              <span className="article">
                {userToken.usuario.informacion}
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


interface MenuProps {
  refSideBar: React.RefObject<HTMLDivElement>;
  url: string;
  rutaLogo: string;
}

const Menu = ({ refSideBar, url, rutaLogo }: MenuProps) => {
  const isScreen = useScreenSize();
  const userToken = useAppSelector((state) => state.principal.userToken);
  const project = useAppSelector((state) => state.principal.project);

  if (isScreen) {
    return (
      <MenuMobile
        userToken={userToken}
        url={url}
      />
    );
  }

  return (
    <MenuDesktop
      refSideBar={refSideBar}
      userToken={userToken}
      url={url}
      rutaLogo={rutaLogo}
      project={project}
    />
  );
};

export default Menu;
