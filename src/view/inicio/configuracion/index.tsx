import { ContainerMenu } from '../../../components/Container';

import Almacenes from './almacen/Almacenes';
import AlmacenAgregar from './almacen/AlmacenAgregar';
import AlmacenEditar from './almacen/AlmacenEditar';

import Categorias from './categoria/Categorias';
import CategoriaAgregar from './categoria/CategoriaAgregar';
import CategoriaEditar from './categoria/CategoriaEditar';

import Medidas from './medida/Medidas';
import MedidaAgregar from './medida/MedidaAgregar';
import MedidaEditar from './medida/MedidaEditar';

import Monedas from './moneda/Monedas';
import MonedaAgregar from './moneda/MonedaAgregar';
import MonedaEditar from './moneda/MonedaEditar';

import Comprobantes from './comprobante/Comprobantes';
import ComprobanteAgregar from './comprobante/ComprobanteAgregar';
import ComprobanteEditar from './comprobante/ComprobanteEditar';

import Impuestos from './impuesto/Impuestos';
import ImpuestoAgregar from './impuesto/ImpuestoAgregar';
import ImpuestoEditar from './impuesto/ImpuestoEditar';

import Vehiculos from './vehiculo/Vehiculos';
import VehiculoAgregar from './vehiculo/VehiculoAgregar';
import VehiculoEditar from './vehiculo/VehiculoEditar';

import Empresa from './empresa/Empresa';
import EmpresaEditar from './empresa/EmpresaEditar';

import Sucursales from './sucursal/Sucursales';
import SucursalAgregar from './sucursal/SucursalAgregar';
import SucursalEditar from './sucursal/SucursalEditar';

import Conceptos from './concepto/Conceptos';
import ConceptoAgregar from './concepto/ConceptoAgregar';
import ConceptoEditar from './concepto/ConceptoEditar';

import Marcas from './marca/Marcas';
import MarcaAgregar from './marca/MarcaAgregar';
import MarcaEditar from './marca/MarcaEditar';

import Atributos from './atributo/Atributos';
import AtributosAgregar from './atributo/AtributosAgregar';
import AtributosEditar from './atributo/AtributosEditar';

import Ubicaciones from './ubicacion/Ubicaciones';
import UbicacionAgregar from './ubicacion/UbicacionAgregar';  
import UbicacionEditar from './ubicacion/UbicacionEditar';

import Areas from './area/Areas';
import AreaAgregar from './area/AreasAgregar';
import AreaEditar from './area/AreasEditar';

import Cargos from './cargo/Cargos';
import CargoAgregar from './cargo/CargoAgregar';
import CargoEditar from './cargo/CargoEditar';

import { useAppSelector } from '@/redux/hooks';
import { useRouteMatch } from 'react-router';

export {
  Almacenes,
  AlmacenAgregar,
  AlmacenEditar,
  
  Categorias,
  CategoriaAgregar,
  CategoriaEditar,

  Medidas,
  MedidaAgregar,
  MedidaEditar,

  Monedas,
  MonedaAgregar,
  MonedaEditar,

  Comprobantes,
  ComprobanteAgregar,
  ComprobanteEditar,

  Impuestos,
  ImpuestoAgregar,
  ImpuestoEditar,

  Vehiculos,
  VehiculoAgregar,
  VehiculoEditar,

  Empresa,
  EmpresaEditar,

  Sucursales,
  SucursalAgregar,
  SucursalEditar,
  Conceptos,

  ConceptoAgregar,
  ConceptoEditar,

  Marcas,
  MarcaAgregar,
  MarcaEditar,

  Atributos,
  AtributosAgregar,
  AtributosEditar,

  Ubicaciones,
  UbicacionAgregar,
  UbicacionEditar,

  Areas,
  AreaAgregar,
  AreaEditar,

  Cargos,
  CargoAgregar,
  CargoEditar,
};

const Configuracion = () => {
    const token = useAppSelector((state) => state.principal);
  
    const match = useRouteMatch();
  return (
    <ContainerMenu
      title="Seleccione el módulo correspondiente"
      subMenus={token.userToken.menus[6].subMenus}
           url={match.url}
    />
  );
};

export default Configuracion;
