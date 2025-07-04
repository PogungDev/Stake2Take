import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm hover:from-orange-600 hover:to-orange-700",
        secondary: "border-transparent bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm hover:from-gray-200 hover:to-gray-300",
        destructive: "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:from-red-600 hover:to-red-700",
        outline: "border-orange-200 bg-white/80 backdrop-blur-sm text-orange-700 hover:bg-orange-50 hover:border-orange-300",
        success: "border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:from-green-600 hover:to-green-700",
        warning: "border-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm hover:from-yellow-600 hover:to-yellow-700",
        info: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-600 hover:to-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
