

export  interface DniInterface {
  success: boolean,
  dni: string,
  nombres: string,
  apellidoPaterno: string,
  apellidoMaterno: string,
  codVerifica?: number,
  codVerificaLetra?: string
}

export  interface RucInterface {
ruc: string,
razonSocial: string,
nombreComercial?: string,
telefonos?: string[],
tipo?: string,
estado?: string,
condicion?: string,
direccion?: string,
departamento?: string,
provincia?: string,
distrito?: string,
fechaInscripcion?: string,
sistEmsion?: string,
sistContabilidad?: string,
actExterior?: string,
actEconomicas?: string[],
cpPago?: string[],
sistElectronica?: string[],
fechaEmisorFe?: string,
cpeElectronico?: string[],
fechaPle?: string,
padrones?: string[],
fechaBaja?: string,
profesion?: string,
ubigeo?: string,
capital?: string
}