
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SparklesIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { saveScript, getScripts, deleteScript } from "@/lib/actions/script-actions";
import { generateAppScript } from "@/lib/actions/ai-actions";
import { Message } from "@/lib/ai/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "@/components/elements/ConfirmModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveAs } from "file-saver";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPSCRIPT_TEMPLATES } from "@/lib/data/templates";
import TemplateGallery from "@/components/elements/TemplateGallery";

interface ScriptModel {
    id: string;
    title: string;
    code: string;
    description: string | null;
    createdAt: Date | string | null;
}

export default function AppScriptBuilderPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [recentScripts, setRecentScripts] = useState<ScriptModel[]>([]);
  const [currentFiles, setCurrentFiles] = useState<{name: string, code: string}[]>([{ name: "Code.gs", code: "" }]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [currentAiComment, setCurrentAiComment] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<"google" | "groq" | "openrouter">("google");

  useEffect(() => {
    async function loadScripts() {
        try {
            const data = await getScripts();
            setRecentScripts(data as ScriptModel[]);
        } catch (error) {
            console.error("Failed to load scripts:", error);
        }
    }
    loadScripts();
  }, []);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteScript = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
        await deleteScript(deleteId);
        toast.success("Script deleted");
        const data = await getScripts();
        setRecentScripts(data as ScriptModel[]);
    } catch (error) {
        console.error("Failed to delete script:", error);
        toast.error("Failed to delete script");
    } finally {
        setDeleteId(null);
    }
  };

  const parseAiResponse = (content: string) => {
    const fileBlockRegex = /(?:###?\s*File:?\s*([^\n`]+)\n)?\s*```(?:javascript|typescript|js|gs|html|css)?\n([\s\S]*?)\n```/gi;
    const files: { name: string, code: string }[] = [];
    let match;
    
    while ((match = fileBlockRegex.exec(content)) !== null) {
      files.push({
        name: match[1]?.trim() || (files.length === 0 ? "Code.gs" : `index.html`),
        code: match[2].trim()
      });
    }

    if (files.length === 0) {
      files.push({ name: "Code.gs", code: content });
    }

    const comment = content.replace(fileBlockRegex, "").trim();
    return { files, comment };
  };

  const handleGenerate = async (e?: React.FormEvent, isRefinement = false) => {
    if (e) e.preventDefault();
    const activePrompt = isRefinement ? refinementPrompt : prompt;
    if (!activePrompt.trim()) return;

    setIsGenerating(true);
    
    try {
        const result = await generateAppScript(
            activePrompt, 
            chatHistory,
            selectedProvider,
            selectedProvider === "google" ? "google/gemini-2.0-flash-001" : 
            selectedProvider === "groq" ? "llama-3.3-70b-versatile" : "openai/gpt-4o-mini"
        );
        
        if (result.success && result.content) {
            const { files, comment } = parseAiResponse(result.content);
            setCurrentFiles(files);
            setActiveFileIndex(0);
            setCurrentAiComment(comment);
            
            const newHistory: Message[] = [
                ...chatHistory,
                { role: "user", content: activePrompt },
                { role: "assistant", content: result.content }
            ];
            setChatHistory(newHistory);
            
            if (!isRefinement) {
              await saveScript({
                  title: activePrompt.length > 30 ? activePrompt.substring(0, 30) + "..." : activePrompt,
                  code: JSON.stringify(files),
                  description: comment,
                  language: "javascript"
              });
              const data = await getScripts();
              setRecentScripts(data as ScriptModel[]);
              setHasResult(true);
            } else {
              setRefinementPrompt("");
              toast.success("Script updated!");
            }
        } else {
            toast.error(result.error || "Failed to generate script");
        }
    } catch (error) {
        console.error("Failed to call AI:", error);
        toast.error("Something went wrong");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleReset = () => {
      setHasResult(false);
      setIsCopied(false);
      setPrompt("");
      setChatHistory([]);
      setCurrentFiles([{ name: "Code.gs", code: "" }]);
      setActiveFileIndex(0);
      setCurrentAiComment("");
  };

  const handleCopy = () => {
      const codeToCopy = currentFiles[activeFileIndex]?.code || "";
      navigator.clipboard.writeText(codeToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const file = currentFiles[activeFileIndex];
    if (!file) return;
    const blob = new Blob([file.code], { type: "text/javascript;charset=utf-8" });
    const extension = file.name.includes('.') ? '' : '.gs';
    saveAs(blob, `${file.name}${extension}`);
    toast.success(`${file.name} downloaded!`);
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-32 px-6 relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300 z-10">
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title="Delete Script"
        description="Are you sure you want to delete this script? This action cannot be undone."
      />
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[40%] left-[5%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/40 dark:bg-blue-900/10 blur-[130px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center"
        >
            <h1 className="text-4xl md:text-5xl font-bold font-aspekta tracking-tighter leading-tight pb-2">
                <span className="text-black dark:text-white">AppScript Builder AI</span>
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 font-geist text-sm">
                Describe the automation or script you need, and the AI will generate it for you.
            </p>
        </motion.div>

        <AnimatePresence mode="wait">
            {!hasResult ? (
                <>
                <motion.div 
                    key="input-mode"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-4xl mx-auto relative shadow-[var(--shadow-premium-hover)] bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-400/30 transition-all duration-500"
                >
                    <div className="h-10 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center px-4 justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-inter">Script Requirement</span>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    </div>

                    <div className="relative">
                        <Textarea 
                            disabled={isGenerating}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                    handleGenerate();
                                }
                            }}
                            placeholder="I want a script that automatically organizes my Google Drive files..." 
                            className="w-full h-40 p-6 bg-transparent border-none outline-none focus-visible:ring-0 resize-none text-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 font-geist leading-relaxed shadow-none"
                        />
                        
                        <div className="px-5 pb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Using AI Engine</span>
                                    <Select 
                                        value={selectedProvider} 
                                        onValueChange={(val: any) => setSelectedProvider(val)}
                                        disabled={isGenerating}
                                    >
                                        <SelectTrigger className="w-[180px] h-10 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-700 text-xs font-semibold">
                                            <SelectValue placeholder="Select Model" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100 dark:border-gray-700 shadow-xl">
                                            <SelectItem value="google" className="text-xs font-medium">Gemini 2.0 (10 Cr)</SelectItem>
                                            <SelectItem value="groq" className="text-xs font-medium text-green-600 dark:text-green-400">Llama 3.3 Fast (5 Cr)</SelectItem>
                                            <SelectItem value="openrouter" className="text-xs font-medium text-orange-600">GPT-4o Premium (15 Cr)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button 
                                    onClick={() => handleGenerate()}
                                    disabled={isGenerating || !prompt.trim()}
                                    className={`h-12 w-auto px-8 bg-black hover:bg-black/90 text-white border-none shadow-lg shadow-black/5 rounded-2xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group ${isGenerating ? 'opacity-80' : ''}`}
                                >
                                    {isGenerating ? (
                                        <>
                                          <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                                          <span className="text-sm font-bold tracking-tight">Generating...</span>
                                        </>
                                    ) : (
                                        <span className="text-sm font-bold tracking-tight">Generate</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-8 max-w-4xl mx-auto">
                    <TemplateGallery 
                        templates={APPSCRIPT_TEMPLATES} 
                        onSelect={(p) => setPrompt(p)} 
                    />
                </div>

                {!isGenerating && recentScripts.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-12 max-w-4xl mx-auto"
                    >
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Recent Scripts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentScripts.map((script) => (
                                <div 
                                    key={script.id}
                                    onClick={() => {
                                        let parsedFiles;
                                        try {
                                            parsedFiles = JSON.parse(script.code);
                                            if (!Array.isArray(parsedFiles)) throw new Error();
                                        } catch {
                                            parsedFiles = [{ name: "Code.gs", code: script.code }];
                                        }
                                        setCurrentFiles(parsedFiles);
                                        setActiveFileIndex(0);
                                        setCurrentAiComment(script.description || "No instructions provided.");
                                        setHasResult(true);
                                    }}
                                    className="relative p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <CodeBracketIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-12">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{script.title}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                                {formatDistanceToNow(new Date(script.createdAt!), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(script.code);
                                                    toast.success("Code copied!");
                                                }}
                                                className="p-2 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                            >
                                                <ClipboardDocumentIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteScript(e, script.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
                </>
            ) : (
                <motion.div 
                    key="result-mode"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={handleReset}
                            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all font-semibold"
                        >
                            ← Back to Prompt
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar/Info Section */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Summary & Install Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white font-aspekta tracking-tight">AI Instructions</h3>
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <SparklesIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                                
                                <div className="prose dark:prose-invert prose-xs max-w-none text-gray-600 dark:text-gray-400 font-geist leading-relaxed markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {currentAiComment}
                                    </ReactMarkdown>
                                </div>

                                <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 space-y-3">
                                    <Button 
                                        onClick={handleCopy}
                                        className={`w-full justify-center gap-2 font-bold transition-all h-11 rounded-2xl ${isCopied ? 'bg-green-600' : 'bg-blue-600'} text-white border-none shadow-lg`}
                                    >
                                        {isCopied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                                        {isCopied ? 'Copied!' : 'Copy Code'}
                                    </Button>
                                    <Button 
                                        onClick={handleDownload}
                                        variant="outline"
                                        className="w-full justify-center gap-2 font-bold h-11 rounded-2xl border-gray-100 dark:border-gray-700"
                                    >
                                        <DocumentArrowUpIcon className="w-4 h-4 text-gray-400" />
                                        Download .gs
                                    </Button>
                                </div>
                            </div>

                            {/* Refinement Interface inside Sidebar */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-blue-500/20 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <SparklesIcon className="w-5 h-5 text-blue-200" />
                                    <h3 className="font-bold text-white text-sm">Update Logic</h3>
                                </div>
                                <p className="text-[11px] text-blue-100 mb-4 font-medium opacity-80 leading-relaxed">
                                    Need changes? Describe the modification below.
                                </p>
                                
                                <form onSubmit={(e) => handleGenerate(e, true)} className="space-y-4">
                                    <Textarea 
                                        className="bg-white/10 border-white/20 text-white text-xs h-24 placeholder:text-blue-200/50 focus-visible:ring-blue-300 rounded-xl resize-none backdrop-blur-md"
                                        placeholder="e.g., 'Add a timestamp to each row'..."
                                        value={refinementPrompt}
                                        onChange={(e) => setRefinementPrompt(e.target.value)}
                                        disabled={isGenerating}
                                    />
                                    <Button 
                                        type="submit"
                                        disabled={isGenerating || !refinementPrompt.trim()}
                                        className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-10 border-none transition-all active:scale-95 shadow-lg"
                                    >
                                        {isGenerating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Update Script"}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Editor Section */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="w-full bg-[#1e1e1e] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden relative group">
                                <div className="flex items-center justify-between px-6 py-1 bg-[#252526] border-b border-[#333]">
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50"></div>
                                    </div>
                                    
                                    {/* Tabs for multiple files */}
                                    <div className="flex flex-1 mx-4 overflow-x-auto no-scrollbar">
                                        {currentFiles.map((file, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveFileIndex(idx)}
                                                className={`px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                                                    activeFileIndex === idx 
                                                    ? 'text-blue-400 border-blue-400 bg-white/5' 
                                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                                                }`}
                                            >
                                                <CodeBracketIcon className="w-3 h-3" />
                                                {file.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600 hidden md:block">
                                        Google Apps Script
                                    </div>
                                </div>
                                
                                <div className="p-8 overflow-auto max-h-[700px] custom-scrollbar min-h-[400px]">
                                    <pre className="font-mono text-sm leading-relaxed text-blue-300/90">
                                        <code>
                                            {currentFiles[activeFileIndex]?.code || ""}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                                Logic verified for Google Apps Script V8 Runtime
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
