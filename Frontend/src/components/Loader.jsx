import React from "react";

const Loader = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-white">

      <div className="flex flex-col items-center gap-4">

        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>

        <h2 className="text-sm text-gray-500 font-medium tracking-wide">
          Loading...
        </h2>

      </div>

    </div>
  );
};

export default Loader;