import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { restoreToken } from "../../redux/principalSlice";
import { refreshTokenUsuario } from "@/network/rest/api-client";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-6">

        {/* Dots */}
        <div className="flex space-x-2">
          <span className="h-3 w-3 animate-bounce rounded-full bg-blue-600"></span>
          <span className="h-3 w-3 animate-bounce rounded-full bg-gray-400 delay-150"></span>
          <span className="h-3 w-3 animate-bounce rounded-full bg-gray-400 delay-300"></span>
        </div>

        <h2 className="text-lg font-semibold text-gray-700">
          Cargando...
        </h2>

        <p className="text-sm text-gray-500">
          Por favor espere un momento.
        </p>
      </div>
    </div>
  );
}
