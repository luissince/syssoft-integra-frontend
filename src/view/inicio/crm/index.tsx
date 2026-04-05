import { ContainerMenu } from '@/components/Container';

import Consultas from './consulta/lista/Consultas';
import Web from './web/index';
import { useAppSelector } from '@/redux/hooks';
import { Route, useRouteMatch } from 'react-router-dom';
import React from 'react';

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
    <>
      <Route
        path={`${match.path}`}
        exact={true}
      >
        <Crm />
      </Route>

      <Route
        path={`${match.path}/consulta`}
        exact={true}
        render={(props) => <Consultas {...props} />}
      />

      <Route path={`${match.path}/web`}>
        <Web />
      </Route>
    </>
  );
};

export default CrmRoutes;