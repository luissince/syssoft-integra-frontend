export const ESTADO_PEDIDO = {
 CANCELADO: {
    id: 0,
    nombre: "CANCELADO",
    color: "bg-red-100 text-red-800"
  },
  PENDIENTE: {
    id: 1,
    nombre: "PENDIENTE",
    color: "bg-gray-100 text-gray-800"
  },
  PREPARANDO: {
    id: 2,
    nombre: "PREPARANDO",
    color: "bg-yellow-100 text-yellow-800"
  },
  LISTO: {
    id: 3,
    nombre: "LISTO",
    color: "bg-green-100 text-green-800"
  },
  ENTREGADO: {
    id: 4,
    nombre: "ENTREGADO",
    color: "bg-blue-100 text-blue-800"
  }
}

export const pedidoEstadoMap = Object.values(ESTADO_PEDIDO)
  .reduce((acc, estado) => {
    acc[estado.id] = estado;
    return acc;
  }, {});