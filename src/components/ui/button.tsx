import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#4F772D] text-white shadow-sm hover:bg-[#5A8533] active:bg-[#436625] focus-visible:ring-[#4F772D] disabled:opacity-50",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600 disabled:opacity-50",
        outline:
          "border border-[#E5E7EB] bg-transparent text-[#374151] shadow-xs hover:bg-[#F9FAFB] active:bg-[#F3F4F6] focus-visible:ring-[#4F772D] disabled:opacity-50 dark:border-[#222222] dark:text-[#E5E7EB] dark:hover:bg-[#111111]",
        secondary:
          "bg-[#F3F4F6] text-[#111827] shadow-xs hover:bg-[#E5E7EB] active:bg-[#D1D5DB] focus-visible:ring-[#4F772D] disabled:opacity-50 dark:bg-[#111111] dark:text-white dark:hover:bg-[#222222]",
        ghost:
          "text-[#374151] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] focus-visible:ring-[#4F772D] disabled:opacity-50 dark:text-[#E5E7EB] dark:hover:bg-[#111111]",
        link: "text-[#4F772D] underline-offset-4 hover:underline disabled:opacity-50",
      },
      size: {
        default: "h-11 px-4 py-2 rounded-[12px]",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-[12px] px-8",
        icon: "h-11 w-11 rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin text-current size-4" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
