"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Greeting({ firstName }: { firstName: string }) {
    const [greeting, setGreeting] = useState("Welcome back");
    const [dateString, setDateString] = useState("");

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting("Good morning");
            else if (hour < 17) setGreeting("Good afternoon");
            else setGreeting("Good evening");
        };

        const updateDate = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
            };
            setDateString(now.toLocaleDateString('en-US', options));
        };

        updateGreeting();
        updateDate();
    }, []);

    const containerVariants = {
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const textVariants = {
        hidden: { opacity: 0, x: -10, filter: "blur(8px)" },
        visible: { 
            opacity: 1, 
            x: 0, 
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
        }
    };

    return (
        <motion.div variants={containerVariants}>
            <motion.h1 
                variants={textVariants}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-aspekta tracking-tighter"
            >
                {firstName ? `${greeting}, ${firstName}` : `${greeting}`}
            </motion.h1>
            <motion.p 
                variants={textVariants}
                className="text-gray-500 text-base font-geist font-medium mt-1"
            >
                {dateString}
            </motion.p>
        </motion.div>
    );
}
