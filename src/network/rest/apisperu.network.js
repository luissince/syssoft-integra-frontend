import axios from "axios";
import Resolve from "../../model/class/resolve";

const instanceApisPeru = axios.create({
    baseURL: process.env.REACT_APP_APIS_PERU,
    timeout: 4000,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

export async function getDni(documento) {
    return await Resolve.create(
        instanceApisPeru.get(`/api/v1/dni/${documento}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFsZXhhbmRlcl9keF8xMEBob3RtYWlsLmNvbSJ9.6TLycBwcRyW1d-f_hhCoWK1yOWG_HJvXo8b-EoS5MhE`)
    );
}

export async function getRuc(documento) {
    return await Resolve.create(
        instanceApisPeru.get(`/api/v1/ruc/${documento}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFsZXhhbmRlcl9keF8xMEBob3RtYWlsLmNvbSJ9.6TLycBwcRyW1d-f_hhCoWK1yOWG_HJvXo8b-EoS5MhE`)
    );
}