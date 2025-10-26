"use client";

import { isEmpty } from "@/helper/utils.helper";
import { useMemo } from "react";

export interface Privilegio {
  idPrivilegio: string;
  nombre?: string;
  estado: number; // 1 o 0
}

export interface SubMenu {
  idSubMenu: string;
  nombre?: string;
  ruta?: string;
  icon?: string;
  estado: number;
  privilegios: Privilegio[];
}

export interface Menu {
  idMenu: string;
  nombre?: string;
  ruta?: string;
  icon?: string;
  estado: number;
  subMenus: SubMenu[];
}

/**
 * Hook para manejar y consultar los privilegios del usuario.
 * @param menus Lista de menús del usuario (por ejemplo: token.userToken.menus)
 */
export function usePrivilegios(menus?: Menu[]) {
  const data = useMemo(() => {
    if (isEmpty(menus)) return [] as Menu[];
    return menus ?? [];
  }, [menus]);

  /**
   * Obtiene el estado booleano de un privilegio específico
   */
  const getPrivilegio = (
    idMenu: string,
    idSubMenu: string,
    idPrivilegio: string,
  ): boolean => {
    try {
      const menu = data.find((m) => m.idMenu === idMenu);
      if (!menu) return false;

      const sub = menu.subMenus?.find((s) => s.idSubMenu === idSubMenu);
      if (!sub) return false;

      const priv = sub.privilegios?.find(
        (p) => p.idPrivilegio === idPrivilegio,
      );
      if (!priv) return false;

      return priv.estado === 1;
    } catch {
      return false;
    }
  };

  /**
   * Obtiene varios privilegios a la vez como objeto { idPrivilegio: boolean }
   */
  const getPrivilegios = (
    idMenu: string,
    idSubMenu: string,
    idsPrivilegios: string[],
  ): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    idsPrivilegios.forEach((id) => {
      result[id] = getPrivilegio(idMenu, idSubMenu, id);
    });
    return result;
  };

  return { getPrivilegio, getPrivilegios };
}
