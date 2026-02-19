export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md">
        {children}
        
        <div className="mt-8 text-center text-xs text-gray-500">
           &copy; {new Date().getFullYear()} TechPlan. All rights reserved.
        </div>
      </div>
    </div>
  );
}
