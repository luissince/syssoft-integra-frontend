
interface web {
  idWeb: string;
  idSucursal: string;
  idAlmacen: string;
}

export default interface WebInterface {
  idAlmacen: string;
  nombre: string;

  success: boolean,
  data: web
}