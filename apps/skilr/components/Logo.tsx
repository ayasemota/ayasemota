export const Logo = () => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="relative">
      <div className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110">
        Skilr
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
    </div>
  </div>
);
