"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MagnifyingGlassIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  EllipsisHorizontalIcon,
  FolderIcon,
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
    <div
      className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col h-full shadow-sm"
    >
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <div className="p-1.5 md:p-2 rounded-lg bg-gray-50 dark:bg-gray-900 transition-all">
          {getIcon()}
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <EllipsisHorizontalIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5 md:mb-2">
            <span className={`px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-medium ${
                item.status === 'Completed' || item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                item.status === 'In Progress' || item.status === 'Pending' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 
                'bg-gray-50 text-gray-400 dark:bg-gray-900'
            }`}>
                {item.status}
            </span>
            <span className="text-[9px] md:text-[10px] font-medium text-gray-400 dark:text-gray-500 capitalize">{item.type}</span>
        </div>
        <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">{item.title}</h3>
      </div>

      <div className="mt-3 md:mt-4 flex flex-col xs:flex-row items-start xs:items-center justify-between pt-2.5 md:pt-3 border-t border-gray-50 dark:border-gray-700/50 gap-2">
        <div className="text-[9px] md:text-[10px] font-normal text-gray-400 dark:text-gray-500 flex items-center gap-1.5 font-inter">
           {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
        </div>
        <Link 
          href={
            item.type === 'curriculum' ? `/dashboard/curriculum?id=${item.id}` :
            item.type === 'appscript' ? `/dashboard/appscript-builder?id=${item.id}` :
            item.type === 'brainstorm' ? `/workflow/builder/${item.id}` :
            `/dashboard/analytics?tab=notes`
          }
          className="w-full xs:w-auto text-center px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-[10px] md:text-xs font-semibold border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function ResourcesPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ResourceType | 'all'>('all');
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 4 : 8);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      if (!session?.user) {
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold font-aspekta tracking-tighter pb-1 text-black dark:text-white">
            My Recent Files
          </h1>
          <p className="text-gray-400 dark:text-gray-500 font-medium font-geist text-[11px] mt-0.5 italic">
            {resources.length === 0 ? "You haven't saved any files yet." : `${resources.length} files saved in your collection.`}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex bg-gray-100/80 dark:bg-gray-800/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar items-center h-10 md:h-9">
          {(['all', 'brainstorm', 'curriculum', 'appscript', 'note'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilter(t);
                setCurrentPage(1);
              }}
              className={`px-3.5 md:px-4 py-1.5 md:py-1 whitespace-nowrap text-[11px] md:text-xs font-bold font-inter capitalize rounded-lg transition-all border border-transparent ${
                filter === t
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              {t === 'all' ? 'All' : t === 'brainstorm' ? 'Brainstorm' : t === 'curriculum' ? 'Curriculum' : t === 'appscript' ? 'AppScript' : 'Notes'}
            </button>
          ))}
        </div>

        <div className="relative group w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search your files..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium font-geist shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <FolderIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
           </div>
           <p className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-tight">No files found</p>
           <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 italic font-medium">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {paginatedItems.map((item) => (
                <ResourceCard key={item.id} item={item} />
              ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-gray-100/50 dark:bg-gray-800/30 border border-gray-100/10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[28px] h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
