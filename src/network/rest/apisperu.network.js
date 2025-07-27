import axios from 'axios';
import Resolve from '../../model/class/resolve';

const instanceApisPeru = axios.create({
  baseURL: import.meta.env.VITE_APP_APIS_PERU,
  timeout: 4000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export async function getDni(documento, signal) {
  return await Resolve.create(
    instanceApisPeru.get(
      `/api/v1/dni/${documento}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFsZXhhbmRlcl9keF8xMEBob3RtYWlsLmNvbSJ9.6TLycBwcRyW1d-f_hhCoWK1yOWG_HJvXo8b-EoS5MhE`,
      {
        signal,
      },
    ),
  );
}

export async function getRuc(documento, signal) {
  return await Resolve.create(
    instanceApisPeru.get(
      `/api/v1/ruc/${documento}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFsZXhhbmRlcl9keF8xMEBob3RtYWlsLmNvbSJ9.6TLycBwcRyW1d-f_hhCoWK1yOWG_HJvXo8b-EoS5MhE`,
      {
        signal,
      },
    ),
  );
}
