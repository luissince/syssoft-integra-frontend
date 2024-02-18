import axios from 'axios';
import Resolve from '../../model/class/resolve';

const instanceCpeSunat = axios.create({
  baseURL: import.meta.env.VITE_APP_CPE_SUNAT,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// instance.interceptors.request.use((config) => {
//   const data = JSON.parse(window.localStorage.getItem("login"));
//   if (data !== null) {
//     config.headers.Authorization = "Bearer " + data.token;
//   }
//   return config;
// });

export async function cdrStatus(data) {
  return await Resolve.create(
    instanceCpeSunat.get('/app/examples/pages/cdrStatus.php', {
      params: data,
    }),
  );
}

export async function senFactura(idVenta) {
  return await Resolve.create(
    instanceCpeSunat.get(`/api/boleta/${idVenta}`),
  );
}

export async function sendResumenDiario(idVenta) {
  return await Resolve.create(
    instanceCpeSunat.get(`/api/resumen/${idVenta}`),
  );
}

export async function sendComunicacionDeBaja(idVenta) {
  return await Resolve.create(
    instanceCpeSunat.get(`/api/comunicaciondebaja/${idVenta}`),
  );
}

export async function senGuiaRemision(idGuiaRemision) {
  return await Resolve.create(
    instanceCpeSunat.get(`/api/guiaremision/${idGuiaRemision}`),
  );
}

export async function consultarComprobante(data) {
  return await Resolve.create(
    instanceCpeSunat.get(`/api/consultar/${data.rucSol}/${data.userSol}/${data.passSol}/${data.tipo}/${data.serie}/${data.correlativo}`),
  );
}



