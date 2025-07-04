import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        outline: "border-2 border-orange-200 bg-white/80 backdrop-blur-sm text-orange-700 shadow-sm hover:bg-orange-50 hover:border-orange-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-gray-700 hover:bg-gray-100/80 hover:scale-[1.02] active:scale-[0.98]",
        link: "text-orange-600 underline-offset-4 hover:underline hover:text-orange-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
