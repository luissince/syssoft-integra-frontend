import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { ContainerMenu } from '@/components/Container';

import Consultas from './consulta/lista/Consultas';
import Web from './web/index';
import { useAppSelector } from '@/redux/hooks';

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
        path={`${match.path}`}
        exact
      >
        <Crm />
      </Route>

      <Route
        path={`${match.path}/consulta`}
        exact
        render={(props) => <Consultas {...props} />}
      />

      <Route path={`${match.path}/web`} exact>
        <Web />
      </Route>
    </Switch>
  );
};

export default CrmRoutes;