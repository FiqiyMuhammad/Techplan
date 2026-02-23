"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ListTodo,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    getTodos, 
    addTodo, 
    toggleTodo, 
    deleteTodo
} from "@/lib/actions/todo-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Todo {
    id: string;
    task: string;
    isCompleted: boolean | null;
}

export function ToDoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTask, setNewTask] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        async function fetchTodos() {
            try {
                const data = await getTodos();
                setTodos(data as Todo[]);
            } catch (error) {
                console.error("Failed to fetch todos:", error);
                toast.error("Failed to load tasks");
            } finally {
                setIsLoading(false);
            }
        }
        fetchTodos();
    }, []);

    const handleAddTodo = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTask.trim() || isAdding) return;

        setIsAdding(true);
        try {
            const newTodo = await addTodo(newTask.trim());
            setTodos([newTodo as Todo, ...todos]);
            setNewTask("");
            toast.success("Task added");
        } catch (error) {
            console.error("Failed to add todo:", error);
            toast.error("Failed to add task");
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean | null) => {
        const newStatus = !currentStatus;
        // Optimistic update
        setTodos(todos.map(t => t.id === id ? { ...t, isCompleted: newStatus } : t));
        
        try {
            await toggleTodo(id, newStatus);
        } catch (error) {
            console.error("Failed to toggle todo:", error);
            toast.error("Failed to update task");
            // Revert on error
            setTodos(todos.map(t => t.id === id ? { ...t, isCompleted: currentStatus } : t));
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic update
        const previousTodos = [...todos];
        setTodos(todos.filter(t => t.id !== id));
        
        try {
            await deleteTodo(id);
            toast.success("Task deleted");
        } catch (error) {
            console.error("Failed to delete todo:", error);
            toast.error("Failed to delete task");
            setTodos(previousTodos);
        }
    };

    return (
        <div 
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100/50 dark:border-gray-800 shadow-[var(--shadow-premium)] p-6 flex flex-col h-[450px]"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <ListTodo className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg font-aspekta tracking-tighter">To-do List</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">Focus for today</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-[11px] font-bold text-gray-400">
                        {todos.filter(t => t.isCompleted).length}/{todos.length}
                     </span>
                </div>
            </div>

            <form onSubmit={handleAddTodo} className="relative mb-6">
                <Input 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="h-11 pl-4 pr-12 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-sm"
                />
                <Button 
                    type="submit"
                    disabled={!newTask.trim() || isAdding}
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
            </form>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                <AnimatePresence initial={false} mode="popLayout">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-3">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-[9px]">Syncing Tasks...</span>
                        </div>
                    ) : todos.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-2 py-10"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-[10px]">Nothing to do</p>
                            <p className="text-gray-400 text-[11px] font-medium italic">Enjoy your peaceful day!</p>
                        </motion.div>
                    ) : (
                        todos.map((todo) => (
                            <motion.div
                                key={todo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                className={cn(
                                    "group flex items-center gap-3 p-3 rounded-xl border border-gray-100/50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30",
                                    todo.isCompleted && "opacity-60 bg-gray-50/20 dark:bg-gray-800/10"
                                )}
                            >
                                <button 
                                    onClick={() => handleToggle(todo.id, todo.isCompleted)}
                                    className={cn(
                                        "shrink-0 transition-all duration-300",
                                        todo.isCompleted ? "text-blue-500 scale-110" : "text-gray-300 hover:text-blue-400"
                                    )}
                                >
                                    {todo.isCompleted ? <CheckCircle2 className="w-5 h-5 fill-blue-50/50" /> : <Circle className="w-5 h-5" />}
                                </button>
                                
                                <span className={cn(
                                    "flex-1 text-[15px] font-medium font-geist transition-all duration-300 select-none",
                                    todo.isCompleted ? "text-gray-400 line-through decoration-blue-500/30 font-normal" : "text-gray-700 dark:text-gray-200"
                                )}>
                                    {todo.task}
                                </span>

                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                    <button 
                                        onClick={() => handleDelete(todo.id)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span>{todos.filter(t => !t.isCompleted).length} tasks pending</span>
                <span className="text-gray-300">|</span>
                <button 
                    onClick={() => {
                        const completedIds = todos.filter(t => t.isCompleted).map(t => t.id);
                        completedIds.forEach(id => handleDelete(id));
                    }}
                    className="hover:text-blue-500 transition-colors"
                >
                    Clear Done
                </button>
            </div>
        </div>
    );
}
