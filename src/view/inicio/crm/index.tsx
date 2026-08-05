import { ContainerMenu } from '@/components/Container';
import { useAppSelector } from '@/redux/hooks';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import Consultas from './consulta/lista/Consultas';
import ConsultaDetalle from './consulta/detalle/ConsultaDetalle';
import ConsultaAgregar from './consulta/formulario/crear/ConsultaAgregar';
import ConsultaEditar from './consulta/formulario/editar/ConsultaEditar';

import WebCrm from './web/index';

export {
  Consultas,
  ConsultaDetalle,
  ConsultaAgregar,
  ConsultaEditar,
  WebCrm
};

const Crm = () => {
  const token = useAppSelector((state) => state.principal);

  const match = useRouteMatch();

  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={token.userToken.menus[10].subMenus}
      url={match.url}
    />
  );
};

const CrmRoutes = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route
        path={match.path}
        exact
      >
        <Crm />
      </Route>

      <Route
        path={`${match.path}/web`}
        exact
      >
        <WebCrm />
      </Route>

      <Route
        path={`${match.path}/consulta`}
        exact
        render={(props) => <Consultas {...props} />}
      />

      <Route
        path={`${match.path}/consulta/detalle`}
        exact
        render={(props) => <ConsultaDetalle {...props} />}
      />

      {/* <Route
        path={`${match.path}/consulta/editar`}
        exact
        render={(props) => <ConsultaEditar {...props} />}
      /> */}
    </Switch>
  );
}

export default CrmRoutes;
