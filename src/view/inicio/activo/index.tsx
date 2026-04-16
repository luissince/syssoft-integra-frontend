import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { ContainerMenu } from '@/components/Container';

import { useAppSelector } from '@/redux/hooks';
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
    <Switch>
      <Route
        path={match.path}
        exact
      >
        <Activo />
      </Route>

      <Route
        path={`${match.path}/bien`}
        exact
      >
        <Bienes />
      </Route>

      <Route
        path={`${match.path}/depreciacion`}
        exact
      >
        <Depreciaciones />
      </Route>

      <Route
        path={`${match.path}/depreciacion/detalle`}
        exact
      >
        <DepreciacionDetalle />
      </Route>

      <Route
        path={`${match.path}/gestiones`}
        exact
      >
        <Gestiones />
      </Route>

      <Route
        path={`${match.path}/gestiones/crear`}
        exact
      >
        <GestioneCrear />
      </Route>

      <Route
        path={`${match.path}/gestiones/editar`}
        exact
      >
        <GestioneEditar />
      </Route>

       <Route
        path={`${match.path}/gestiones/devolver`}
        exact
      >
        <GestionDevolver />
      </Route>

        <Route
        path={`${match.path}/historiales`}
        exact
      >
        <Historiales />
      </Route>
    </Switch>
  );
};

export default ActivoRoutes;
