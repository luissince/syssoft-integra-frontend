import React from "react";
import Row from "../../../../components/Row";
import Column from "../../../../components/Column";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Select from "../../../../components/Select";
import { Card, CardBody, CardHeader, CardText, CardTitle } from "../../../../components/Card";
import { Box, DollarSign, ShoppingBag, Tag } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableResponsive, TableRow } from "../../../../components/Table";

class Reporte extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      msgLoading: "Cargando información...",
    };

    this.abortControllerView = new AbortController();
  }

  handleOpenPdf = async () => {

  }

  handleDownloadExcel = async () => {

  }

  

  render() {
    const flujoCaja = [
      { mes: 'Ene', ingresos: 450000, gastos: 320000 },
      { mes: 'Feb', ingresos: 480000, gastos: 340000 },
      { mes: 'Mar', ingresos: 520000, gastos: 360000 },
      { mes: 'Abr', ingresos: 490000, gastos: 345000 },
      { mes: 'May', ingresos: 500000, gastos: 350000 },
    ]

    const gastosPorCategoria = [
      { categoria: 'Personal', valor: 150000 },
      { categoria: 'Operaciones', valor: 100000 },
      { categoria: 'Marketing', valor: 50000 },
      { categoria: 'Administración', valor: 30000 },
      { categoria: 'Otros', valor: 20000 },
    ]


    return (
      <>
        <Row>
          <Column formGroup={true}>
            <Button
              className="btn-outline-warning"
              onClick={this.handleOpenPdf}>
              <i className="bi bi-file-earmark-pdf-fill"></i> Generar Pdf
            </Button>
            {" "}
            <Button
              className="btn-outline-success"
              onClick={this.handleDownloadExcel}>
              <i className="bi bi-file-earmark-excel-fill"></i> Generar Excel
            </Button>
            {" "}
            <Button
              className="btn-outline-light"
            >
              <i className="bi bi-arrow-clockwise"></i> Recargar Vista
            </Button>
          </Column>
        </Row>

        <Row>
          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Inicio:"}
              type="date"
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Input
              label={"Fecha de Final:"}
              type="date"
            />
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Sucursal:"}
            >
              <option value="">TODOS</option>
            </Select>
          </Column>

          <Column className="col-lg-3 col-md-3 col-sm-12 col-12" formGroup={true}>
            <Select
              label={"Usuario:"}
              value={this.state.estado}
              onChange={this.handleSelectEstado}
            >
              <option value='0'>TODOS</option>
              <option value='1'>COBRADO</option>
              <option value='2'>POR COBRAR</option>
              <option value='3'>ANULADO</option>
            </Select>
          </Column>
        </Row>

        <Row>
          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Total Productos</CardTitle>
                <Box className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>1,234</CardText>
                <p className="text-xs text-secondary">+20% desde el último mes</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Valor de Inventario</CardTitle>
                <DollarSign className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>$123,456</CardText>
                <p className="text-xs text-secondary">+5% desde el último mes</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Categorías</CardTitle>
                <Tag className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>24</CardText>
                <p className="text-xs text-secondary">2 nuevas categorías</p>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-lg-3 col-md-12 col-sm-12 col-12' formGroup={true}>
            <Card>
              <CardHeader className='d-flex flex-row align-items-center justify-content-between'>
                <CardTitle className='text-base m-0'>Marcas</CardTitle>
                <ShoppingBag className='text-secondary' />
              </CardHeader>
              <CardBody>
                <CardText>56</CardText>
                <p className="text-xs text-secondary">3 nuevas marcas</p>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart width={300} height={300} data={flujoCaja}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke="#8884d8" />
                    <Line type="monotone" dataKey="gastos" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Productos Recientes</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gastosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Productos Con Rotación Baja</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart width={300} height={300} data={flujoCaja}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke="#8884d8" />
                    <Line type="monotone" dataKey="gastos" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>

          <Column className='col-xl-6 col-lg-12' formGroup={true}>
            <Card>
              <CardBody>
                <CardTitle>Productos Sin Rotación</CardTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gastosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Column>
        </Row>

        <Row>
          <Column>
            <Card>
              <CardHeader className="d-flex justify-content-between">
                <CardTitle>Inventario y Ventas</CardTitle>
                <CardText className="text-base text-secondary">Reporte actualizado al 11/9/2024</CardText>
              </CardHeader>
              <CardBody>
                <TableResponsive>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right text-secondary" width="5%">#</TableHead>
                        <TableHead className="text-right text-secondary" width="10%">Producto</TableHead>
                        <TableHead className="text-right text-secondary" width="15%">Unidaddes Compradas</TableHead>
                        <TableHead className="text-right text-secondary" width="10%">Unidades Vendidas</TableHead>
                        <TableHead className="text-right text-secondary" width="10%">Inventario Actual</TableHead>
                        <TableHead className="text-right text-secondary" width="5%">Ganacia por Unidad</TableHead>
                        <TableHead className="text-right text-secondary" width="5%">Ganacia Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-right">1</TableCell>
                        <TableCell className="text-right">Camiseta</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">75</TableCell>
                        <TableCell className="text-right">25</TableCell>
                        <TableCell className="text-right">$10.00</TableCell>
                        <TableCell className="text-right">$750.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableResponsive>
              </CardBody>
            </Card>
          </Column>
        </Row>
      </>
    );
  }
}

export default Reporte;