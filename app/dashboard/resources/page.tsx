"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  PlusIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { authClient } from "@/lib/auth-client";
import { getResources } from "@/lib/actions/user-actions";

// --- Types ---
type ResourceType = 'brainstorm' | 'curriculum' | 'note' | 'appscript';

interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  updatedAt: Date | string;
  status: string;
}

import { formatDistanceToNow } from "date-fns";

// --- Components ---
function ResourceCard({ item }: { item: ResourceItem }) {
  const getIcon = () => {
    switch (item.type) {
      case 'brainstorm': return <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-500" />;
      case 'curriculum': return <BookOpenIcon className="w-5 h-5 text-emerald-500" />;
      case 'appscript': return <CodeBracketIcon className="w-5 h-5 text-indigo-500" />;
      case 'note': return <Squares2X2Icon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col h-full shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 transition-all">
          {getIcon()}
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                item.status === 'Completed' || item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                item.status === 'In Progress' || item.status === 'Pending' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 
                'bg-gray-50 text-gray-400 dark:bg-gray-900'
            }`}>
                {item.status}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 capitalize">{item.type}</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">{item.title}</h3>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700/50">
        <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5 font-inter">
           {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
        </div>
        <button className="p-1 px-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-blue-600 transition-all text-[10px] font-bold">
          Open
        </button>
      </div>
    </motion.div>
  );
}

// --- Main Page ---
export default function ResourcesPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ResourceType | 'all'>('all');
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      if (!session?.user) {
        // Use a slight delay or Promise to avoid synchronous setState warning
        await Promise.resolve();
        setIsLoading(false);
        return;
      }

      const res = await getResources();
      if (res.success && res.data) {
        setResources(res.data as ResourceItem[]);
      }
      setIsLoading(false);
    };

    if (!isSessionLoading) {
      fetchResources();
    }
  }, [session?.user, isSessionLoading]);

  const filteredItems = resources.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-aspekta tracking-tighter pb-1 text-black dark:text-white">
            Resource Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium font-geist text-xs mt-0.5">
            {resources.length === 0 ? "No materials created yet." : `Manage your ${resources.length} learning materials.`}
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-blue-500/20">
          <PlusIcon className="w-4 h-4" />
          Create New
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex bg-gray-100/80 dark:bg-gray-800/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar items-center h-9">
          {(['all', 'brainstorm', 'curriculum', 'appscript', 'note'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1 whitespace-nowrap text-xs font-bold font-inter capitalize rounded-lg transition-all border border-transparent ${
                filter === t
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              {t === 'all' ? 'All' : t === 'brainstorm' ? 'Brainstorm' : t === 'curriculum' ? 'Curriculum' : t === 'appscript' ? 'AppScript' : 'Notes'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-[11px] font-bold font-geist outline-none focus:border-blue-400/50 transition-all shadow-sm"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
           <ChatBubbleBottomCenterTextIcon className="w-16 h-16 mb-4 text-gray-300" />
           <p className="text-sm font-bold uppercase tracking-widest text-gray-500">No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredItems.map((item) => (
              <ResourceCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
