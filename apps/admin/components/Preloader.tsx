interface PreloaderProps {
  message?: string;
  fullscreen?: boolean;
}

export default function Preloader({
  message = "Loading...",
  fullscreen = true,
}: PreloaderProps) {
  return (
    <div
      className={`${
        fullscreen
          ? "fixed inset-0 z-50"
          : "w-full min-h-80 rounded-lg border border-gray-200"
      } bg-gray-50 flex items-center justify-center`}
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
