export function RecentActivity() {
  const activities = [
    {
      type: 'venta',
      description: 'Venta #1234 - Cliente: Juan Pérez',
      amount: 'S/ 450.00',
      date: 'Hoy, 10:30 AM',
    },
    {
      type: 'compra',
      description: 'Compra #567 - Proveedor: Distribuidora ABC',
      amount: 'S/ 1,200.00',
      date: 'Hoy, 09:15 AM',
    },
    {
      type: 'cotizacion',
      description: 'Cotización #890 - Cliente: Empresa XYZ',
      amount: 'S/ 3,500.00',
      date: 'Ayer, 04:45 PM',
    },
    {
      type: 'traslado',
      description: 'Traslado #123 - De: Principal A: Sucursal Norte',
      amount: '15 productos',
      date: 'Ayer, 02:30 PM',
    },
    {
      type: 'venta',
      description: 'Venta #1233 - Cliente: María López',
      amount: 'S/ 780.00',
      date: 'Ayer, 11:20 AM',
    },
  ];

  const getBadgeClasses = (type) => {
    switch (type) {
      case 'venta':
        return 'bg-blue-100 text-blue-800';
      case 'compra':
        return 'bg-gray-100 text-gray-800';
      case 'cotizacion':
        return 'bg-transparent text-gray-800 border border-gray-500';
      case 'traslado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case 'venta':
        return 'Venta';
      case 'compra':
        return 'Compra';
      case 'cotizacion':
        return 'Cotización';
      case 'traslado':
        return 'Traslado';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
            <p className="text-sm text-gray-600 mt-1">
              Las últimas transacciones realizadas en el sistema
            </p>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {activities.map((activity, index) => (
            <div key={index} className="py-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBadgeClasses(activity.type)}`}>
                      {getBadgeLabel(activity.type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {activity.date}
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-600">{activity.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
