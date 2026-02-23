import * as React from "react"
import { ComponentPropsWithoutRef, ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className: string
  background: ReactNode
  Icon: React.ElementType
  description: string
  href: string
  cta: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[25rem] md:auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "dark:bg-background transform-gpu dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:[border:1px_solid_rgba(255,255,255,.1)]",
      className
    )}
    {...props}
  >
    <div>{background}</div>
    {(name || description) && (
      <div className="p-4">
        <div className="pointer-events-none z-10 flex flex-col gap-1">
          <Icon className="h-12 w-12 origin-left text-[#3A96F6] transition-all duration-300 ease-in-out" />
          <h3 className="text-xl font-bold font-aspekta text-gray-900 dark:text-gray-100">
            {name}
          </h3>
          <p className="max-w-lg text-gray-500 font-geist text-sm leading-relaxed">{description}</p>
        </div>

        <div className="mt-4 flex w-full flex-row items-center lg:hidden">
          <Button
            variant="link"
            asChild
            size="sm"
            className="pointer-events-auto p-0 text-[#3A96F6]"
          >
            <a href={href}>
              {cta}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </a>
          </Button>
        </div>
      </div>
    )}

    {name && (
      <div className="pointer-events-none mt-auto hidden w-full flex-row items-center p-4 lg:flex">
        <Button
          variant="link"
          asChild
          size="sm"
          className="pointer-events-auto p-0 text-[#3A96F6]"
        >
          <a href={href}>
            {cta}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
    )}

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300" />
  </div>
)

export { BentoCard, BentoGrid }
