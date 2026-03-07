const UnderConstruction = ({ pageName }) => (
  <div className="flex h-[calc(100vh-80px)] w-full select-none items-center justify-center overflow-hidden bg-black text-white">
    <div className="text-center">
      <h1 className="mb-3 text-5xl font-black tracking-tighter lowercase">{pageName}</h1>
      <p className="max-w-sm text-white/50">
        this section is on deck and will be wired in soon
      </p>
    </div>
  </div>
);

export default UnderConstruction;
