
export interface AuthenticateInterface {
    token: string;
    menus: Array<{
        idMenu: string;
        nombre: string;
        ruta: string;
        estado: number;
        icon: string;
        subMenus: Array<{
            estado: number;
            idMenu: string;
            idSubMenu: string;
            nombre: string;
            ruta: string;
            icon: string;
            privilegios: Array<{
                estado: number;
                idMenu: string;
                idPrivilegio: string;
                idSubMenu: string;
                nombre: string;
            }>
        }>
    }>;
    usuario: {
        idUsuario: string;
        estado: number;
        idPerfil: string;
        perfil: string;
        informacion: string;
    }
}


export interface UserListInterface {
    idUsuario: string;
    id: number;
    estado: number;
    informacion: string;
    celular: string;
    email: string;
    perfil: string;
}

export interface UserResponseInterface {
    result: UserListInterface[];
    total: number;
}

export interface UserGetInterface {
    idUsuario: string;
    idPerfil: string;
    estado: number;
    usuario: string;
}

