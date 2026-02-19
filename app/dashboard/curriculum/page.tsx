
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SparklesIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  TrashIcon
} from "@heroicons/react/24/solid";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { saveDocument, getDocuments, deleteDocument } from "@/lib/actions/document-actions";

import { generateCurriculum } from "@/lib/actions/ai-actions";
import { Message } from "@/lib/ai/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { CURRICULUM_TEMPLATES } from "@/lib/data/templates";
import TemplateGallery from "@/components/elements/TemplateGallery";

interface CurriculumDoc {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string | null;
}

type ContextMode = "academic" | "professional";

export default function CurriculumPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [recentDocs, setRecentDocs] = useState<CurriculumDoc[]>([]);
  const [currentCurriculum, setCurrentCurriculum] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [contextMode, setContextMode] = useState<ContextMode>("academic");
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDocs() {
        try {
            const docs = await getDocuments("curriculum");
            setRecentDocs(docs);
        } catch (error) {
            console.error("Failed to load documents:", error);
        }
    }
    loadDocs();
  }, []);

  const handleGenerate = async (e?: React.FormEvent, isRefinement = false) => {
    if (e) e.preventDefault();
    const activePrompt = isRefinement ? refinementPrompt : `Context: ${contextMode}. Prompt: ${prompt}`;
    if (!isRefinement && !prompt.trim()) return;
    if (isRefinement && !refinementPrompt.trim()) return;

    setIsGenerating(true);
    
    try {
        const result = await generateCurriculum(activePrompt, chatHistory);
        
        if (result.success && result.content) {
            setCurrentCurriculum(result.content);
            
            const newHistory: Message[] = [
                ...chatHistory,
                { role: "user", content: activePrompt },
                { role: "assistant", content: result.content }
            ];
            setChatHistory(newHistory);
            
            if (!isRefinement) {
              await saveDocument({
                  title: activePrompt,
                  content: result.content,
                  type: "curriculum",
                  format: "pdf"
              });
              
              const docs = await getDocuments("curriculum");
              setRecentDocs(docs);
              setHasResult(true);
            } else {



              setRefinementPrompt("");
              toast.success("Curriculum updated!");
            }
        } else {
            toast.error(result.error || "Failed to generate curriculum");
        }
    } catch (error) {
        console.error("Failed to save curriculum:", error);
        toast.error("Something went wrong");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
        await deleteDocument(id);
        setRecentDocs(prev => prev.filter(d => d.id !== id));
        toast.success("Curriculum deleted");
    } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete curriculum");
    }
  };




  const handleReset = () => {
      setHasResult(false);
      setPrompt("");
      setChatHistory([]);
      setCurrentCurriculum("");
  };


  const exportToPDF = async () => {
    if (!docRef.current) return;
    const toastId = toast.loading("Preparing PDF...");
    try {
      const canvas = await html2canvas(docRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // EXTREME FIX: Remove all existing styles that might contain lab() or oklch()
          const styleTags = clonedDoc.getElementsByTagName('style');
          const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          
          for (let i = 0; i < styleTags.length; i++) styleTags[i].remove();
          linkTags.forEach(link => link.remove());

          // Inject a standard, safe CSS for the PDF content
          const safeStyle = clonedDoc.createElement('style');
          safeStyle.innerHTML = `
            .markdown-content { 
              color: #111827 !important; 
              background: #ffffff !important; 
              font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
              padding: 40px !important;
              line-height: 1.6 !important;
              font-size: 14px !important;
            }
            .markdown-content h1 { font-size: 24px !important; margin-bottom: 20px !important; font-weight: bold !important; color: #000 !important; }
            .markdown-content h2 { font-size: 20px !important; margin-top: 30px !important; margin-bottom: 15px !important; font-weight: bold !important; color: #000 !important; }
            .markdown-content h3 { font-size: 18px !important; margin-top: 20px !important; margin-bottom: 10px !important; font-weight: bold !important; color: #000 !important; }
            .markdown-content p { margin-bottom: 15px !important; }
            .markdown-content table { 
              width: 100% !important; 
              border-collapse: collapse !important; 
              margin: 20px 0 !important; 
              border: 1px solid #e5e7eb !important;
            }
            .markdown-content th, .markdown-content td { 
              border: 1px solid #e5e7eb !important; 
              padding: 10px !important; 
              text-align: left !important;
            }
            .markdown-content th { background-color: #f9fafb !important; font-weight: bold !important; }
            .markdown-content tr:nth-child(even) { background-color: #f3f4f6 !important; }
            .markdown-content ul, .markdown-content ol { padding-left: 20px !important; margin-bottom: 15px !important; }
            .markdown-content li { margin-bottom: 5px !important; }
          `;
          clonedDoc.head.appendChild(safeStyle);

          // Force the container to use these styles
          const container = clonedDoc.querySelector('.markdown-content') as HTMLElement;
          if (container) {
            container.style.width = "800px"; // Standard width for PDF logic
            container.style.margin = "0 auto";
          }
        }
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`curriculum-${Date.now()}.pdf`);
      toast.success("PDF Downloaded", { id: toastId });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to export PDF", { id: toastId });
    }
  };



  const exportToWord = () => {
    const tableStyles = `
      <style>
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #000000; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f3f4f6; font-bold: true; }
        h1, h2, h3 { font-family: sans-serif; }
        body { font-family: 'Segoe UI', serif; }
      </style>
    `;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'>${tableStyles}<title>Curriculum</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + (docRef.current?.innerHTML || "") + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `curriculum-${Date.now()}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    toast.success("Word document generated");
  };


  return (
    <div className="min-h-screen flex flex-col pt-20 pb-32 px-6 relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300 z-10">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[40%] left-[5%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/40 dark:bg-blue-900/10 blur-[130px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center"
        >
            <h1 className="text-4xl md:text-5xl font-bold font-aspekta tracking-tighter leading-tight pb-2">
                <span className="text-black dark:text-white">Architect your Perfect Curriculum</span>
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 font-geist text-sm">
                Describe your learning goals, and we&apos;ll build the roadmap for teachers or trainers.
            </p>
        </motion.div>

        <AnimatePresence mode="wait">
            {!hasResult ? (
                <>
                <div className="flex justify-center mb-10">
                  <div className="flex bg-gray-50/80 dark:bg-gray-800/50 p-1 rounded-full items-center border border-gray-100/50 dark:border-gray-700/50 h-12 shadow-sm relative">
                    {(['academic', 'professional'] as const).map((mode) => (
                       <button
                         key={mode}
                         onClick={() => setContextMode(mode)}
                         className={`relative px-8 py-2 text-base font-semibold rounded-full transition-all z-10 whitespace-nowrap`}
                         style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                       >
                         {contextMode === mode && (
                            <motion.div 
                                layoutId="activeContext"
                                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-600"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                         )}
                         <span className={`relative z-20 ${
                           contextMode === mode 
                           ? 'text-gray-900 dark:text-white' 
                           : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                         }`}>
                            {mode === "academic" ? "Guru / Akademik" : "Trainer / Profesional"}
                         </span>
                       </button>
                    ))}
                  </div>
                </div>

                <motion.div 
                    key="input-mode"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-4xl mx-auto relative shadow-[var(--shadow-premium-hover)] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-400/30 transition-all duration-500"
                    style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                >
                    <div className="h-10 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center px-4 justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-inter uppercase tracking-widest">
                          {contextMode === "academic" ? "Academic Mode" : "Professional Mode"}
                        </span>
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
                            placeholder={contextMode === "academic" ? "I want to build a curriculum for Bahasa Indonesia Grade 7..." : "I want to build a training plan for Excavator Operation Safety..."} 
                            className="w-full h-40 p-6 bg-transparent border-none outline-none focus-visible:ring-0 resize-none text-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 font-geist leading-relaxed shadow-none"
                        />
                        
                        <div className="px-5 pb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            </div>

                            <div className="flex items-center gap-4">
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
                        templates={CURRICULUM_TEMPLATES} 
                        onSelect={(p) => setPrompt(p)} 
                    />
                </div>

                {!isGenerating && recentDocs.length > 0 && (
                    <motion.div 
                        key="recent-curriculums"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-12 max-w-4xl mx-auto"
                    >
                        <h3 className="text-base font-medium text-gray-400/80 mb-4 px-4">Recent curriculums</h3>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {recentDocs.map((doc) => (
                                <div 
                                    key={doc.id}
                                    onClick={() => {
                                        setCurrentCurriculum(doc.content);
                                        setHasResult(true);
                                    }}
                                    className="p-1.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-white/5 transition-all cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/60"
                                >
                                    <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm group-hover:shadow-md transition-all flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <Image 
                                                src="/img/document.svg" 
                                                alt="doc" 
                                                width={24}
                                                height={24}
                                                className="opacity-80"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate font-aspekta tracking-tight">
                                                {doc.title}
                                            </h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">
                                              {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "No Date"}
                                            </p>
                                        </div>


                                        <div className="flex items-center gap-1.5">
                                            <div 
                                                onClick={(e) => handleDelete(e, doc.id)}
                                                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors group/del"
                                            >
                                                <TrashIcon className="w-4 h-4 text-gray-400 group-hover/del:text-red-600 transition-colors" />
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 transition-colors">
                                                <DocumentArrowUpIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
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
                            onClick={() => setHasResult(false)}
                            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all font-semibold"
                        >
                            <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Input
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4" style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-900 dark:text-white font-aspekta tracking-tight">Export Path</h3>
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                  <DocumentArrowUpIcon className="w-4 h-4 text-blue-600" />
                                </div>
                             </div>
                             
                             <div className="space-y-2">
                                <Button 
                                    onClick={exportToWord}
                                    className="w-full justify-start gap-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl h-11" variant="outline"
                                >
                                    <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold uppercase tracking-tight">Word (.docx)</span>
                                </Button>
                                <Button 
                                    onClick={exportToPDF}
                                    className="w-full justify-start gap-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl h-11" variant="outline"
                                >
                                    <DocumentTextIcon className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-bold uppercase tracking-tight">PDF Document</span>
                                </Button>

                             </div>
                        </div>

                          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-xl shadow-blue-500/20 border border-white/10" style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <SparklesIcon className="w-5 h-5 text-blue-200" />
                                <h3 className="font-bold text-white text-sm">Refinement AI</h3>
                            </div>
                            <p className="text-[11px] text-blue-100 mb-4 font-medium opacity-80 leading-relaxed">
                                Anda bisa mengedit hasil kurikulum di samping dengan memberikan instruksi tambahan di bawah ini.
                            </p>
                            
                            <form onSubmit={(e) => handleGenerate(e, true)} className="space-y-4">
                                <Textarea 
                                    className="bg-white/10 border-white/20 text-white text-xs h-32 placeholder:text-blue-200/50 focus-visible:ring-blue-300 rounded-xl resize-none backdrop-blur-md shadow-inner"
                                    placeholder="Contoh: 'Buatkan dalam Tabel untuk pembagian JP', 'Tambah materi tentang Etika digital', atau 'Ubah nada jadi lebih santai'..."
                                    value={refinementPrompt}
                                    onChange={(e) => setRefinementPrompt(e.target.value)}
                                    disabled={isGenerating}
                                />
                                <Button 
                                    type="submit"
                                    disabled={isGenerating || !refinementPrompt.trim()}
                                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-10 border-none transition-all active:scale-95 shadow-lg"
                                >
                                    {isGenerating ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : "Update Kurikulum"}
                                </Button>
                            </form>
                            
                            <Button 
                                variant="ghost" 
                                onClick={handleReset} 
                                className="w-full mt-4 text-blue-200 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                            >
                                Buat Baru
                            </Button>
                         </div>
                    </div>

                    <div className="lg:col-span-3">
                         <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl min-h-[850px] p-12 md:p-20 relative overflow-hidden border border-gray-100 dark:border-gray-800" style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                             <div 
                               ref={docRef}
                               className="max-w-3xl mx-auto space-y-8 font-serif leading-relaxed markdown-content prose dark:prose-invert"
                             >
                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                     {currentCurriculum}
                                 </ReactMarkdown>
                             </div>
                         </div>
                    </div>
                </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
