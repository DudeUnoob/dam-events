import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, asChild, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800':
          variant === 'primary',
        'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800':
          variant === 'secondary',
        'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100':
          variant === 'outline',
        'text-slate-700 hover:bg-slate-100 active:bg-slate-200':
          variant === 'ghost',
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800':
          variant === 'danger',
      },
      {
        'h-9 px-3 text-sm': size === 'sm',
        'h-11 px-5 text-base': size === 'md',
        'h-14 px-8 text-lg': size === 'lg',
      },
      className
    );

    if (asChild) {
      // When asChild is true, we clone the child element and add our className
      const child = children as React.ReactElement;
      return (
        <child.type
          {...child.props}
          className={cn(classes, child.props.className)}
          ref={ref}
        />
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
