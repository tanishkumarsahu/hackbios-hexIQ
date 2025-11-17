import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import Image from "next/image";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transform-gpu",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 hover:-translate-y-0.5",
        outline:
          "border-2 border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:-translate-y-0.5",
        ghost: 
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg hover:shadow-sm",
        link: 
          "text-blue-600 underline-offset-4 hover:underline hover:text-blue-800 transition-colors",
        premium:
          "bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-700 before:via-blue-700 before:to-teal-700 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  loading = false,
  disabled = false,
  icon,
  rightIcon,
  children,
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="mr-2 w-4 h-4 relative animate-pulse">
          <Image
            src="/favicon.png"
            alt="Loading..."
            width={16}
            height={16}
            className="object-contain"
          />
        </div>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
