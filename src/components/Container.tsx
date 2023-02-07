import React from "react";

export const Container = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="w-screen h-screen p-4 bg-skype-dark text-skype-light flex flex-col gap-y-4">
      {children}
    </div>
  );
};
