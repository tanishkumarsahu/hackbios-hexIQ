import React from "react";
import Image from "next/image";
import { cn } from "../../lib/utils";

const LoadingSpinner = ({ size = "default", className, text }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-3">
        <div className={cn("relative", sizeClasses[size])}>
          <Image
            src="/favicon.png"
            alt="Loading..."
            width={size === "large" ? 64 : size === "small" ? 32 : 48}
            height={size === "large" ? 64 : size === "small" ? 32 : 48}
            className="object-contain animate-pulse"
            priority
            unoptimized
          />
        </div>
        {text && (
          <p className="text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
