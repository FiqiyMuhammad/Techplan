"use client"

import { motion, type Transition } from "framer-motion"
import * as React from "react"

const formatCharacter = (char: string) => (char === " " ? "\u00A0" : char)

type RollingTextProps = React.ComponentPropsWithoutRef<"span"> & {
  transition?: Transition
  text: string
}

function RollingText({
  transition = { duration: 0.25, delay: 0.02, ease: [0.215, 0.61, 0.355, 1.0] },
  text,
  ...props
}: RollingTextProps) {
  const characters = React.useMemo(() => text.split(""), [text])

  return (
    <span 
      data-slot="rolling-text" 
      {...props} 
      className={`inline-flex overflow-hidden ${props.className || ""}`}
    >
      {characters.map((char, idx) => (
        <span
          aria-hidden="true"
          className="relative inline-block"
          key={idx}
          style={{ height: '1.2em' }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{
              ...transition,
              delay: idx * (transition?.delay ?? 0.02),
            }}
          >
            {formatCharacter(char)}
          </motion.span>
          <motion.span
            className="absolute left-0 inline-block"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{
              ...transition,
              delay: idx * (transition?.delay ?? 0.02),
            }}
          >
            {formatCharacter(char)}
          </motion.span>
          {/* Invisible spacer to maintain width */}
          <span className="invisible block">{formatCharacter(char)}</span>
        </span>
      ))}

      <span className="sr-only">{text}</span>
    </span>
  )
}

export { RollingText, type RollingTextProps }
export default RollingText
