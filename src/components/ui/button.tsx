import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.01em] cursor-pointer transition-[transform,box-shadow,background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-gold/45 bg-[linear-gradient(135deg,#f3dda7_0%,#d7b66f_46%,#bc8d39_100%)] text-navy shadow-gold hover:-translate-y-0.5 hover:brightness-105",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-gold/45 bg-transparent text-ink shadow-sm hover:-translate-y-0.5 hover:border-gold hover:bg-accent/55 hover:text-accent-foreground",
        secondary:
          "border border-border bg-secondary text-secondary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-secondary/92",
        ghost: "text-foreground hover:bg-accent/60 hover:text-accent-foreground",
        link: "rounded-none px-0 text-moss underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-sm md:px-8",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
