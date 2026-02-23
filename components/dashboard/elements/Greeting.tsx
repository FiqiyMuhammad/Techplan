"use client";

import React, { useState, useEffect } from "react";

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

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-aspekta tracking-tighter">
                {firstName ? `${greeting}, ${firstName}` : `${greeting}`}
            </h1>
            <p className="text-gray-500 text-base font-geist font-medium mt-1">
                {dateString}
            </p>
        </div>
    );
}
