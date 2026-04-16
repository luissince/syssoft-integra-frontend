import { ContainerMenu } from '../../../components/Container';

import Bancos from './banco/lista/Bancos';
import BancoDetalle from './banco/detalle/BancoDetalle';
import BancoAgregar from './banco/formulario/crear/BancoAgregar';
import BancoEditar from './banco/formulario/editar/BancoEditar';

import Transacciones from './transaccion/lista/Transacciones';
import { useAppSelector } from '@/redux/hooks';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

const Finanzas = () => {
  const token = useAppSelector((state) => state.principal);

  const match = useRouteMatch();

  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={token.userToken.menus[9].subMenus}
      url={match.url}
    />
  );
};

const FinanzasRoutes = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route
        path={match.path}
        exact
      >
        <Finanzas />
      </Route>

      <Route
        path={`${match.path}/bancos`}
        exact
      >
        <Bancos />
      </Route>

      <Route
        path={`${match.path}/bancos/detalle`}
        exact
      >
        <BancoDetalle />
      </Route>

      <Route
        path={`${match.path}/bancos/agregar`}
        exact
      >
        <BancoAgregar />
      </Route>

      <Route
        path={`${match.path}/bancos/editar`}
        exact
      >
        <BancoEditar />
      </Route>

      <Route
        path={`${match.path}/transacciones`}
        exact
      >
        <Transacciones />
      </Route>
    </Switch>
  );
};

export default FinanzasRoutes;
