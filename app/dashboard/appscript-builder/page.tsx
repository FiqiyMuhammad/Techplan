
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
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { saveScript, getScripts, deleteScript, updateScript } from "@/lib/actions/script-actions";
import { generateAppScript } from "@/lib/actions/ai-actions";
import { Message } from "@/lib/ai/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "@/components/elements/ConfirmModal";
import { InfoModal } from "@/components/elements/InfoModal";
import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
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
import ShinyText from "@/components/common/ShinyText";

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
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [currentFiles, setCurrentFiles] = useState<{name: string, code: string}[]>([{ name: "Code.gs", code: "" }]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [currentAiComment, setCurrentAiComment] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<"google" | "groq" | "openrouter">("google");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [refineImageBase64, setRefineImageBase64] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  useEffect(() => {
    async function loadScripts() {
        try {
            const data = await getScripts();
            const scripts = data as ScriptModel[];
            setRecentScripts(scripts);

            // Auto-load if ID is in URL
            const id = searchParams.get("id");
            if (id) {
                const script = scripts.find(s => s.id === id);
                if (script) {
                    let parsedFiles;
                    try {
                        parsedFiles = JSON.parse(script.code);
                        if (!Array.isArray(parsedFiles)) throw new Error();
                    } catch {
                        parsedFiles = [{ name: "Code.gs", code: script.code }];
                    }
                    setActiveScriptId(script.id);
                    setCurrentFiles(parsedFiles);
                    setActiveFileIndex(0);
                    setCurrentAiComment(script.description || "No instructions provided.");
                    setHasResult(true);
                }
            }
        } catch (error) {
            console.error("Failed to load scripts:", error);
        }
    }
    loadScripts();
  }, [searchParams]);

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
    const fileBlockRegex = /(?:###?\s*(?:File:?\s*)?|\*\*File:?\s*\*\*|File:?\s*)([a-zA-Z0-9_\-.]+)[\s\S]*?```([a-z]*)\n([\s\S]*?)```/gi;
    
    let codeGs = "";
    let indexHtml = "";
    
    const matches = Array.from(content.matchAll(fileBlockRegex));
    
    matches.forEach(match => {
      const fileName = match[1]?.toLowerCase() || "";
      const lang = match[2]?.toLowerCase() || "";
      const fileCode = match[3]?.trim() || "";

      if (fileName.endsWith('.gs') || fileName.includes('code') || lang === 'javascript' || lang === 'js') {
        codeGs += (codeGs ? "\n\n" : "") + fileCode;
      } else if (fileName.endsWith('.html') || fileName.includes('index') || lang === 'html') {
        indexHtml += (indexHtml ? "\n\n" : "") + fileCode;
      }
    });

    // Fallback if no specific file markers found
    if (!codeGs && !indexHtml) {
      const simpleCodeRegex = /```([a-z]*)\n([\s\S]*?)```/gi;
      const simpleMatches = Array.from(content.matchAll(simpleCodeRegex));
      
      simpleMatches.forEach((match) => {
        const lang = match[1]?.toLowerCase();
        const code = match[2].trim();
        if (lang === 'html') {
          indexHtml += (indexHtml ? "\n\n" : "") + code;
        } else {
          codeGs += (codeGs ? "\n\n" : "") + code;
        }
      });
    }

    // --- FAILSAFE BOILERPLATE INJECTION ---
    const hasDoGet = codeGs.includes("function doGet");
    if (!hasDoGet && (codeGs || indexHtml)) {
        const boilerplate = [
            "function doGet(e) {",
            "  return HtmlService.createTemplateFromFile('Index')",
            "    .evaluate()",
            "    .setTitle('Aplikasi Terintegrasi')",
            "    .addMetaTag('viewport', 'width=device-width, initial-scale=1')",
            "    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);",
            "}",
            "",
            "function include(filename) {",
            "  return HtmlService.createHtmlOutputFromFile(filename).getContent();",
            "}",
            ""
        ].join("\n");
        codeGs = boilerplate + "\n" + codeGs;
    }

    if (!indexHtml && codeGs.includes("createTemplateFromFile('Index')")) {
        indexHtml = `<!DOCTYPE html>\n<html>\n<head>\n  <base target="_top">\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-50 flex items-center justify-center min-h-screen">\n  <div class="bg-white p-8 rounded-2xl shadow-xl">\n    <h1 class="text-2xl font-bold text-slate-800">Menunggu AI...</h1>\n    <p class="text-slate-500">Silakan lengkapi instruksi Anda untuk membangun UI.</p>\n  </div>\n</body>\n</html>`;
    }
    // --------------------------------------

    const files: { name: string, code: string }[] = [];
    if (codeGs) files.push({ name: "Code.gs", code: codeGs });
    if (indexHtml) files.push({ name: "Index.html", code: indexHtml });

    if (files.length === 0) {
      files.push({ name: "Code.gs", code: content });
    }

    // Strip matched blocks from the comment
    let comment = content;
    comment = comment.replace(fileBlockRegex, "");
    comment = comment.replace(/```[a-z]*\n[\s\S]*?```/gi, "");

    return { files, comment: comment.trim() };
  };

  const handleGenerate = async (e?: React.FormEvent, isRefinement = false) => {
    if (e) e.preventDefault();
    const activePrompt = isRefinement ? refinementPrompt : prompt;
    if (!activePrompt.trim()) return;

    setIsGenerating(true);
    
    try {
        let finalPrompt = activePrompt;
        if (isRefinement) {
            const currentCodeContext = currentFiles.map(f => `### File: ${f.name}\n\`\`\`javascript\n${f.code}\n\`\`\``).join("\n\n");
            finalPrompt = `Berikut adalah kode App Script saya saat ini:\n\n${currentCodeContext}\n\nPermintaan revisi/perbaikan/tambahan:\n${activePrompt}\n\nATURAN PENTING REFINE:\nAnda WAJIB menghasilkan ulang seluruh file kode secara utuh (FULL REWRITE) menggunakan format '### File: [Nama File]' beserta \`\`\` lengkap. Jangan hanya memberikan potongan kode (snippets)!\nSaya butuh file penuh yang bisa langsung di-copy-paste menggantikan yang lama.`;
        }

        const result = await generateAppScript(
            finalPrompt, 
            chatHistory,
            selectedProvider,
            selectedProvider === "google" ? "google/gemini-2.0-flash-001" : 
            selectedProvider === "groq" ? "llama-3.3-70b-versatile" : "openai/gpt-4o-mini",
            isRefinement ? refineImageBase64 || undefined : imageBase64 || undefined
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
              const saved = await saveScript({
                  title: activePrompt.length > 30 ? activePrompt.substring(0, 30) + "..." : activePrompt,
                  code: JSON.stringify(files),
                  description: comment,
                  language: "javascript"
              });
              if (saved) setActiveScriptId(saved.id);
              const data = await getScripts();
              setRecentScripts(data as ScriptModel[]);
              setHasResult(true);
            } else {
              if (activeScriptId) {
                await updateScript(activeScriptId, {
                  code: JSON.stringify(files),
                  description: comment
                });
              }
              setRefinementPrompt("");
              setRefineImageBase64(null);
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
      setActiveScriptId(null);
      setCurrentFiles([{ name: "Code.gs", code: "" }]);
      setActiveFileIndex(0);
      setCurrentAiComment("");
      setImageBase64(null);
      setRefineImageBase64(null);
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

      <InfoModal 
        isOpen={isIntroModalOpen} 
        onClose={() => setIsIntroModalOpen(false)} 
        title="Mengenal Google Apps Script"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white text-base">Apa itu Apps Script?</h4>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              <strong>Google Apps Script</strong> adalah platform pengembangan aplikasi berbasis awan yang memungkinkan Anda mengotomatiskan tugas di seluruh ekosistem Google Workspace. Dengan fokus utama pada <strong>Google Sheets</strong>, Anda dapat mengubah lembar kerja statis menjadi alat kerja yang dinamis dan cerdas.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-base">Kemampuan Otomatisasi Utama</h4>
            <div className="space-y-3">
                <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xs">01</span>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-white text-sm mb-1">Pengolahan Data Google Sheets</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Dari pembuatan laporan otomatis, validasi data kompleks, hingga sinkronisasi antar file spreadsheet secara *real-time*.</p>
                    </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">02</span>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-white text-sm mb-1">Integrasi Lintas Layanan</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Menghubungkan Sheets dengan Gmail untuk notifikasi otomatis, atau dengan Kalender untuk penjadwalan terpusat.</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="p-5 bg-gray-50 dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase mb-3 tracking-wider">AI sebagai Asisten Cerdas</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Builder AI kami dirancang untuk mempercepat proses penulisan skrip dengan menghasilkan logika inti secara instan. Meskipun sangat handal dalam menangani pola otomatisasi standar, kami menyarankan verifikasi akhir untuk memastikan kode berjalan sempurna sesuai dengan struktur unik data Anda.
            </p>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[11px] text-gray-500 italic">
                    &quot;Membantu Anda fokus pada strategi, sementara AI menangani kerangka kodenya.&quot;
                </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/5">
            <h4 className="font-bold text-amber-800 dark:text-amber-500 text-[10px] uppercase mb-2">Batasan Teknis</h4>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 leading-relaxed">
              Google menerapkan limit kuota harian untuk durasi eksekusi skrip dan jumlah email terkirim. Untuk sistem berskala sangat besar, tim kami siap membantu konsultasi infrastruktur lebih lanjut.
            </p>
          </div>
        </div>
      </InfoModal>

      <InfoModal 
        isOpen={isUsageModalOpen} 
        onClose={() => setIsUsageModalOpen(false)} 
        title="Panduan Instalasi"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ikuti langkah profesional berikut untuk memasang skrip otomatisasi Anda:</p>
          
          <div className="space-y-4">
            {[
              { step: "1", title: "Buat Google Spreadsheet", desc: "Buka Google Sheets, buat spreadsheet baru, dan beri nama. Biarkan kosong, sistem akan membuatnya otomatis nanti." },
              { step: "2", title: "Buka Apps Script", desc: "Di menu Google Sheet, klik Extensions (Ekstensi) > Apps Script." },
              { step: "3", title: "Pasang Kode Backend (Code.gs)", desc: "Hapus semua kode yang ada di file Code.gs, lalu salin dan tempel kode Code.gs yang dihasilkan AI di atas." },
              { step: "4", title: "Buat File HTML (Index.html)", desc: "Hanya jika AI menghasilkan HTML: Klik tanda tambah (+) di samping 'Files', pilih HTML, beri nama filenya Index (Huruf 'I' harus besar). Hapus isinya, lalu salin dan tempel kode Index.html." },
              { step: "5", title: "Konfigurasi Deployment", desc: "Klik tombol biru Terapkan atau Deploy (di kanan atas) > Deployment baru atau New deployment." },
              { step: "6", title: "Pilih Jenis Aplikasi Web", desc: "Klik ikon gerigi (pengaturan) kemudian pilih jenis Aplikasi web. Berikan deskripsi. Atur 'Jalankan sebagai' ke email Anda, dan 'Yang memiliki akses' menjadi Anyone (Siapa saja). Klik Terapkan atau Deploy." },
              { step: "7", title: "Izinkan Akses", desc: "Jika diminta, tekan tombol 'Izinkan akses' biru dan Continue. Terakhir, salin URL Web App yang diberikan untuk membuka aplikasi Anda." }
            ].map((item, idx, arr) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        {item.step}
                    </div>
                    {idx !== arr.length - 1 && <div className="w-px h-full bg-gray-100 dark:bg-gray-800 my-1"></div>}
                </div>
                <div className="pb-4">
                    <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Tips Cepat</p>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
              Jika muncul peringatan <strong>&quot;Google hasn&apos;t verified this app&quot;</strong>, klik <strong>Advanced</strong> lalu pilih <strong>Go to [Nama Project] (unsafe)</strong> untuk melanjutkan. Jika setelah diizinkan layar menjadi putih/blank, cukup lakukan <strong>Refresh (Muat Ulang)</strong> halaman browser Anda.
            </p>
          </div>
        </div>
      </InfoModal>
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[40%] left-[5%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/40 dark:bg-emerald-900/10 blur-[130px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center"
        >
            <h1 className="text-4xl md:text-5xl font-bold font-aspekta tracking-tighter leading-tight pb-2">
                <ShinyText 
                    text="AppScript Builder AI" 
                    speed={3} 
                    color="currentColor"
                    shineColor="var(--shimmer-color)"
                    className="text-black dark:text-white"
                />
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 font-geist text-sm">
                Describe the automation or script you need, and the AI will generate it for you.
            </p>

            <div className="flex justify-center gap-3 mt-6">
                <Button 
                    variant="outline" 
                    onClick={() => setIsIntroModalOpen(true)}
                    className="h-10 px-6 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm text-[12px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-geist"
                >
                    Apa itu Apps Script?
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => setIsUsageModalOpen(true)}
                    className="h-10 px-6 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm text-[12px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-geist"
                >
                    Cara pemasangan
                </Button>
            </div>
        </motion.div>

        <AnimatePresence mode="wait">
            {!hasResult ? (
                <>
                <motion.div 
                    key="input-mode"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full max-w-4xl mx-auto p-1.5 rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-[1.3rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl">
                    <div className="h-10 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center px-6 justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-inter uppercase tracking-widest">Script Requirement</span>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-900"></div>
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
                                className="w-full h-44 p-6 md:p-8 bg-transparent border-none outline-none focus-visible:ring-0 resize-none text-sm md:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 font-geist leading-relaxed shadow-none custom-scrollbar overflow-y-auto"
                            />
                            
                            {imageBase64 && (
                                <div className="absolute bottom-24 md:bottom-20 left-6 md:left-8">
                                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm group">
                                        <img src={imageBase64} alt="Upload preview" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => setImageBase64(null)}
                                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="px-6 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        id="image-upload" 
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error("File terlalu besar (Maks 2MB). Token akan sangat boros!");
                                                    e.target.value = '';
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = () => setImageBase64(reader.result as string);
                                                reader.readAsDataURL(file);
                                                toast.info("Media ditambahkan. Fitur media ini mengonsumsi token lebih banyak.");
                                            }
                                            e.target.value = '';
                                        }}
                                    />
                                    <label 
                                        htmlFor="image-upload"
                                        className={`cursor-pointer px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                                            imageBase64 
                                                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' 
                                                : 'text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                        <span className="text-xs font-bold font-geist">{imageBase64 ? 'Media Siap' : 'Add Media'}</span>
                                    </label>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                    <div className="flex flex-col items-end flex-1 md:flex-none">
                                        <Select 
                                             value={selectedProvider} 
                                             onValueChange={(val: "google" | "groq" | "openrouter") => setSelectedProvider(val)}
                                             disabled={isGenerating}
                                         >
                                             <SelectTrigger className="w-full md:w-[160px] h-9 rounded-xl bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-all px-3">
                                                 <SelectValue placeholder="Select Model" />
                                             </SelectTrigger>
                                             <SelectContent className="rounded-xl border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-2xl p-1.5">
                                                 <SelectItem value="google" className="rounded-lg py-2 px-2 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 transition-all cursor-pointer">
                                                     <div className="flex flex-col">
                                                         <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100">Gemini 2.0</span>
                                                         <span className="text-[9px] text-gray-500 font-medium">Flash Model • 3 Credits</span>
                                                     </div>
                                                 </SelectItem>
                                                 <SelectItem value="groq" className="rounded-lg py-2 px-2 focus:bg-orange-50 dark:focus:bg-orange-900/20 transition-all cursor-pointer">
                                                     <div className="flex flex-col">
                                                         <span className="text-[12px] font-bold text-orange-600">Llama 3.3 Fast</span>
                                                         <span className="text-[9px] text-gray-500 font-medium">Versatile • 2 Credits</span>
                                                     </div>
                                                 </SelectItem>
                                                 <SelectItem value="openrouter" className="rounded-lg py-2 px-2 focus:bg-blue-50 dark:focus:bg-blue-900/20 transition-all cursor-pointer">
                                                     <div className="flex flex-col">
                                                         <span className="text-[12px] font-bold text-blue-600">GPT-4o Premium</span>
                                                         <span className="text-[9px] text-gray-500 font-medium">Advanced • 5 Credits</span>
                                                     </div>
                                                 </SelectItem>
                                             </SelectContent>
                                         </Select>
                                    </div>

                                     <Button 
                                        onClick={() => handleGenerate()}
                                        disabled={isGenerating || !prompt.trim()}
                                        className={`h-9 flex-1 md:flex-none px-5 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20 rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group ${isGenerating ? 'opacity-80' : ''}`}
                                    >
                                        {isGenerating ? (
                                            <>
                                              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                              <span className="text-xs font-bold font-geist">Analysing...</span>
                                            </>
                                        ) : (
                                            <span className="text-[11px] font-bold uppercase tracking-widest font-geist">Generate Script</span>
                                        )}
                                    </Button>
                                </div>
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
                                        setActiveScriptId(script.id);
                                        setCurrentFiles(parsedFiles);
                                        setActiveFileIndex(0);
                                        setCurrentAiComment(script.description || "No instructions provided.");
                                        setHasResult(true);
                                    }}
                                    className="relative p-1 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer group hover:bg-emerald-50/10"
                                >
                                    <div className="p-4 bg-white dark:bg-gray-900 rounded-[1rem] border border-gray-100 dark:border-white/5 shadow-sm group-hover:shadow-md transition-all flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <CodeBracketIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-12">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{script.title}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">
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

                    <div className="flex flex-col gap-8">
                        {/* Editor Section - Top Full Width */}
                        <div className="w-full space-y-4">
                            <div className="p-1.5 rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="w-full bg-[#1e1e1e] rounded-[1.3rem] shadow-2xl border border-gray-800 overflow-hidden relative group">
                                    <div className="flex items-center justify-between px-4 py-0 bg-[#252526] border-b border-[#333]">
                                        <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
                                            {/* Window controls */}
                                            <div className="flex gap-1.5 px-4 items-center border-r border-gray-800/50 mr-2 py-4">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60 transition-colors hover:bg-red-500"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 transition-colors hover:bg-yellow-500"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60 transition-colors hover:bg-green-500"></div>
                                            </div>
                                            
                                            {/* Tabs */}
                                            <div className="flex items-stretch h-full">
                                                {currentFiles.map((file, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveFileIndex(idx)}
                                                        className={`px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-all relative flex items-center gap-2 border-r border-gray-800/50 ${
                                                            activeFileIndex === idx 
                                                            ? (file.name.endsWith('.html') ? 'text-[#ce9178] bg-[#1e1e1e]' : 'text-emerald-400 bg-[#1e1e1e]')
                                                            : 'text-gray-500 bg-[#2d2d2d]/30 hover:text-gray-300 hover:bg-[#2d2d2d]/50'
                                                        }`}
                                                    >
                                                        {activeFileIndex === idx && (
                                                            <div className={`absolute top-0 left-0 right-0 h-[2px] shadow-sm ${
                                                                file.name.endsWith('.html') 
                                                                ? 'bg-[#ce9178] shadow-[#ce9178]/50' 
                                                                : 'bg-emerald-400 shadow-emerald-400/50'
                                                            }`}></div>
                                                        )}
                                                        <CodeBracketIcon className="w-3.5 h-3.5" />
                                                        {file.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center pl-4 pr-2 ml-auto">
                                            <Button 
                                                onClick={handleCopy}
                                                variant="ghost"
                                                className={`h-8 px-4 flex items-center gap-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${isCopied ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {isCopied ? (
                                                    <CheckIcon className="w-4 h-4" />
                                                ) : (
                                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                                )}
                                                <span className="text-[11px] font-bold uppercase tracking-widest">{isCopied ? 'Copied' : 'Copy'}</span>
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 md:p-10 overflow-auto max-h-[600px] custom-scrollbar min-h-[400px] bg-[#1a1a1b]">
                                        <pre className="font-mono text-sm leading-relaxed">
                                            <code className="block">
                                                {currentFiles[activeFileIndex]?.code.split('\n').map((line, i) => (
                                                    <div key={i} className="table-row group/line">
                                                        <span className="table-cell select-none pr-6 text-gray-700 text-right w-10 text-[10px] font-bold opacity-50 group-hover/line:opacity-100 transition-opacity">{i + 1}</span>
                                                        <span className={`table-cell whitespace-pre-wrap ${
                                                            currentFiles[activeFileIndex]?.name.endsWith('.html') 
                                                            ? 'text-[#ce9178]' 
                                                            : 'text-emerald-300/90'
                                                        }`}>{line || ' '}</span>
                                                    </div>
                                                ))}
                                            </code>
                                        </pre>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Verified for Google V8 Runtime
                                    </div>
                                    <div className="flex gap-4">
                                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Type: {currentFiles[activeFileIndex]?.name.endsWith('.html') ? 'UI Module' : 'Logic Script'}</span>
                                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">UTF-8</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Section - Bottom Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Summary & Install Card */}
                            <div className="p-1.5 rounded-[1.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                                <div className="bg-white dark:bg-gray-800 rounded-[1.3rem] p-6 border border-gray-100 dark:border-gray-700 space-y-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white font-aspekta tracking-tight">AI Deployment Guide</h3>
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <SparklesIcon className="w-4 h-4 text-emerald-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="prose dark:prose-invert prose-xs max-w-none text-gray-600 dark:text-gray-400 font-geist leading-relaxed markdown-content flex-1 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {currentAiComment}
                                        </ReactMarkdown>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 flex flex-col gap-3">
                                        <Button 
                                            onClick={handleDownload}
                                            variant="outline"
                                            className="w-full justify-center gap-2 font-bold h-9 rounded-xl border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
                                        >
                                            <DocumentArrowUpIcon className="w-4 h-4 text-emerald-500" />
                                            Download Current File
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            onClick={() => window.open('https://script.google.com', '_blank')}
                                            className="w-full justify-center gap-2 font-bold h-9 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border border-emerald-100 dark:border-emerald-800/50 text-xs"
                                        >
                                            Open Google Script Console
                                            <ArrowPathIcon className="w-3 h-3 rotate-45" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Refinement Interface */}
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[1.5rem] p-8 shadow-2xl shadow-emerald-900/40 border border-white/20 flex flex-col relative overflow-hidden group min-h-[450px]">
                                {/* Decorative AI background element */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-all duration-700"></div>
                                
                                <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between w-full mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                                                    <SparklesIcon className="w-7 h-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-2xl font-aspekta tracking-tight">Refine Logic</h3>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></div>
                                                        <span className="text-[11px] text-emerald-100 font-bold uppercase tracking-widest opacity-80">AI Assistant Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {chatHistory.length > 2 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        const newHistory = chatHistory.slice(0, -2);
                                                        setChatHistory(newHistory);
                                                        const lastAssistantMessage = newHistory[newHistory.length - 1]?.content as string;
                                                        if (lastAssistantMessage) {
                                                            const { files, comment } = parseAiResponse(lastAssistantMessage);
                                                            setCurrentFiles(files);
                                                            setActiveFileIndex(0);
                                                            setCurrentAiComment(comment);
                                                            toast.success("Reverted to previous state!");
                                                        }
                                                    }}
                                                    className="h-8 px-3 rounded-lg border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-[11px] font-bold tracking-wider"
                                                >
                                                    <ArrowPathIcon className="w-3.5 h-3.5 mr-1.5 -scale-x-100" />
                                                    Undo Last AI
                                                </Button>
                                            )}
                                        </div>
                                    
                                    <p className="text-[13px] text-white/90 mb-8 font-medium leading-relaxed max-w-[90%]">
                                        Need to add features or change how the script works? Describe your changes below.
                                    </p>
                                    
                                    <form onSubmit={(e) => handleGenerate(e, true)} className="space-y-6 flex-1 flex flex-col">
                                        <div className="relative flex-1">
                                            <Textarea 
                                                className="bg-black/20 border-white/10 text-white text-[14px] min-h-[180px] h-full pl-5 pt-5 pr-5 pb-16 placeholder:text-emerald-200/40 focus:bg-black/30 focus:border-white/30 focus-visible:ring-emerald-400/30 rounded-2xl resize-none backdrop-blur-xl transition-all shadow-inner font-geist leading-relaxed custom-scrollbar overflow-y-auto"
                                                placeholder="e.g., 'Add a timestamp to each row and send an email notification when done'..."
                                                value={refinementPrompt}
                                                onChange={(e) => setRefinementPrompt(e.target.value)}
                                                disabled={isGenerating}
                                                onPaste={(e) => {
                                                    const items = e.clipboardData?.items;
                                                    if (!items) return;
                                                    
                                                    for (let i = 0; i < items.length; i++) {
                                                        const item = items[i];
                                                        if (item.type.indexOf('image') !== -1) {
                                                            const file = item.getAsFile();
                                                            if (!file) continue;
                                                            
                                                            if (file.size > 2 * 1024 * 1024) {
                                                                toast.error("File terlalu besar (Maks 2MB). Token akan sangat boros!");
                                                                return;
                                                            }
                                                            
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setRefineImageBase64(reader.result as string);
                                                            reader.readAsDataURL(file);
                                                            toast.info("Media dari clipboard ditambahkan.");
                                                            break; // Limit to 1 image
                                                        }
                                                    }
                                                }}
                                            />
                                            
                                            {/* Preview Image */}
                                            {refineImageBase64 && (
                                                <div className="absolute bottom-16 left-5 z-20">
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shadow-sm group">
                                                        <img src={refineImageBase64} alt="Upload preview" className="w-full h-full object-cover" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setRefineImageBase64(null)}
                                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                        >
                                                            <TrashIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute bottom-4 left-4 z-20 flex items-center">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    id="refine-image-upload" 
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 2 * 1024 * 1024) {
                                                                toast.error("File terlalu besar (Maks 2MB). Token akan sangat boros!");
                                                                e.target.value = '';
                                                                return;
                                                            }
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setRefineImageBase64(reader.result as string);
                                                            reader.readAsDataURL(file);
                                                            toast.info("Media ditambahkan.");
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                                <label 
                                                    htmlFor="refine-image-upload"
                                                    className={`cursor-pointer px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                                                        refineImageBase64 
                                                            ? 'text-white bg-white/20' 
                                                            : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
                                                    }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                    </svg>
                                                    <span className="text-[10px] font-bold font-geist">{refineImageBase64 ? 'Media Siap' : 'Add Media'}</span>
                                                </label>
                                            </div>

                                            <div className="absolute bottom-4 right-6 text-[9px] text-emerald-300/40 font-bold uppercase tracking-[0.2em] font-mono pointer-events-none">
                                                Smart Refinement Mode
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            type="submit"
                                            disabled={isGenerating || !refinementPrompt.trim()}
                                            className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl h-12 border-none transition-all active:scale-[0.98] shadow-xl shadow-emerald-900/30 text-sm flex items-center justify-center gap-2 group/btn mt-auto"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                    <span>Re-engineering Code...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Update Logic with AI</span>
                                                    <SparklesIcon className="w-4 h-4 text-white transition-transform group-hover/btn:rotate-12" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
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
