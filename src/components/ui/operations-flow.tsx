'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  Factory,
  Package,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function OperationsFlow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Compras',
      description: 'Adquisición de materias primas',
      icon: ShoppingBag,
      link: '/compras/nueva',
      status: 'normal',
      count: 12,
    },
    {
      id: 2,
      title: 'Producción',
      description: 'Fabricación de productos',
      icon: Factory,
      link: '/produccion/ordenes',
      status: 'alert',
      count: 5,
    },
    {
      id: 3,
      title: 'Almacén',
      description: 'Gestión de inventario',
      icon: Package,
      link: '/logistica/inventario',
      status: 'warning',
      count: 8,
    },
    {
      id: 4,
      title: 'Ventas',
      description: 'Comercialización de productos',
      icon: ShoppingCart,
      link: '/ventas/nueva',
      status: 'normal',
      count: 24,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alert':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flujo de Operaciones</CardTitle>
        <CardDescription>
          Visualización del proceso completo de negocio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              <div
                className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                  activeStep === step.id
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/20'
                }`}
                onClick={() =>
                  setActiveStep(activeStep === step.id ? null : step.id)
                }
              >
                <step.icon className="h-8 w-8 text-muted-foreground" />
                <Badge
                  className={`absolute -top-2 -right-2 ${getStatusColor(
                    step.status,
                  )}`}
                >
                  {step.count}
                </Badge>
              </div>
              <h3 className="mt-2 text-center font-medium">{step.title}</h3>
              <p className="text-center text-xs text-muted-foreground">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="my-2 hidden md:block">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {activeStep && (
          <div className="mt-6 rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {steps.find((s) => s.id === activeStep)?.title}
              </h3>
              <Link to={steps.find((s) => s.id === activeStep)?.link || '#'}>
                <Button size="sm">
                  Ir a {steps.find((s) => s.id === activeStep)?.title}
                </Button>
              </Link>
            </div>

            {activeStep === 1 && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">
                    Materias primas por comprar:
                  </span>{' '}
                  3 ingredientes bajo stock mínimo
                </p>
                <p className="text-sm">
                  <span className="font-medium">Última compra:</span> 15/05/2023
                  - Harina (200kg), Azúcar (100kg)
                </p>
                <p className="text-sm">
                  <span className="font-medium">Proveedores activos:</span> 8
                  proveedores
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Órdenes en proceso:</span> 3
                  órdenes (450 unidades)
                </p>
                <p className="text-sm">
                  <span className="font-medium">Órdenes pendientes:</span> 2
                  órdenes (250 unidades)
                </p>
                <p className="text-sm text-red-500 font-medium">
                  Alerta: Orden #OP-002 retrasada (1 día)
                </p>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Productos en stock:</span> 1,245
                  unidades
                </p>
                <p className="text-sm">
                  <span className="font-medium">
                    Lotes por vencer (30 días):
                  </span>{' '}
                  3 lotes
                </p>
                <p className="text-sm text-yellow-500 font-medium">
                  Advertencia: Espacio de almacén al 85% de capacidad
                </p>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Ventas de hoy:</span> 24 ventas
                  (S/ 2,850)
                </p>
                <p className="text-sm">
                  <span className="font-medium">Producto más vendido:</span>{' '}
                  Turrón Clásico (85 unidades)
                </p>
                <p className="text-sm">
                  <span className="font-medium">Clientes atendidos:</span> 18
                  clientes
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
