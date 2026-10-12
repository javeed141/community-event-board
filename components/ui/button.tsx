import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';

    const variants = {
      default: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm',
      outline:
        'border border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-white',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-850',
      ghost: 'hover:bg-zinc-800 text-zinc-300 hover:text-white',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8 text-base',
      icon: 'h-9 w-9',
      'icon-sm': 'h-7 w-7',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

