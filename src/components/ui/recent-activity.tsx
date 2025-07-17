import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RecentActivity() {
  const activities = [
    {
      type: "venta",
      description: "Venta #1234 - Cliente: Juan Pérez",
      amount: "S/ 450.00",
      date: "Hoy, 10:30 AM",
    },
    {
      type: "compra",
      description: "Compra #567 - Proveedor: Distribuidora ABC",
      amount: "S/ 1,200.00",
      date: "Hoy, 09:15 AM",
    },
    {
      type: "cotizacion",
      description: "Cotización #890 - Cliente: Empresa XYZ",
      amount: "S/ 3,500.00",
      date: "Ayer, 04:45 PM",
    },
    {
      type: "traslado",
      description: "Traslado #123 - De: Principal A: Sucursal Norte",
      amount: "15 productos",
      date: "Ayer, 02:30 PM",
    },
    {
      type: "venta",
      description: "Venta #1233 - Cliente: María López",
      amount: "S/ 780.00",
      date: "Ayer, 11:20 AM",
    },
  ]

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "venta":
        return "default"
      case "compra":
        return "secondary"
      case "cotizacion":
        return "outline"
      case "traslado":
        return "destructive"
      default:
        return "default"
    }
  }

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case "venta":
        return "Venta"
      case "compra":
        return "Compra"
      case "cotizacion":
        return "Cotización"
      case "traslado":
        return "Traslado"
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Las últimas transacciones realizadas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(activity.type)}>{getBadgeLabel(activity.type)}</Badge>
                  <span className="text-xs text-muted-foreground">{activity.date}</span>
                </div>
                <p className="text-sm">{activity.description}</p>
              </div>
              <div className="font-medium">{activity.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
