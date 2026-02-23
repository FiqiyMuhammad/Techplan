"use client";

import { useState, useEffect } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  eachDayOfInterval,
  isToday,
  setMonth,
  setYear,
  parseISO
} from "date-fns";
import { Loader2 } from "lucide-react";
import { 
  DndContext, 
  pointerWithin,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  PlusIcon, 
  XMarkIcon, 
  CalendarDaysIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Modal from "@/components/elements/Modal";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

// --- Types ---
type Task = {
  id: string;
  title: string;
  color: string;
  date: string; // ISO date string yyyy-MM-dd
  // New Fields
  time?: string;
  participants?: string;
  type?: 'online' | 'offline' | 'hybrid';
  notes?: string;
};

type ViewMode = 'month' | 'week' | 'day';

const TASK_COLORS = [
  { id: 'amber', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-900 dark:text-amber-100', border: 'border-amber-100 dark:border-amber-900/30', ring: 'ring-amber-200 dark:ring-amber-800' },
  { id: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-900 dark:text-emerald-100', border: 'border-emerald-100 dark:border-emerald-900/30', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-900 dark:text-blue-100', border: 'border-blue-100 dark:border-blue-900/30', ring: 'ring-blue-200 dark:ring-blue-800' },
  { id: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-900 dark:text-indigo-100', border: 'border-indigo-100 dark:border-indigo-900/30', ring: 'ring-indigo-200 dark:ring-indigo-800' },
  { id: 'rose', bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-900 dark:text-rose-100', border: 'border-rose-100 dark:border-rose-900/30', ring: 'ring-rose-200 dark:ring-rose-800' },
];

// --- Components ---
const TaskCard = ({ task, isOverlay, variant = 'minimal', onDelete, onClick }: { task: Task, isOverlay?: boolean, variant?: 'minimal' | 'detailed', onDelete?: (id: string) => void, onClick?: (task: Task) => void }) => {
  const theme = TASK_COLORS.find(c => c.id === task.color) || TASK_COLORS[2];
  
  if (variant === 'detailed') {
    return (
      <div 
        onClick={(e) => {
          if (!isOverlay && onClick) {
              e.stopPropagation();
              onClick(task);
          }
        }}
        className={`
        p-3 mb-2 rounded-lg transition-all group relative border ${theme.border} ${theme.bg} ${theme.text}
        ${isOverlay ? 'cursor-grabbing scale-105 shadow-xl rotate-1 z-50' : 'cursor-grab hover:shadow-md'}
        flex flex-col gap-1.5 shadow-sm
      `}>
         <div className="flex items-start gap-2.5">
            <div className={`w-1.5 h-4 rounded-full bg-current opacity-60 mt-0.5`} />
            <span className="font-semibold flex-1 text-[14px] leading-tight break-words">{task.title}</span>
         </div>

         {task.time && (
            <div className="flex items-center gap-1.5 text-[13px] font-bold opacity-60 ml-0.5">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{task.time}</span>
            </div>
         )}

         {!isOverlay && onDelete && (
            <button 
               onPointerDown={(e) => e.stopPropagation()}
               onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
               className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-all absolute top-2 right-2"
            >
               <XMarkIcon className="w-3.5 h-3.5" />
            </button>
         )}
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => {
        if (!isOverlay && onClick) {
            e.stopPropagation();
            onClick(task);
        }
      }}
      className={`
      p-1.5 mb-1.5 rounded-md text-[11px] font-semibold tracking-wide flex items-center gap-2 transition-all group relative border
      ${isOverlay ? 'cursor-grabbing scale-105 shadow-xl rotate-1 z-50' : 'cursor-grab hover:shadow-md'}
      ${theme.bg} ${theme.text} ${theme.border}
    `}>
       <div className={`w-1 h-3 rounded-full opacity-40 bg-current`} />
       <span className="truncate flex-1 font-inter">{task.title}</span>
       
       {!isOverlay && onDelete && (
         <button 
           onPointerDown={(e) => e.stopPropagation()}
           onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
           className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-all absolute right-2"
         >
           <XMarkIcon className="w-3.5 h-3.5" />
         </button>
       )}
    </div>
  );
};

function SortableTask({ task, onDelete, onClick, variant }: { task: Task, variant?: 'minimal' | 'detailed', onDelete?: (id: string) => void, onClick?: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} variant={variant} onDelete={onDelete} onClick={onClick} />
    </div>
  );
}

// --- Droppable Cell ---
function DroppableCell({ id, children, isCurrentMonth, className }: { id: string, children: React.ReactNode, isToday: boolean, isCurrentMonth: boolean, className?: string }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div 
            ref={setNodeRef}
            className={`min-h-[150px] p-2 transition-all duration-200 ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-900/50'} ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from "@/lib/actions/schedule-actions";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Task State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskColor, setNewTaskColor] = useState("blue");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("09:00");
  const [newTaskParticipants, setNewTaskParticipants] = useState("");
  const [newTaskType, setNewTaskType] = useState<"online" | "offline" | "hybrid">("online");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editParticipants, setEditParticipants] = useState("");
  const [editType, setEditType] = useState<"online" | "offline" | "hybrid">("online");
  const [editColor, setEditColor] = useState("blue");
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadTasks() {
      try {
        const data = await getSchedules();
        const mappedTasks: Task[] = data.map(t => ({
          id: t.id,
          title: t.title,
          color: (t as { color?: string | null }).color || 'blue',
          date: format(t.date, 'yyyy-MM-dd'),
          time: t.startTime || '',
          participants: t.participants || '',
          type: t.type as 'online' | 'offline' | 'hybrid',
          notes: t.notes || ''
        }));
        setTasks(mappedTasks);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
        setEditTitle(selectedTask.title);
        setEditDate(selectedTask.date);
        setEditTime(selectedTask.time || "09:00");
        setEditParticipants(selectedTask.participants || "");
        setEditType(selectedTask.type || "online");
        setEditColor(selectedTask.color || "blue");
        setEditNotes(selectedTask.notes || "");
    } else {
        setIsEditing(false);
    }
  }, [selectedTask]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!mounted) return null;

  // --- Actions ---
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find(t => t.id === event.active.id) || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (over && active.id !== over.id) {
        const activeTask = tasks.find(t => t.id === active.id);
        if (!activeTask) return;
        
        const overTask = tasks.find(t => t.id === over.id);
        const targetDate = overTask ? overTask.date : String(over.id);
        
        if (activeTask.date !== targetDate) {
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === active.id ? { ...t, date: targetDate } : t));
            
            try {
                await updateSchedule(activeTask.id, { 
                    date: parseISO(targetDate) 
                });
            } catch (error) {
                console.error("Failed to update task date:", error);
                // Rollback if needed, but for simplicity let's just log
            }
        }
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
        toast.error("Format belum lengkap", {
            description: "Silakan isi judul event terlebih dahulu."
        });
        return;
    }
    
    // Ensure time is formatted correctly HH:mm
    const timeParts = newTaskTime.split(':');
    const h = (timeParts[0] || '09').padStart(2, '0');
    const m = (timeParts[1] || '00').padStart(2, '0');
    const formattedTime = `${h}:${m}`;
    
    const taskDateStr = newTaskDate || format(currentDate, 'yyyy-MM-dd');
    
    const taskData = {
        title: newTaskTitle,
        color: newTaskColor,
        date: parseISO(taskDateStr),
        startTime: formattedTime,
        participants: newTaskParticipants,
        type: newTaskType,
        notes: newTaskNotes
    };

    setIsSaving(true);
    try {
        const newDbTask = await createSchedule(taskData);
        const newTask: Task = {
            id: newDbTask.id,
            title: newDbTask.title,
            color: (newDbTask as { color?: string | null }).color || 'blue',
            date: format(newDbTask.date, 'yyyy-MM-dd'),
            time: newDbTask.startTime || '',
            participants: newDbTask.participants || '',
            type: newDbTask.type as 'online' | 'offline' | 'hybrid',
            notes: newDbTask.notes || ''
        };
        setTasks(prev => [...prev, newTask]);
        
        // Reset Form
        setNewTaskTitle("");
        setNewTaskParticipants("");
        setNewTaskNotes("");
        setIsAddOpen(false);
        toast.success("Event berhasil disimpan!");
    } catch (error) {
        console.error("Failed to add task:", error);
        toast.error("Gagal menyimpan event", {
            description: "Terjadi kesalahan saat menghubungi server."
        });
    } finally {
        setIsSaving(false);
    }
  };

  const openAddModal = () => {
      setNewTaskDate(format(currentDate, 'yyyy-MM-dd'));
      setNewTaskTime("09:00");
      setIsAddOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
        await deleteSchedule(id);
    } catch (error) {
        console.error("Failed to delete task:", error);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !editTitle.trim()) return;

    const timeParts = editTime.split(':');
    const h = (timeParts[0] || '09').padStart(2, '0');
    const m = (timeParts[1] || '00').padStart(2, '0');
    const formattedTime = `${h}:${m}`;

    const updatedData = {
        title: editTitle,
        date: parseISO(editDate),
        startTime: formattedTime,
        participants: editParticipants,
        type: editType,
        color: editColor,
        notes: editNotes
    };

    setIsSaving(true);
    try {
        const result = await updateSchedule(selectedTask.id, updatedData);
        if (result) {
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? {
                ...t,
                title: editTitle,
                date: editDate,
                time: formattedTime,
                participants: editParticipants,
                type: editType,
                color: editColor,
                notes: editNotes
            } : t));
            toast.success("Event updated successfully!");
            setSelectedTask(null);
            setIsEditing(false);
        }
    } catch (error) {
        console.error("Failed to update task:", error);
        toast.error("Failed to update event");
    } finally {
        setIsSaving(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // --- Render Views ---
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-900 rounded-b-2xl overflow-hidden border border-t-0 border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky top-0">
                {weekDays.map(d => (
                    <div key={d} className="py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 font-geist tracking-wide">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayTasks = tasks.filter(t => t.date === dateKey);
                    return (
                        <DroppableCell 
                            key={dateKey} 
                            id={dateKey} 
                            isToday={isToday(day)} 
                            isCurrentMonth={isSameMonth(day, monthStart)}
                            className="border-b border-r border-gray-100 dark:border-gray-800 last:border-r-0"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all
                                        ${isToday(day) 
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' 
                                            : isSameMonth(day, monthStart) ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-700'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                        {dayTasks.map(task => (
                                            <SortableTask 
                                                key={task.id} 
                                                task={task} 
                                                onDelete={handleDeleteTask} 
                                                onClick={setSelectedTask} 
                                            />
                                        ))}
                                    </SortableContext>
                                </div>
                            </div>
                        </DroppableCell>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="grid grid-cols-7 flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-b-2xl overflow-hidden">
            {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasks.filter(t => t.date === dateKey);
                return (
                    <DroppableCell 
                        key={dateKey} 
                        id={dateKey} 
                        isToday={isToday(day)} 
                        isCurrentMonth={true} 
                        className="border-r border-gray-100 dark:border-gray-800 last:border-r-0"
                    >
                        <div className="flex flex-col h-full">
                            <div className="text-center py-4 border-b border-gray-50 dark:border-gray-800 mb-4 bg-white dark:bg-gray-900">
                                <span className="block text-[10px] font-bold text-gray-400 mb-1">{format(day, 'EEE')}</span>
                                <span className={`text-2xl font-bold ${isToday(day) ? 'text-gray-900 dark:text-white underline decoration-4 decoration-gray-900 dark:decoration-white underline-offset-4' : 'text-gray-900 dark:text-white'}`}>{format(day, 'd')}</span>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar p-2">
                                <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                    {dayTasks.map(task => (
                                        <SortableTask 
                                            key={task.id} 
                                            task={task} 
                                            variant="detailed"
                                            onDelete={handleDeleteTask} 
                                            onClick={setSelectedTask} 
                                        />
                                    ))}
                                </SortableContext>
                            </div>
                        </div>
                    </DroppableCell>
                );
            })}
        </div>
    );
  };

  const renderDayView = () => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dateKey);

    return (
        <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto p-12 flex flex-col items-center">
            <div className="flex flex-col items-center mb-12 text-center">
                <span className="text-[10px] font-bold text-gray-400 mb-4">{format(currentDate, 'EEEE')}</span>
                <span className="text-6xl font-bold text-gray-900 dark:text-white tracking-tighter mb-2">{format(currentDate, 'dd')}</span>
                <span className="text-xl font-bold text-gray-500 dark:text-gray-400">{format(currentDate, 'MMMM yyyy')}</span>
            </div>
            
            <DroppableCell id={dateKey} isToday={isToday(currentDate)} isCurrentMonth={true}>
                <div className="w-full max-w-2xl space-y-4 min-h-[400px] border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-gray-400">Planned sessions</h3>
                        <span className="px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-[10px] font-bold">{dayTasks.length} events</span>
                    </div>
                    <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            {dayTasks.map(task => (
                                <SortableTask 
                                    key={task.id} 
                                    task={task} 
                                    variant="detailed"
                                    onDelete={handleDeleteTask} 
                                    onClick={setSelectedTask}
                                />
                            ))}
                        </div>
                    </SortableContext>
                    {dayTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <PlusIcon className="w-10 h-10 text-gray-400 mb-4" />
                            <p className="text-xs font-bold text-center">No sessions scheduled<br/>for today</p>
                        </div>
                    )}
                </div>
            </DroppableCell>
        </div>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-32 space-y-4 md:space-y-8 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3 md:gap-4 text-3xl md:text-5xl font-bold font-aspekta tracking-tighter leading-none">
               <span className="text-black dark:text-white">{format(currentDate, 'MMMM')}</span>
               <span className="text-gray-200 dark:text-gray-700 font-light -mt-2">/</span>
               <span className="text-gray-300 dark:text-gray-600">{format(currentDate, 'yyyy')}</span>
             </div>
             <p className="text-gray-400 dark:text-gray-500 font-geist text-xs md:text-sm mt-1 md:mt-2 font-medium italic">Manage your teaching schedule and sessions.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 w-full sm:w-auto">
             <Select value={String(currentDate.getMonth())} onValueChange={(val) => setCurrentDate(setMonth(currentDate, parseInt(val)))}>
               <SelectTrigger className="flex-1 sm:w-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 md:px-4 h-9 rounded-lg text-xs md:text-sm font-medium font-inter focus:ring-0 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent position="popper" sideOffset={4}>
                 {months.map((m, i) => (
                   <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             
             <Select value={String(currentDate.getFullYear())} onValueChange={(val) => setCurrentDate(setYear(currentDate, parseInt(val)))}>
               <SelectTrigger className="w-24 sm:w-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 md:px-4 h-9 rounded-lg text-xs md:text-sm font-medium font-inter focus:ring-0 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent position="popper" sideOffset={4}>
                 {years.map(y => (
                   <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>

          <div className="hidden sm:block h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <div className="flex bg-gray-50/80 dark:bg-gray-800/50 p-1 rounded-full items-center border border-gray-100/50 dark:border-gray-700/50 h-11 md:h-12 shadow-sm relative w-full sm:w-auto">
            {(['month', 'week', 'day'] as const).map((v) => (
               <button
                 key={v}
                 onClick={() => setView(v)}
                 className={`relative flex-1 sm:px-6 py-2 text-[11px] md:text-sm font-bold font-inter capitalize rounded-full transition-all z-10 ${
                   view === v 
                   ? 'text-gray-900 dark:text-white' 
                   : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                 }`}
               >
                 {view === v && (
                    <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-600"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                 )}
                 <span className="relative z-20">{v}</span>
               </button>
            ))}
          </div>

          <button 
             onClick={openAddModal}
             className="h-10 md:h-10 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all shadow-md active:scale-95 w-full sm:w-auto"
          >
             <PlusIcon className="w-4 h-4" />
             <span>Add Task</span>
          </button>
        </div>
      </div>

      <motion.div 
        key={view + currentDate.toISOString()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100/50 dark:border-gray-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[500px] md:min-h-[700px] relative"
        style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
      >
        {/* Horizontal Scroll Hint for Mobile */}
        {view !== 'day' && (
          <div className="md:hidden flex items-center justify-center py-2 bg-blue-50/50 dark:bg-blue-900/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-900/20">
            <span className="flex items-center gap-1.5 uppercase tracking-widest">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16M6 8L2 12L6 16"></path>
              </svg>
              Scroll Horizontal
            </span>
          </div>
        )}

        <div className={`flex-1 overflow-x-auto no-scrollbar ${view !== 'day' ? 'cursor-grab active:cursor-grabbing' : ''}`}>
          <div className={`${view === 'month' || view === 'week' ? 'min-w-[800px] md:min-w-0 h-full flex flex-col' : 'h-full flex flex-col'}`}>
        {isLoading && (
            <div className="absolute inset-0 z-50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        )}
        <DndContext 
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
            {/* Drag Overlay */}
            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <TaskCard 
                        task={activeTask} 
                        isOverlay 
                        variant={view === 'month' ? 'minimal' : 'detailed'} 
                    />
                ) : null}
            </DragOverlay>

            {/* Add Event Modal */}
        </DndContext>
          </div>
        </div>
      </motion.div>

      {/* Add Task Modal */}
      <Modal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        title="Add New Event"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 font-inter">Event Title</label>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="e.g. Team Meeting"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium font-inter text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 font-inter">Date</label>
                          <div className="relative">
                             <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                             <input 
                                 type="date"
                                 value={newTaskDate}
                                 onChange={(e) => setNewTaskDate(e.target.value)}
                                 className="w-full h-10 pl-9 pr-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium font-inter text-xs"
                             />
                          </div>
                     </div>
                     <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 font-inter">Time (24h)</label>
                          <div className="flex items-center gap-2">
                             <input 
                               type="text"
                               maxLength={2}
                               placeholder="HH"
                               value={newTaskTime.split(':')[0]} 
                               onChange={(e) => {
                                   const h = e.target.value.replace(/\D/g, '').slice(0, 2);
                                   const m = newTaskTime.split(':')[1] || '00';
                                   if (h === '' || (parseInt(h) >= 0 && parseInt(h) <= 23)) {
                                       setNewTaskTime(`${h}:${m}`);
                                   }
                               }}
                               onBlur={(e) => {
                                   const h = e.target.value.padStart(2, '0');
                                   const m = newTaskTime.split(':')[1] || '00';
                                   setNewTaskTime(`${h}:${m}`);
                               }}
                               className="w-16 h-10 text-center rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium font-inter text-sm"
                             />
                             <span className="text-gray-400 font-bold">:</span>
                             <input 
                               type="text"
                               maxLength={2}
                               placeholder="MM"
                               value={newTaskTime.split(':')[1]} 
                               onChange={(e) => {
                                   const m = e.target.value.replace(/\D/g, '').slice(0, 2);
                                   const h = newTaskTime.split(':')[0] || '00';
                                   if (m === '' || (parseInt(m) >= 0 && parseInt(m) <= 59)) {
                                       setNewTaskTime(`${h}:${m}`);
                                   }
                               }}
                               onBlur={(e) => {
                                   const m = e.target.value.padStart(2, '0');
                                   const h = newTaskTime.split(':')[0] || '00';
                                   setNewTaskTime(`${h}:${m}`);
                               }}
                               className="w-16 h-10 text-center rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium font-inter text-sm"
                             />
                          </div>
                     </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 font-inter">Event Type</label>
                    <Select value={newTaskType} onValueChange={(val) => setNewTaskType(val as "online" | "offline" | "hybrid")}>
                       <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border-none h-10 rounded-lg text-sm font-medium font-inter shadow-none">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="z-[10001]">
                         <SelectItem value="online">Online Meeting</SelectItem>
                         <SelectItem value="offline">Offline / In-Person</SelectItem>
                         <SelectItem value="hybrid">Hybrid</SelectItem>
                       </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 font-inter">Participants <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input 
                        type="text" 
                        placeholder="e.g. John, Sarah"
                        value={newTaskParticipants}
                        onChange={(e) => setNewTaskParticipants(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium font-inter text-sm"
                    />
                </div>

                 <div className="space-y-2">
                     <label className="text-xs font-semibold text-gray-500 font-inter">Color Theme</label>
                     <div className="flex gap-2">
                         {TASK_COLORS.map(c => (
                             <button
                                 key={c.id}
                                 onClick={() => setNewTaskColor(c.id)}
                                 className={`w-8 h-8 rounded-full ${c.bg} ${c.text} border-2 transition-all flex items-center justify-center ${newTaskColor === c.id ? 'border-gray-900 dark:border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                             >
                                 <div className={`w-2 h-2 rounded-full bg-current`} />
                             </button>
                         ))}
                     </div>
                 </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 font-inter">Agenda / Notes</label>
                    <Textarea 
                        placeholder="Add description..."
                        value={newTaskNotes}
                        onChange={(e) => setNewTaskNotes(e.target.value)}
                        className="w-full h-24 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium font-inter text-sm resize-none shadow-none"
                    />
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
             <button 
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleAddTask}
                disabled={isSaving}
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-xs hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                    </>
                ) : "Save Event"}
            </button>
        </div>
      </Modal>

      {/* View Task Details Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={isEditing ? 'Edit Event' : (selectedTask?.title || '')}
        maxWidth="max-w-2xl"
      >
        {selectedTask && (
            <>
                {!isEditing && (
                    <div className="mb-6 -mt-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedTask.type === 'online' ? 'bg-blue-100 text-blue-700' :
                            selectedTask.type === 'offline' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                            {selectedTask.type || 'event'}
                        </span>
                    </div>
                )}

                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
                                <input 
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
                                    <input 
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium text-xs font-inter"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</label>
                                    <input 
                                        type="time"
                                        value={editTime}
                                        onChange={(e) => setEditTime(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm font-inter"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                                <Select value={editType} onValueChange={(val: "online" | "offline" | "hybrid") => setEditType(val)}>
                                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border-none h-11 rounded-lg text-sm font-medium shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10001]">
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="offline">Offline</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Participants</label>
                                <input 
                                    type="text"
                                    value={editParticipants}
                                    onChange={(e) => setEditParticipants(e.target.value)}
                                    placeholder="e.g. John, Sarah"
                                    className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color Theme</label>
                                <div className="flex gap-2">
                                    {TASK_COLORS.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setEditColor(c.id)}
                                            className={`w-8 h-8 rounded-full ${c.bg} border-2 transition-all flex items-center justify-center ${editColor === c.id ? 'border-gray-900 dark:border-white scale-110 shadow-sm' : 'border-transparent'}`}
                                        >
                                             <div className={`w-2 h-2 rounded-full bg-current`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notes</label>
                                <Textarea 
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Add notes..."
                                    className="w-full h-[104px] p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm resize-none shadow-none"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 shadow-sm transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600">
                                <CalendarDaysIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Schedule</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {format(parseISO(selectedTask.date), 'EEEE, d MMMM yyyy')}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {selectedTask.time || 'All Day'}
                                </p>
                            </div>
                        </div>

                        {selectedTask.participants && (
                            <div className="flex items-center gap-4 group">
                                 <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 shadow-sm transition-colors group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-600">
                                    <span className="text-lg font-bold">@</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Participants</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed text-wrap break-all">
                                        {selectedTask.participants}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-100 dark:border-gray-800/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Agenda & Notes</p>
                        {selectedTask.notes ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto no-scrollbar font-medium">
                                {selectedTask.notes}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-300 dark:text-gray-600 italic">No notes provided.</p>
                        )}
                    </div>
                </div>
                )}

                <div className="mt-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-6">
                     {!isEditing ? (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                            >
                                Edit Event
                            </button>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        handleDeleteTask(selectedTask.id);
                                        setSelectedTask(null);
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                                <button 
                                    onClick={() => setSelectedTask(null)}
                                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-xs hover:shadow-lg transition-all active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                     ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateTask}
                                disabled={isSaving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:shadow-lg transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </>
                     )}
                </div>
            </>
        )}
      </Modal>
    </div>
  );
}
