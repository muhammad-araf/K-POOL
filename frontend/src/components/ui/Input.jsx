
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = ({
    label,
    error,
    icon: Icon,
    className,
    containerClassName,
    ...props
}) => {
    return (
        <div className={twMerge("w-full space-y-1", containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-gray-900 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    className={twMerge(
                        "block w-full rounded-xl border border-gray-200 bg-white/50 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500 transition-all duration-200",
                        Icon ? "pl-10" : "pl-4",
                        error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 ml-1 animate-slide-up">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
