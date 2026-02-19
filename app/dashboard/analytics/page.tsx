"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PencilIcon,
  Square3Stack3DIcon,
  PresentationChartLineIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWorkflows, deleteWorkflow } from "@/lib/actions/workflow-actions";
import { getNotes, saveNote, deleteNote } from "@/lib/actions/note-actions";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ConfirmModal from "@/components/elements/ConfirmModal";

// --- Types ---
interface Workflow {
  id: string;
  title: string;
  status: string;
  nodes: unknown;
  updatedAt: Date;
  color: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: Date;
}

const COLORS = [
  { id: "blue", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-100 dark:border-blue-900/30" },
  { id: "indigo", bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-900/30" },
  { id: "emerald", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-900/30" },
  { id: "amber", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-100 dark:border-amber-900/30" },
  { id: "rose", bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400", border: "border-rose-100 dark:border-rose-900/30" },
];

export default function AnalyticsPage() {
  const tabs = [
    { id: "workflows", label: "Workflows", icon: PresentationChartLineIcon },
    { id: "notes", label: "Notes", icon: Square3Stack3DIcon },
    { id: "canvas", label: "Canvas", icon: PencilIcon },
  ];

  return (
    <div className="p-6 pb-32 space-y-6 min-h-screen">
      <Tabs defaultValue="workflows" className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
                <h1 className="text-4xl font-bold font-aspekta tracking-tighter pb-1">
                  <span className="text-black dark:text-white">Brainstorming Hub</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5 font-geist text-xs">
                Visualize ideas, take quick notes, and design your workflows.
                </p>
          </div>
          
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full inline-flex h-12 items-center border border-gray-200 dark:border-gray-700/50 shadow-inner">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="rounded-full px-5 h-full flex items-center justify-center gap-2 text-sm font-semibold transition-all z-10 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="workflows" className="m-0 focus-visible:ring-0 outline-none">
          <WorkflowView />
        </TabsContent>
        <TabsContent value="notes" className="m-0 focus-visible:ring-0 outline-none">
          <NotesView />
        </TabsContent>
        <TabsContent value="canvas" className="m-0 focus-visible:ring-0 outline-none">
          <CanvasView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Workflow View ---
function WorkflowView() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const data = await getWorkflows();
      return data as Workflow[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success("Workflow deleted");
    }
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<Workflow["status"]>("Draft");
  const [newColor, setNewColor] = useState<Workflow["color"]>("blue");

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    router.push(`/workflow/builder?title=${encodeURIComponent(newTitle)}&status=${newStatus}&color=${newColor}`);
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
      />
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Workflows</h2>
        <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2 font-bold text-xs">
          <PlusIcon className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            Array(3).fill(0).map((_, i) => <WorkflowSkeleton key={i} />)
        ) : workflows.map((wf) => (
          <div 
            key={wf.id} 
            onClick={() => router.push(`/workflow/builder/${wf.id}`)}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-[var(--shadow-premium)] hover:shadow-md transition-all cursor-pointer group relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-all ${
                  wf.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600' :
                  wf.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600' :
                  wf.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600' :
                  wf.color === 'amber' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600' :
                  'bg-rose-50 text-rose-600 group-hover:bg-rose-600'
              } group-hover:text-white`}>
                <PresentationChartLineIcon className="w-5 h-5" />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={(e) => { e.stopPropagation(); handleDelete(wf.id); }}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{wf.title}</h3>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-4">
              <span className={`px-2 py-0.5 bg-gray-50 dark:bg-gray-900 text-gray-500 rounded`}>{wf.status}</span>
              <span className="flex items-center gap-1"><Square3Stack3DIcon className="w-3 h-3" /> {Array.isArray(wf.nodes) ? wf.nodes.length : 0} Nodes</span>
              <span>{formatDistanceToNow(new Date(wf.updatedAt), { addSuffix: true })}</span>
            </div>
          </div>
        ))}
        
        {/* New Workflow Card Trigger */}
        <div 
            onClick={() => setIsAddOpen(true)}
            className="p-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/5 transition-all cursor-pointer min-h-[200px] group"
        >
           <PlusIcon className="w-6 h-6 mb-2" />
           <span className="font-semibold text-xs">Create New</span>
        </div>
      </div>

      {/* Add Workflow Modal */}
      <AnimatePresence>
        {isAddOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsAddOpen(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-gray-100 dark:border-gray-800"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">New Workflow</h3>
                        <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-900">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Title</label>
                            <Input 
                                placeholder="Workflow Title..." 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Color Theme</label>
                            <div className="flex gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setNewColor(c.id as Workflow["color"])}
                                        className={`w-8 h-8 rounded-full ${c.bg.split(' ')[0]} border-2 transition-all flex items-center justify-center ${newColor === c.id ? 'border-gray-900 dark:border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full bg-${c.id}-500`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Initial Status</label>
                             <div className="flex gap-2">
                                 {["Draft", "Planning", "In Progress"].map(s => (
                                     <button
                                        key={s}
                                        onClick={() => setNewStatus(s as Workflow["status"])}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newStatus === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}
                                     >
                                         {s}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newTitle.trim()}>Create Workflow</Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Notes View ---
function NotesView() {
    const queryClient = useQueryClient();

    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: async () => {
            const data = await getNotes();
            return data as Note[];
        }
    });

    const addMutation = useMutation({
        mutationFn: saveNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            toast.success("Note saved");
            setIsAddOpen(false);
            setNewTitle("");
            setNewContent("");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            toast.success("Note deleted");
        }
    });

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newColor, setNewColor] = useState<string>("amber");

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        addMutation.mutate({
            title: newTitle,
            content: newContent,
            color: newColor,
        });
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteId(id);
    }

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <ConfirmModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={confirmDelete}
                title="Delete Stickynote"
                description="Are you sure you want to delete this note? This action cannot be undone."
            />
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Notes</h2>
                <Button onClick={() => setIsAddOpen(true)} size="sm" variant="secondary" className="gap-2 text-xs font-bold">
                    <PlusIcon className="w-4 h-4" />
                    New Note
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <NoteSkeleton key={i} />)
                ) : notes.map((note) => {
                    const theme = COLORS.find(c => c.id === note.color) || COLORS[3]; // Fallback to amber
                    return (
                        <div key={note.id} className={`p-6 rounded-xl border ${theme.bg} ${theme.border} transition-all hover:shadow-sm cursor-pointer relative group min-h-[160px]`}>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5"
                                onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                            >
                                <TrashIcon className="w-3.5 h-3.5" />
                            </Button>
                            <h3 className={`font-bold mb-3 text-sm ${theme.text.split(' ')[0]} flex items-center gap-2`}>
                                {note.title}
                            </h3>
                            <p className="text-sm opacity-80 whitespace-pre-line leading-relaxed font-geist text-gray-700 dark:text-gray-300">
                                {note.content}
                            </p>
                            <div className="absolute bottom-3 right-4 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                            </div>
                        </div>
                    );
                })}
                 {/* New Note Card Trigger */}
                <div 
                    onClick={() => setIsAddOpen(true)}
                    className="p-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50/5 transition-all cursor-pointer min-h-[160px] group"
                >
                    <PlusIcon className="w-6 h-6 mb-2" />
                    <span className="font-semibold text-xs">New Note</span>
                </div>
            </div>

            {/* Add Note Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsAddOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">New Stickynote</h3>
                                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-900">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Title</label>
                                    <Input 
                                        placeholder="Note Title..." 
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Color</label>
                                    <div className="flex gap-2">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => setNewColor(c.id as Note["color"])}
                                                className={`w-8 h-8 rounded-full ${c.bg.split(' ')[0]} border-2 transition-all flex items-center justify-center ${newColor === c.id ? 'border-gray-900 dark:border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full bg-${c.id}-500`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Content</label>
                                     <Textarea 
                                        placeholder="Write something..." 
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        className="h-32 resize-none"
                                     />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={handleAdd} disabled={!newTitle.trim()}>Save Note</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function CanvasView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#2563eb"); // Default blue
    
    // History for Undo/Redo
    const [history, setHistory] = useState<ImageData[]>([]);
    const [step, setStep] = useState(-1);

    // Initialize Canvas
    useEffect(() => {
        if (isDrawingMode && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * 2;
                canvas.height = rect.height * 2;
                context.scale(2, 2);
                
                context.lineCap = "round";
                context.lineJoin = "round";
                context.lineWidth = 3;
                context.strokeStyle = color;

                // Restore history if available, else save initial blank
                if (history.length > 0 && step >= 0) {
                    context.putImageData(history[step], 0, 0);
                } else if (history.length === 0) {
                    // Save initial blank state
                    const initialData = context.getImageData(0, 0, canvas.width, canvas.height);
                    setHistory([initialData]);
                    setStep(0);
                }
            }
        }
    }, [isDrawingMode, color, history, step]); 

    // Update Context Properties
    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.lineWidth = 3;
                context.strokeStyle = color;
            }
        }
    }, [color]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.closePath();
            
            // Save to History
            if (ctx) {
                const newData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const newHistory = history.slice(0, step + 1);
                newHistory.push(newData);
                setHistory(newHistory);
                setStep(newHistory.length - 1);
            }
        }
        setIsDrawing(false);
    };

    const undo = () => {
        if (step > 0) {
            const newStep = step - 1;
            setStep(newStep);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.putImageData(history[newStep], 0, 0);
            }
        }
    };

    const redo = () => {
        if (step < history.length - 1) {
            const newStep = step + 1;
            setStep(newStep);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.putImageData(history[newStep], 0, 0);
            }
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Save clear state
                const newData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const newHistory = history.slice(0, step + 1);
                newHistory.push(newData);
                setHistory(newHistory);
                setStep(newHistory.length - 1);
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`h-[600px] ${isDrawingMode ? 'bg-white' : 'bg-white dark:bg-gray-800'} rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden flex items-center justify-center transition-colors`}>
            
            {!isDrawingMode ? (
                <>
                <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/10 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none"></div>
                <div className="text-center space-y-4 relative z-10">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                        <PencilIcon className="w-8 h-8" />
                    </div>
                    <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Interactive Canvas</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-1 font-geist text-sm leading-relaxed">
                            A blank infinite canvas for freeform brainstorming.
                    </p>
                    </div>
                    <Button onClick={() => setIsDrawingMode(true)} className="font-bold text-xs px-8">
                        Start Drawing
                    </Button>
                </div>
                </>
            ) : (
                <>
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    />
                    
                    {/* Floating Toolbar */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-2xl border border-gray-100 flex items-center gap-2 z-20"
                    >
                         {/* Colors */}
                         <div className="flex bg-gray-100 p-1.5 rounded-full gap-1.5">
                            {["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b"].map((c) => (
                                <button 
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 scale-125' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                         </div>
                         
                         <div className="w-px h-6 bg-gray-200 mx-1"></div>

                         {/* Eraser */}
                         <button 
                             onClick={() => setColor("#ffffff")} 
                             className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${color === "#ffffff" ? "bg-gray-200 shadow-inner" : ""}`}
                             title="Eraser"
                         >
                             <div className="w-4 h-4 border-2 border-gray-400 rounded-sm bg-white"></div>
                         </button>

                         <div className="w-px h-6 bg-gray-200 mx-1"></div>

                         {/* Undo / Redo */}
                         <button 
                             onClick={undo} 
                             disabled={step <= 0}
                             className={`p-2 rounded-full transition-colors ${step > 0 ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                             title="Undo"
                         >
                             <ArrowUturnLeftIcon className="w-5 h-5" />
                         </button>
                         <button 
                             onClick={redo} 
                             disabled={step >= history.length - 1}
                             className={`p-2 rounded-full transition-colors ${step < history.length - 1 ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                             title="Redo"
                         >
                             <ArrowUturnRightIcon className="w-5 h-5" />
                         </button>

                         <div className="w-px h-6 bg-gray-200 mx-1"></div>

                         <button onClick={clearCanvas} className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Clear All">
                             <TrashIcon className="w-5 h-5" />
                         </button>
                         
                         <div className="w-px h-6 bg-gray-200 mx-1"></div>
                         
                         <button onClick={() => setIsDrawingMode(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors" title="Exit">
                             <XMarkIcon className="w-5 h-5" />
                         </button>
                    </motion.div>
                </>
            )}
        </motion.div>
    )
}

// --- Skeletons ---
function WorkflowSkeleton() {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="flex gap-2">
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/4" />
            </div>
        </div>
    );
}

function NoteSkeleton() {
    return (
        <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 animate-pulse min-h-[160px]">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
        </div>
    );
}
