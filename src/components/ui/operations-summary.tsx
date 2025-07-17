import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, TrendingUp } from "lucide-react"

export function OperationsSummary() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas (Hoy)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">S/ 2,850</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-500 flex items-center">
              +15% <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
            vs. ayer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Producción (Hoy)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">350 unid.</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-500 flex items-center">
              +8% <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
            vs. ayer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilidad (Mes)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">S/ 18,500</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-500 flex items-center">
              +12% <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
            vs. mes anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lotes por Vencer</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3 lotes</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-rose-500 flex items-center">
              +1 <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
            vs. semana anterior
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
