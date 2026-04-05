import { ContainerMenu } from '../../../components/Container';

import Productos from './producto/lista/Productos';
import ProductoAgregar from './producto/formularios/agregar/ProductoAgregar';
import ProductoEditar from './producto/formularios/editar/ProductoEditar';
import ProductoDetalle from './producto/detalle/ProductoDetalle';

import LogisticaAjuste from './ajuste/lista/LogisticaAjuste';
import LogisticaAjusteCrear from './ajuste/crear/LogisticaAjusteCrear';
import LogisticaAjusteDetalle from './ajuste/detalle/LogisticaAjusteDetalle';

import Traslado from './traslado/listar/Traslado';
import TrasladoCrear from './traslado/crear/TrasladoCrear';
import TrasladoDetalle from './traslado/detalle/TrasladoDetalle';

import Inventario from './inventario/Inventario';

import Kardex from './kardex/Kardex';

import Catalogos from './catalogo/lista/Catalogos';
import CatalogoCrear from './catalogo/formularios/crear/CatalogoCrear';
import CatalogoEditar from './catalogo/formularios/editar/CatalogoEditar';
import CatalogoDetalle from './catalogo/detalle/CatalogoDetalle';

import { useAppSelector } from '@/redux/hooks';
import { useRouteMatch } from "react-router-dom";

export {
  Productos,
  ProductoAgregar,
  ProductoEditar,
  ProductoDetalle,
  LogisticaAjuste,
  LogisticaAjusteCrear,
  LogisticaAjusteDetalle,
  Traslado,
  TrasladoCrear,
  TrasladoDetalle,
  Inventario,
  Kardex,
  Catalogos,
  CatalogoCrear,
  CatalogoEditar,
  CatalogoDetalle,
};

/**
 * Componente que representa una funcionalidad específica.
 * @extends React.Component
 */
const Logistica = () => {
  const token = useAppSelector((state) => state.principal);

  const match = useRouteMatch();

  return (
    <ContainerMenu
      title={'Seleccione el módulo correspondiente'}
      subMenus={token.userToken.menus[3].subMenus}
      url={match.url}
    />
  );
};

export default Logistica;
