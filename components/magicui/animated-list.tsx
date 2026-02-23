"use client";

import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion, MotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

export interface AnimatedListItemProps {
  children: React.ReactNode;
}

export function AnimatedListItem({ children }: AnimatedListItemProps) {
  const animations: MotionProps = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList = React.memo(
  ({ children, className, delay = 2000, ...props }: AnimatedListProps) => {
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children]
    );

    // Initial state with the first item to avoid empty start
    const [messages, setMessages] = useState<{ id: number; content: React.ReactNode }[]>(() => {
        if (childrenArray.length > 0) {
            return [{ id: 0, content: childrenArray[0] }];
        }
        return [];
    });

    useEffect(() => {
      if (childrenArray.length === 0) return;

      const interval = setInterval(() => {
        setMessages((prev) => {
          const lastId = prev.length > 0 ? prev[0].id : -1;
          const nextId = lastId + 1;
          const nextItemIndex = nextId % childrenArray.length;
          
          return [
            { id: nextId, content: childrenArray[nextItemIndex] },
            ...prev
          ].slice(0, 5);
        });
      }, delay);

      return () => clearInterval(interval);
    }, [delay, childrenArray]);

    return (
      <div
        className={cn(`flex flex-col items-center gap-4`, className)}
        {...props}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((item) => (
            <AnimatedListItem key={item.id}>
              {item.content}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";
