const NotFoundPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#f8faf7] px-6 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
      <div className="rounded-[28px] border border-[#d7e1d8] bg-white px-10 py-12 shadow-[0_18px_48px_rgba(32,55,41,0.08)] motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
        <h1 className="font-['Fraunces'] text-6xl font-semibold tracking-[-0.06em] text-[#284734]">404</h1>
        <p className="mt-3 text-lg text-[#617466]">Page not found</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
