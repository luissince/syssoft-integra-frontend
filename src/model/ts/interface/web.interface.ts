
interface web {
  idWeb: string;
  idSucursal: string;
  idAlmacen: string;
  url: string;
}

export default interface WebInterface {
  success: boolean,
  data: web
}