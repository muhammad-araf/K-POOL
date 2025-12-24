
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

const Card = ({ children, className, hover = false, ...props }) => {
  const Component = hover ? motion.div : 'div';
  
  return (
    <Component
      className={twMerge(
        "bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-6 relative overflow-hidden",
        hover && "hover:shadow-2xl hover:bg-white/90 transition-all cursor-pointer",
        className
      )}
      {...props}
      {...(hover ? {
        whileHover: { y: -5 },
        transition: { type: "spring", stiffness: 300 }
      } : {})}
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-primary-500/5 blur-3xl" />
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

export default Card;
