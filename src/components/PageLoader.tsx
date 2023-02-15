export const PageLoader = () => {
  //full page loader
  return (
    <div className="fixed w-screen h-screen bg-ui-dark-gray flex justify-center items-center opacity-50 z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-ui-primary"></div>
    </div>
  );
};
