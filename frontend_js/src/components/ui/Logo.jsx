import React from 'react';
import Image from 'next/image';

export function Logo({ className = "", size = "default", showText = false, iconOnly = false }) {
  const sizes = {
    small: { height: 48, width: 120 },
    default: { height: 80, width: 200 },
    large: { height: 80, width: 200 }
  };

  const currentSize = sizes[size] || sizes.default;
  
  // Always use the main logo since it contains the title
  const logoSrc = "/alumnode-logo.png";

  return (
    <div className={`flex items-center ${className}`}>
      {/* AlumNode Logo Image - Contains title within the logo */}
      <Image 
        src={logoSrc}
        alt="AlumNode Logo" 
        width={currentSize.width}
        height={currentSize.height}
        className="object-contain"
        style={{ width: 'auto', height: 'auto' }}
        priority={true}
      />
    </div>
  );
}

export default Logo;
