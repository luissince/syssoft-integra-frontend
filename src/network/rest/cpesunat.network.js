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
    instanceCpeSunat.get(`/api/boleta/${idVenta}`, {
      params: {
        idVenta: idVenta,
      },
    }),
  );
}

export async function sendResumenDiario(idVenta) {
  return await Resolve.create(
    instanceCpeSunat.get(`/api/resumen/${idVenta}`),
  );
}

export async function senGuiaRemision(idGuiaRemision) {
  return await Resolve.create(
    instanceCpeSunat.get(`/api/guiaremision/${idGuiaRemision}`),
  );
}


export async function sendNotaCredito(idCpeSunat) {
  return await Resolve.create(
    instanceCpeSunat.get(`/app/examples/notacredito.php`, {
      params: {
        idNotaCredito: idCpeSunat,
      },
    }),
  );
}

export async function sendResumenFactura(idCpeSunat) {
  return await Resolve.create(
    instanceCpeSunat.get(`/app/examples/resumen.php`, {
      params: {
        idCobro: idCpeSunat,
      },
    }),
  );
}

export async function sendResumenNotaCredito(idCpeSunat) {
  return await Resolve.create(
    instanceCpeSunat.get(`/app/examples/resumen_nota_credito.php`, {
      params: {
        idNotaCredito: idCpeSunat,
      },
    }),
  );
}
