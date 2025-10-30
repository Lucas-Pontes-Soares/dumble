import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-[#E5E5E5] relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {/*<div className="absolute top-1/4 h-1/4 w-[92%] bg-[#FBE56D] z-20 ml-6 mr-6" style={{ transform: `translateX(-${100 - (value || 0)}%)` }}/>*/}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-[#FFC800] h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
