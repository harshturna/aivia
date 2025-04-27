const Loading = () => (
  <div className="h-screen w-screen">
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col gap-y-4 items-center">
        <div className="text-slate-600/80 flex gap-x-2">
          <p className="text-pink-400/100 animate-bounce text-6xl">.</p>
          <p className="text-pink-400/100 animate-bounce text-6xl delay-100">
            .
          </p>
          <p className="text-pink-400/100 animate-bounce text-6xl delay-200">
            .
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Loading;
