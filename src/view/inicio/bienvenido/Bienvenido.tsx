import ContainerWrapper from '@/components/ui/container-wrapper';
import { useState } from 'react';

const Bienvenido = () => {
  const [ventasRUS, setVentasRUS] = useState<number>(5000);
  const [ventasRER, setVentasRER] = useState<number>(20000);
  const [ventasRMT, setVentasRMT] = useState<number>(50000);
  const [gastosRMT, setGastosRMT] = useState<number>(30000);
  const [ventasGeneral, setVentasGeneral] = useState<number>(100000);
  const [gastosGeneral, setGastosGeneral] = useState<number>(70000);

  // Funciones de cálculo por régimen
  const calcularRUS = (ventasMensuales: number) => {
    if (ventasMensuales <= 5000) {
      return { categoria: 1, cuota: 20, limite: 5000 };
    } else if (ventasMensuales <= 8000) {
      return { categoria: 2, cuota: 50, limite: 8000 };
    } else {
      return { categoria: 'Excede límite', cuota: 'Cambiar régimen', limite: 8000 };
    }
  };

  const calcularRER = (ventasMensuales) => {
    const ventasConIGV = ventasMensuales * 1.18;
    const igv = ventasConIGV - ventasMensuales;
    const impuestoRenta = ventasMensuales * 0.015;
    const totalPagar = igv + impuestoRenta;

    return {
      ventasConIGV: ventasConIGV.toFixed(2),
      igv: igv.toFixed(2),
      impuestoRenta: impuestoRenta.toFixed(2),
      totalPagar: totalPagar.toFixed(2)
    };
  };

  const calcularRMT = (ventasMensuales: number, gastos: number = 0) => {
    const ventasConIGV = ventasMensuales * 1.18;
    const igv = ventasConIGV - ventasMensuales;
    const impuestoRentaMensual = ventasMensuales * 0.01;

    // Cálculo anual simulado (x12 meses)
    const ventasAnuales = ventasMensuales * 12;
    const gastosAnuales = gastos * 12;
    const utilidadAnual = ventasAnuales - gastosAnuales;
    const impuestoRentaAnual = utilidadAnual * 0.10;
    const impuestoRentaPagadoMensual = impuestoRentaMensual * 12;
    const saldoPorPagar = Math.max(0, impuestoRentaAnual - impuestoRentaPagadoMensual);

    return {
      ventasConIGV: ventasConIGV.toFixed(2),
      igv: igv.toFixed(2),
      impuestoRentaMensual: impuestoRentaMensual.toFixed(2),
      utilidadAnual: utilidadAnual.toFixed(2),
      impuestoRentaAnual: impuestoRentaAnual.toFixed(2),
      saldoPorPagar: saldoPorPagar.toFixed(2)
    };
  };

  const calcularGeneral = (ventasMensuales, gastos) => {
    const ventasConIGV = ventasMensuales * 1.18;
    const igv = ventasConIGV - ventasMensuales;

    // Simulación anual
    const ventasAnuales = ventasMensuales * 12;
    const gastosAnuales = gastos * 12;
    const utilidadAnual = ventasAnuales - gastosAnuales;
    const impuestoRentaAnual = utilidadAnual * 0.295; // 29.5%
    const pagoACuenta = ventasMensuales * 0.015; // 1.5% mensual

    return {
      ventasConIGV: ventasConIGV.toFixed(2),
      igv: igv.toFixed(2),
      pagoACuenta: pagoACuenta.toFixed(2),
      utilidadAnual: utilidadAnual.toFixed(2),
      impuestoRentaAnual: impuestoRentaAnual.toFixed(2)
    };
  };

  const rusCalc = calcularRUS(ventasRUS);
  const rerCalc = calcularRER(ventasRER);
  const rmtCalc = calcularRMT(ventasRMT, gastosRMT);
  const generalCalc = calcularGeneral(ventasGeneral, gastosGeneral);

  return (
    <ContainerWrapper>
      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Bienvenido al Panel Empresarial</h1>
        <p className="text-gray-700 text-lg mb-10 max-w-3xl mx-auto">
          Centraliza y optimiza tu gestión empresarial. Controla ventas, inventario, compras, pagos, gastos y facturación electrónica desde un solo lugar. Con reportes claros y módulos intuitivos, haz crecer tu negocio con confianza.
        </p>

        {/* CALCULADORAS INTERACTIVAS POR RÉGIMEN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left max-w-7xl mx-auto mb-8">

          {/* REGÍMENES SUNAT */}
            <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-2 text-indigo-600">📑 Regímenes SUNAT</h2>
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-2">
                <li>
                  <strong>Nuevo RUS:</strong> Personas naturales con ingresos <span className="text-red-600 font-semibold">hasta S/96,000 anuales</span> o <span className="text-red-600 font-semibold">S/8,000 mensuales</span>. Solo cuota fija, sin IGV ni libros contables.
                </li>
                <li>
                  <strong>Régimen Especial (RER):</strong> Negocios con ingresos <span className="text-red-600 font-semibold">hasta S/525,000 anuales</span>. Pagan 1.5% de IR + IGV.
                </li>
                <li>
                  <strong>MYPE Tributario (RMT):</strong> Empresas con ingresos <span className="text-red-600 font-semibold">hasta 1,700 UIT anuales</span> (~S/8.7 millones). Pagan 1% de IR mensual + IGV, con opción a deducir gastos.
                </li>
                <li>
                  <strong>Régimen General:</strong> Sin límite de ingresos. IR variable según utilidad (hasta 29.5%) + IGV.
                </li>
              </ul>
            </div>

          {/* EJEMPLOS DE CÁLCULO */}
          <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-2 text-green-600">🧮 Ejemplo de cálculo</h2>
            <p className="text-sm text-gray-800 mb-2">Venta a Lima: S/1,000 + IGV (18%) = S/1,180</p>
            <p className="text-sm text-gray-800 mb-2">Venta a Selva (exonerada): S/800</p>
            <p className="text-sm text-gray-800 mb-2">Total ingresos: S/1,800</p>
            <p className="text-sm text-gray-800">IGV a pagar: S/180 | RER: S/27 (1.5%)</p>
          </div>

          {/* NUEVO RUS - CALCULADORA */}
          <div className="bg-white shadow rounded-2xl p-6 border border-purple-200">
            <h2 className="text-xl font-bold mb-3 text-purple-600">📑 Nuevo RUS - Calculadora</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ventas mensuales (sin IGV):</label>
                <input
                  type="number"
                  value={ventasRUS}
                  onChange={(e) => setVentasRUS(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  max="8000"
                />
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold text-purple-800">Resultado:</p>
                <p className="text-sm">Categoría: {rusCalc.categoria}</p>
                <p className="text-sm">Cuota mensual: S/{rusCalc.cuota}</p>
                <p className="text-sm">Límite categoría: S/{rusCalc.limite}</p>
              </div>

              {/* LIMITACIONES Y VENTAJAS RUS */}
              <div className="space-y-2">
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-red-800 text-sm font-semibold">❌ Limitaciones:</p>
                  <ul className="text-red-700 text-xs space-y-1">
                    <li>• Solo personas naturales</li>
                    <li>• Máximo S/96,000 anuales</li>
                    <li>• Solo un establecimiento</li>
                    <li>• No puedes emitir facturas</li>
                    <li>• Solo ventas locales (no exportar)</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-800 text-sm font-semibold">✅ Ventajas:</p>
                  <ul className="text-green-700 text-xs space-y-1">
                    <li>• Cuota fija mensual muy baja</li>
                    <li>• Sin libros contables</li>
                    <li>• Sin declaraciones mensuales</li>
                    <li>• Ideal para negocios pequeños</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* RER - CALCULADORA */}
          <div className="bg-white shadow rounded-2xl p-6 border border-green-200">
            <h2 className="text-xl font-bold mb-3 text-green-600">📊 RER - Calculadora</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ventas mensuales (sin IGV):</label>
                <input
                  type="number"
                  value={ventasRER}
                  onChange={(e) => setVentasRER(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-800">Cálculo mensual:</p>
                <p className="text-sm">Ventas + IGV: S/{rerCalc.ventasConIGV}</p>
                <p className="text-sm">IGV a pagar: S/{rerCalc.igv}</p>
                <p className="text-sm">Imp. Renta (1.5%): S/{rerCalc.impuestoRenta}</p>
                <p className="text-sm font-bold">Total mensual: S/{rerCalc.totalPagar}</p>
              </div>

              {/* LIMITACIONES Y VENTAJAS RER */}
              <div className="space-y-2">
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-red-800 text-sm font-semibold">❌ Limitaciones:</p>
                  <ul className="text-red-700 text-xs space-y-1">
                    <li>• Máximo S/525,000 anuales</li>
                    <li>• No puedes deducir gastos</li>
                    <li>• Solo actividades permitidas</li>
                    <li>• Máximo 10 trabajadores</li>
                    <li>• No más de S/200k en activos</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-800 text-sm font-semibold">✅ Ventajas:</p>
                  <ul className="text-green-700 text-xs space-y-1">
                    <li>• Tasa baja de IR (1.5%)</li>
                    <li>• Libros contables simples</li>
                    <li>• Proceso de declaración sencillo</li>
                    <li>• Ideal para negocios medianos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* RMT - CALCULADORA */}
          <div className="bg-white shadow rounded-2xl p-6 border border-orange-200">
            <h2 className="text-xl font-bold mb-3 text-orange-600">🧾 MYPE (RMT) - Calculadora</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ventas mensuales (sin IGV):</label>
                <input
                  type="number"
                  value={ventasRMT}
                  onChange={(e) => setVentasRMT(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos mensuales:</label>
                <input
                  type="number"
                  value={gastosRMT}
                  onChange={(e) => setGastosRMT(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-semibold text-orange-800">Pago mensual:</p>
                <p className="text-sm">IGV: S/{rmtCalc.igv}</p>
                <p className="text-sm">IR Mensual (1%): S/{rmtCalc.impuestoRentaMensual}</p>
                <p className="font-semibold text-orange-800 mt-2">Regularización anual:</p>
                <p className="text-sm">Utilidad anual: S/{rmtCalc.utilidadAnual}</p>
                <p className="text-sm">IR Anual (10%): S/{rmtCalc.impuestoRentaAnual}</p>
                <p className="text-sm font-bold">Saldo por pagar: S/{rmtCalc.saldoPorPagar}</p>
              </div>

              {/* LIMITACIONES Y VENTAJAS RMT */}
              <div className="space-y-2">
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-red-800 text-sm font-semibold">❌ Limitaciones:</p>
                  <ul className="text-red-700 text-xs space-y-1">
                    <li>• Máximo 1,700 UIT anuales (~S/8.7M)</li>
                    <li>• Actividades específicas permitidas</li>
                    <li>• Libros contables obligatorios</li>
                    <li>• Declaraciones mensuales y anuales</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-800 text-sm font-semibold">✅ Ventajas:</p>
                  <ul className="text-green-700 text-xs space-y-1">
                    <li>• Puedes deducir gastos reales</li>
                    <li>• Tasa progresiva de IR (10%)</li>
                    <li>• Mayor flexibilidad operativa</li>
                    <li>• Crecimiento hasta S/8.7M</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* RÉGIMEN GENERAL - CALCULADORA */}
          <div className="bg-white shadow rounded-2xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold mb-3 text-blue-600">🏢 Régimen General - Calculadora</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ventas mensuales (sin IGV):</label>
                <input
                  type="number"
                  value={ventasGeneral}
                  onChange={(e) => setVentasGeneral(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gastos mensuales:</label>
                <input
                  type="number"
                  value={gastosGeneral}
                  onChange={(e) => setGastosGeneral(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-800">Pago mensual:</p>
                <p className="text-sm">IGV: S/{generalCalc.igv}</p>
                <p className="text-sm">Pago a cuenta (1.5%): S/{generalCalc.pagoACuenta}</p>
                <p className="font-semibold text-blue-800 mt-2">Regularización anual:</p>
                <p className="text-sm">Utilidad anual: S/{generalCalc.utilidadAnual}</p>
                <p className="text-sm font-bold">IR Anual (29.5%): S/{generalCalc.impuestoRentaAnual}</p>
              </div>

              {/* LIMITACIONES Y VENTAJAS GENERAL */}
              <div className="space-y-2">
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-red-800 text-sm font-semibold">❌ Desventajas:</p>
                  <ul className="text-red-700 text-xs space-y-1">
                    <li>• Tasa más alta de IR (29.5%)</li>
                    <li>• Libros contables completos</li>
                    <li>• Mayores obligaciones formales</li>
                    <li>• Declaraciones más complejas</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-800 text-sm font-semibold">✅ Ventajas:</p>
                  <ul className="text-green-700 text-xs space-y-1">
                    <li>• Sin límite de ingresos</li>
                    <li>• Deducción completa de gastos</li>
                    <li>• Todas las actividades permitidas</li>
                    <li>• Facilita crecimiento empresarial</li>
                    <li>• Mejor imagen ante bancos/proveedores</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EXPLICACIÓN DE CÁLCULOS */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 max-w-6xl mx-auto mb-8">
          <h2 className="text-xl font-bold mb-4">🧮 ¿Cómo se calculan estos valores?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">IGV (Impuesto General a las Ventas):</h3>
              <p className="text-xs opacity-90 mb-2">• Se aplica 18% sobre el valor de venta</p>
              <p className="text-xs opacity-90 mb-2">• Fórmula: Venta sin IGV × 1.18 = Venta con IGV</p>
              <p className="text-xs opacity-90">• IGV = Venta con IGV - Venta sin IGV</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Impuesto a la Renta:</h3>
              <p className="text-xs opacity-90 mb-2">• RER: 1.5% sobre ventas netas mensuales</p>
              <p className="text-xs opacity-90 mb-2">• RMT: 1% mensual + 10% anual sobre utilidad</p>
              <p className="text-xs opacity-90">• General: 1.5% mensual + 29.5% anual sobre utilidad</p>
            </div>
          </div>
        </div>

        {/* RESTO DEL CONTENIDO ORIGINAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left max-w-7xl mx-auto">

          {/* CRONOGRAMA DE DECLARACIONES */}
          <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-2 text-blue-600">📅 Cronograma SUNAT 2024</h2>
            <div className="text-sm text-gray-800">
              <p className="mb-2"><strong>Según último dígito de tu RUC:</strong></p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>0 y 1: hasta el 12</div>
                <div>2 y 3: hasta el 13</div>
                <div>4 y 5: hasta el 14</div>
                <div>6 y 7: hasta el 15</div>
                <div>8 y 9: hasta el 16</div>
                <div className="col-span-2 text-center font-semibold text-red-600">Buenos Contribuyentes: hasta el 19</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded mt-3">
                <p className="text-yellow-800 text-xs"><strong>⏰ RECORDATORIO:</strong> Las fechas son del mes siguiente. Ejemplo: IGV de enero se declara hasta el 12-16 de febrero.</p>
              </div>
            </div>
          </div>

          {/* TIPO DE CAMBIO */}
          <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-2 text-blue-600">💱 Tipo de cambio (SUNAT)</h2>
            <p className="text-sm text-gray-800">Compra: S/3.75</p>
            <p className="text-sm text-gray-800">Venta: S/3.78</p>
            <div className="bg-gray-50 p-3 rounded mt-3">
              <p className="text-gray-700 text-xs"><strong>📈 USO:</strong> Para convertir operaciones en dólares a soles en tus declaraciones. Siempre usa el tipo de cambio de SUNAT del día de la operación.</p>
            </div>
          </div>

          {/* SEÑALES DE ESTAFA CONTABLE */}
          <div className="bg-white shadow rounded-2xl p-6 border border-red-200">
            <h2 className="text-xl font-bold mb-2 text-red-600">🚨 Señales de Estafa Contable</h2>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              <li><strong>Te cobran "extra" por servicios básicos</strong> incluidos en la declaración</li>
              <li><strong>No te explican</strong> cómo calculan tus impuestos</li>
              <li><strong>Evitan darte</strong> las claves de SUNAT Virtual</li>
              <li><strong>Te cobran mensualidades</strong> en Nuevo RUS (solo necesitas pagar la cuota)</li>
              <li><strong>No te entregan</strong> reportes mensuales de tus declaraciones</li>
              <li><strong>Te piden dinero extra</strong> para "acelerar" trámites gratuitos</li>
            </ul>
            <div className="bg-red-50 p-3 rounded mt-3">
              <p className="text-red-800 text-xs"><strong>💪 DEFIÉNDETE:</strong> Pide siempre explicación detallada de los cálculos y acceso a tus claves tributarias.</p>
            </div>
          </div>

          {/* TIPS PARA EMPRESARIOS */}
          <div className="bg-white shadow rounded-2xl p-6 border border-green-200">
            <h2 className="text-xl font-bold mb-2 text-green-600">💡 Tips para Empresarios</h2>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              <li><strong>Obtén tus claves SUNAT:</strong> SOL (usuario + clave) para revisar tus declaraciones</li>
              <li><strong>Guarda todos los comprobantes:</strong> facturas, boletas, recibos de servicios</li>
              <li><strong>Revisa tu régimen anualmente:</strong> cambia si tus ingresos crecen</li>
              <li><strong>Capacítate en lo básico:</strong> entiende cómo se calculan tus impuestos</li>
              <li><strong>Usa facturación electrónica:</strong> obligatoria y ayuda al control</li>
              <li><strong>Mantén libros digitales:</strong> registro de ventas y compras actualizado</li>
            </ul>
          </div>

          {/* HERRAMIENTAS GRATUITAS SUNAT */}
          <div className="bg-white shadow rounded-2xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold mb-2 text-blue-600">🛠️ Herramientas Gratuitas SUNAT</h2>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              <li><strong>SUNAT Virtual:</strong> Declaraciones, consultas, pagos online</li>
              <li><strong>App SUNAT:</strong> Consultas rápidas desde tu celular</li>
              <li><strong>Facturador gratuito:</strong> Para emitir comprobantes electrónicos</li>
              <li><strong>PLE SUNAT:</strong> Libros electrónicos gratuitos</li>
              <li><strong>Constancia de inscripción:</strong> Descargar ficha RUC actualizada</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded mt-3">
              <p className="text-blue-800 text-xs"><strong>🎯 OBJETIVO:</strong> Ser independiente en consultas básicas y no depender 100% del contador.</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE CONTACTO EMERGENCIA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-2">🆘 ¿Sospechas que te están estafando?</h2>
          <p className="text-sm mb-4">
            Si tienes dudas sobre los servicios de tu contador o necesitas una segunda opinión,
            usa nuestras calculadoras para verificar los montos que te están cobrando.
          </p>
          <p className="text-xs opacity-90">
            Recuerda: Un buen contador debe educarte, no mantenerte en la ignorancia.
            La transparencia es clave en la relación contador-cliente.
          </p>
        </div>
      </div>
    </ContainerWrapper>
  );
};

export default Bienvenido;