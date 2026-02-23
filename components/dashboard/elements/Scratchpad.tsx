"use client";

import React, { useState, useEffect } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveQuickNote, getQuickNote } from "@/lib/actions/note-actions";

export function Scratchpad() {
    const [note, setNote] = useState("");
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadNote() {
            try {
                const content = await getQuickNote();
                if (content !== null) setNote(content);
            } catch (error) {
                console.error("Failed to load note:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadNote();
    }, []);

    const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNote(val);
        setSaved(false);
    };

    const handleBlur = async () => {
        if (note.trim()) {
            try {
                await saveQuickNote(note);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } catch (error) {
                console.error("Failed to save note:", error);
            }
        }
    };

    return (
        <div 
            className="h-full min-h-[300px] bg-yellow-50 dark:bg-yellow-600/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-6 flex flex-col relative group shadow-sm transition-all"
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500 font-bold text-[11px]">
                    <PencilSquareIcon className="w-4 h-4" />
                    <span>Scratchpad</span>
                </div>
                {saved && <span className="text-[10px] font-bold text-yellow-600/50 animate-pulse transition-opacity">Saved</span>}
            </div>
            <Textarea 
                value={note}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                placeholder={isLoading ? "Loading note..." : "Type anything here... Everything is saved automatically."} 
                className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 resize-none text-[15px] font-medium text-gray-800 dark:text-gray-200 placeholder:text-yellow-700/40 dark:placeholder:text-yellow-500/30 leading-relaxed p-0 shadow-none m-0"
            />
            <div className="mt-4 pt-4 border-t border-yellow-200/50 dark:border-yellow-900/20 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-yellow-700/40 font-bold">Autosaves to cloud database</span>
                    <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px] text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-900" 
                    onClick={async () => {
                        setNote("");
                        try {
                            await saveQuickNote("");
                            setSaved(true);
                            setTimeout(() => setSaved(false), 2000);
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                >
                    Clear Notepad
                </Button>
            </div>
        </div>
    )
}
