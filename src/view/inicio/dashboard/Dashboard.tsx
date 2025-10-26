import { useState } from "react";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { connect } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CommercialDashboard from "./component/CommercialDashboard";
import DailySalesDashboard from "./component/DailySalesDashboard";

interface Props {
  token: {
    project: {
      idSucursal: string;
    };
  };
  moneda: {
    codiso: string;
  };
}

const Dashboard = ({ token, moneda }: Props) => {

  const [activeTab, setActiveTab] = useState("comercial");


  // if (loading) {
  //   return (
  //     <ContainerWrapper>
  //       <DashboardSkeleton />
  //     </ContainerWrapper>
  //   );
  // }

  return (
    <ContainerWrapper>
      <Tabs defaultValue="comercial" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Selecciona la vista que deseas visualizar</p>
          </div>
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="comercial"
              className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >   
              Comercial
            </TabsTrigger>
            <TabsTrigger    
              value="diario"
              className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              Ventas Diarias
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="comercial">
          <CommercialDashboard token={token} moneda={moneda} />
        </TabsContent>

        <TabsContent value="diario">
          <DailySalesDashboard token={token} moneda={moneda}/>
        </TabsContent>
      </Tabs>

    </ContainerWrapper>
  );
};

const mapStateToProps = (state: {
  principal: any;
  predeterminado: any;
}) => {
  return {
    token: state.principal,
    moneda: state.predeterminado.moneda,
  };
};

const ConnectedDashboard = connect(mapStateToProps, null)(Dashboard);

export default ConnectedDashboard;