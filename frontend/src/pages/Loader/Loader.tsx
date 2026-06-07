// E:\connectedreact\connected\frontend\src\pages\Loader\Loader.tsx
import React from "react";

interface LoaderProps {
  message?: string; // optional custom message
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-[#080b3d] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3 text-white">
       
        <div
          className="w-8 h-8 border-4 border-white/30 rounded-full animate-spin"
          style={{ borderTopColor: "#18e08a" }} // ✅ fixed semicolon
        ></div>
        <span className="text-sm text-white/70">{message}</span>
      </div>
    </div>
  );
};

export default Loader;
