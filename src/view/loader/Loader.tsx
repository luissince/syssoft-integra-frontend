import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { restoreToken } from "../../redux/principalSlice";
import { refreshTokenUsuario } from "@/network/rest/api-client";
import { SpinnerView } from "@/components/Spinner";

export default function Loader() {
  const dispatch = useDispatch();

  // ✅ Función para limpiar sesión
  const restoreSession = () => {
    const localStorage = window.localStorage;
    localStorage.removeItem("login");
    localStorage.removeItem("project");

    dispatch(
      restoreToken({
        token: null,
        project: null,
      })
    );
  };

  // ✅ componentDidMount → useEffect
  useEffect(() => {
    const initSession = async () => {
      const { success } = await refreshTokenUsuario();

      if (!success) {
        restoreSession();
        return;
      }

      // ✅ Acceso al localStorage
      const localStorage = window.localStorage;

      // Recuperar sesión guardada
      const login = JSON.parse(localStorage.getItem("login"));
      const project = JSON.parse(localStorage.getItem("project"));

      dispatch(
        restoreToken({
          token: login,
          project: project,
        })
      );
    };

    initSession();
  }, [dispatch]);

  return (
    <SpinnerView
      loading={true}
      message={"Cargando sesión..."}
    />

  );
}
