import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  CreditCard,
  FileText,
  ClipboardCheck,
  Users,
  Calendar,
} from "lucide-react";
import ContainerWrapper from "@/components/ui/container-wrapper";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { comboSucursal, dashboardInit } from "@/network/rest/api-client";
import { CANCELED } from "@/model/types/types";
import { alertKit } from "alert-kit";
import { currentDate, isEmpty, numberFormat, rounded } from "@/helper/utils.helper";
import { connect } from "react-redux";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import BranchInterface from "@/model/ts/interface/branch.interface";
import DashboardInterface, { StatCardInterface } from "@/model/ts/interface/dashboard.interface";
import ErrorResponse from "@/model/class/error-response";
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

  const [loading, setLoading] = useState(true);

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
              className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Comercial
            </TabsTrigger>
            <TabsTrigger
              value="diario"
              className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
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