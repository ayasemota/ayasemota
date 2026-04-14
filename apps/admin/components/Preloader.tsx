export default function Preloader() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
