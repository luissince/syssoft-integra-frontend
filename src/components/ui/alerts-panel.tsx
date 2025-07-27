import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AlertsPanel() {
  const alerts = [
    {
      type: 'expiry',
      title: 'Lotes por Vencer',
      description: '3 lotes vencen en los próximos 15 días',
      action: 'Ver Lotes',
      link: '/produccion/lotes',
      icon: Clock,
      severity: 'high',
    },
    {
      type: 'stock',
      title: 'Stock Bajo',
      description: 'Harina de Trigo por debajo del mínimo (15kg)',
      action: 'Comprar',
      link: '/compras/nueva',
      icon: TrendingDown,
      severity: 'medium',
    },
    {
      type: 'production',
      title: 'Producción Retrasada',
      description: 'Orden #OP-002 retrasada por 1 día',
      action: 'Ver Orden',
      link: '/produccion/ordenes',
      icon: AlertCircle,
      severity: 'high',
    },
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas y Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-muted-foreground">
            No hay alertas pendientes
          </div>
        ) : (
          alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <Alert key={index} className={getSeverityStyles(alert.severity)}>
                <Icon
                  className={`h-4 w-4 ${getSeverityIcon(alert.severity)}`}
                />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.description}</span>
                  <Link to={alert.link}>
                    <Button size="sm" variant="outline" className="mt-2">
                      {alert.action}
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
