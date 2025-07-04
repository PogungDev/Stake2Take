"use client"

import * as React from "react"
import { VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from "victory"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("w-full h-full", className)} {...props}>
      <VictoryChart
        theme={VictoryTheme.material}
        width={600}
        height={400}
        padding={{ top: 20, bottom: 60, left: 60, right: 20 }}
      >
        <VictoryAxis
          tickFormat={(x) => new Date(x).toLocaleDateString()}
          style={{
            tickLabels: { fontSize: 10, padding: 5, angle: -45, textAnchor: "end" },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(y) => `$${y}`}
          style={{
            tickLabels: { fontSize: 10, padding: 5 },
          }}
        />
        {children}
      </VictoryChart>
    </div>
  ),
)
Chart.displayName = "Chart"

const ChartLine = React.forwardRef<typeof VictoryLine, React.ComponentProps<typeof VictoryLine>>(
  ({ className, ...props }, ref) => <VictoryLine {...props} />,
)
ChartLine.displayName = "ChartLine"

export { Chart, ChartLine }
