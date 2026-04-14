export const Preloader = () => (
  <div className="fixed inset-0 z-50 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  </div>
);
