export interface BankListInterface {
    cci: string;
    codiso: string;
    compartir: number;
    estado: number;
    id: number;
    idBanco: string;
    moneda: string;
    nombre: string;
    numCuenta: string;
    saldo: number;
    tipoCuenta: string;
}

export interface BankResponseInterface {
    result: BankListInterface[];
    total: number;
}
