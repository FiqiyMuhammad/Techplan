"use client"

import { motion, type Transition } from "framer-motion"
import * as React from "react"
import { cn } from "@/lib/utils"

type RollingIconProps = {
  icon: React.ElementType
  className?: string
  iconClassName?: string
  transition?: Transition
}

function RollingIcon({
  icon: Icon,
  className,
  iconClassName,
  transition = { duration: 0.3, ease: [0.215, 0.61, 0.355, 1.0] },
}: RollingIconProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={transition}
      >
        <Icon className={iconClassName} />
      </motion.div>
      <motion.div
        className="absolute top-0 left-0"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={transition}
      >
        <Icon className={iconClassName} />
      </motion.div>
    </div>
  )
}

export { RollingIcon }
export default RollingIcon
