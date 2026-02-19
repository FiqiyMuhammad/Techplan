export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse min-h-screen">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/50 rounded-lg"></div>
      </div>
      
      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-2 space-y-6">
           {/* Large Widget Skeleton */}
           <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
           
           {/* Grid Cards Skeleton */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
           </div>
        </div>

        {/* Sidebar/Secondary Area (Right) */}
        <div className="space-y-6">
           <div className="h-96 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
           <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}
