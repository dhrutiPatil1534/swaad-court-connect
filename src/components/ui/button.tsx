import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-warm hover:-translate-y-0.5 active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg",
        outline: "border-2 border-primary/20 bg-background hover:bg-primary/5 hover:border-primary/40 hover:shadow-warm",
        secondary: "bg-gradient-food text-secondary-foreground hover:shadow-food hover:-translate-y-0.5",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        food: "bg-gradient-primary text-primary-foreground shadow-warm hover:shadow-glow hover:scale-105 active:scale-95 overflow-hidden relative",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg hover:-translate-y-0.5",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-lg",
        cart: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-food ripple-effect",
        order: "bg-gradient-warm border-2 border-primary/30 text-foreground hover:border-primary hover:shadow-warm"
      },
      size: {
        default: "h-11 px-6 py-3 rounded-lg",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-14 rounded-xl px-8 text-base font-semibold",
        xl: "h-16 rounded-xl px-10 text-lg font-semibold",
        icon: "h-11 w-11 rounded-lg",
        "icon-sm": "h-9 w-9 rounded-md",
        "icon-lg": "h-14 w-14 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
