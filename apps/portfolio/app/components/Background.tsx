export default function Background() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/30 via-black to-blue-900/30 animate-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div
        className="fixed inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>
    </>
  );
}
