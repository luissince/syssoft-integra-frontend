const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
        </div>
    </div>
);

const SkeletonChart = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

const DashboardSkeleton = () => {
    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-48"></div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="h-12 bg-gray-200 rounded w-32"></div>
                            <div className="flex items-center space-x-4">
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div className="h-10 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SkeletonChart />
                    <SkeletonChart />
                </div>
            </div>
        </div>
    );
};

export {
    DashboardSkeleton
}