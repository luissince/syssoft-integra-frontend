import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  ShoppingBag,
  FileText,
  Truck,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function QuickActions() {
  const actions = [
    {
      icon: ShoppingCart,
      label: 'Nueva Venta',
      description: 'Registrar una nueva venta',
      href: '/ventas/nueva',
    },
    {
      icon: ShoppingBag,
      label: 'Nueva Compra',
      description: 'Registrar una nueva compra',
      href: '/compras/nueva',
    },
    {
      icon: FileText,
      label: 'Nueva Cotización',
      description: 'Crear una nueva cotización',
      href: '/cotizaciones/nueva',
    },
    {
      icon: Truck,
      label: 'Nueva Guía',
      description: 'Crear una guía de remisión',
      href: '/guias/nueva',
    },
    {
      icon: Package,
      label: 'Nuevo Producto',
      description: 'Registrar un nuevo producto',
      href: '/logistica/productos/nuevo',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>
          Accede rápidamente a las funciones más utilizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex flex-col items-center justify-center p-4 gap-2"
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
