import { ContainerMenu } from '@/components/Container';

import { useAppSelector } from '@/redux/hooks';
import { Route, useRouteMatch } from 'react-router-dom';
import Bienes from './bien/Bienes';

import Depreciaciones from './depreciacion/Depreciaciones';
import DepreciacionDetalle from './depreciacion/DepreciacionDetalle';

import Gestiones from './gestion/Gestiones';
import GestioneCrear from './gestion/GestionCrear';
import GestioneEditar from './gestion/GestionEditar';
import GestionDevolver from './gestion/GestionDevolver';
import Historiales from './historial/Historiales';

const Activo = () => {
  const token = useAppSelector((state) => state.principal);

  const match = useRouteMatch();

  return (
    <ContainerMenu
      title="Seleccione el módulo correspondiente"
      subMenus={token.userToken.menus[11].subMenus}
      url={match.url}
    />
  );
};

const ActivoRoutes = () => {
  const match = useRouteMatch();
  return (
    <>
      <Route
        path={match.path}
        exact={true}
      >
        <Activo />
      </Route>

      <Route
        path={`${match.path}/bien`}
        exact={true}
      >
        <Bienes />
      </Route>

      <Route
        path={`${match.path}/depreciacion`}
        exact={true}
      >
        <Depreciaciones />
      </Route>

      <Route
        path={`${match.path}/depreciacion/detalle`}
        exact={true}
      >
        <DepreciacionDetalle />
      </Route>

      <Route
        path={`${match.path}/gestiones`}
        exact={true}
      >
        <Gestiones />
      </Route>

      <Route
        path={`${match.path}/gestiones/crear`}
        exact={true}
      >
        <GestioneCrear />
      </Route>

      <Route
        path={`${match.path}/gestiones/editar`}
        exact={true}
      >
        <GestioneEditar />
      </Route>

       <Route
        path={`${match.path}/gestiones/devolver`}
        exact={true}
      >
        <GestionDevolver />
      </Route>

        <Route
        path={`${match.path}/historiales`}
        exact={true}
      >
        <Historiales />
      </Route>
    </>
  );
};

export default ActivoRoutes;
