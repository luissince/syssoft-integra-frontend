import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

const DashboardSkeleton = () => {
  // Skeleton component for stat cards
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-24"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-1 w-20"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
        <div className="p-3 rounded-lg bg-gray-50">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-10"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-2"></div>
      </div>
    </div>
  );

  // Skeleton for branch performance chart
  const BranchPerformanceChartSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-6 w-48"></div>
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-300 h-2 rounded-full animate-pulse" 
                style={{ width: `${Math.random() * 60 + 20}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton for bank balance card
  const BankBalanceCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-6 w-32"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton for sales chart
  const SalesChartSkeleton = () => (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-2xl shadow-md">
      <div className="h-7 bg-gray-200 rounded animate-pulse mb-4 mx-auto w-80"></div>
      <div className="h-96 bg-gray-100 rounded-lg animate-pulse flex items-end justify-around p-4 space-x-2">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="flex space-x-1">
            <div 
              className="bg-gray-200 rounded-t animate-pulse" 
              style={{ 
                width: '12px', 
                height: `${Math.random() * 200 + 50}px` 
              }}
            ></div>
            <div 
              className="bg-gray-300 rounded-t animate-pulse" 
              style={{ 
                width: '12px', 
                height: `${Math.random() * 200 + 50}px` 
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 w-64"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-80"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 bg-white">
        <div className="flex items-center space-x-4">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <BranchPerformanceChartSkeleton />
        <BankBalanceCardSkeleton />
      </div>

      {/* Sales Chart */}
      <SalesChartSkeleton />
    </>
  );
};

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted", className)}
      {...props}
    />
  )
}

export { DashboardSkeleton, Skeleton };