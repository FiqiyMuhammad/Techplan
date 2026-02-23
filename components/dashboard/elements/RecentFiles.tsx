"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpenIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CodeBracketIcon, 
  Squares2X2Icon,
  ChevronRightIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { getResources } from "@/lib/actions/user-actions";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

type ResourceType = 'brainstorm' | 'curriculum' | 'note' | 'appscript';

interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  updatedAt: Date | string;
  status: string;
}

export function RecentFiles() {
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["recent-files"],
    queryFn: async () => {
      const res = await getResources();
      return res.success ? (res.data as ResourceItem[]).slice(0, 4) : [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'brainstorm': return <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-blue-500" />;
      case 'curriculum': return <BookOpenIcon className="w-4 h-4 text-emerald-500" />;
      case 'appscript': return <CodeBracketIcon className="w-4 h-4 text-indigo-500" />;
      case 'note': return <Squares2X2Icon className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[var(--shadow-premium)] overflow-hidden">
      <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderIcon className="w-5 h-5 text-blue-600" />
          Recent Files
        </h3>
        <Link 
          href="/dashboard/resources" 
          className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          View All <ChevronRightIcon className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        <AnimatePresence mode="popLayout">
          {resources.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="p-10 text-center"
            >
              <p className="text-xs font-bold text-gray-400">No recent files</p>
            </motion.div>
          ) : (
            resources.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
              >
                <Link
                  href={
                    item.type === 'curriculum' ? `/dashboard/curriculum?id=${item.id}` :
                    item.type === 'appscript' ? `/dashboard/appscript-builder?id=${item.id}` :
                    item.type === 'brainstorm' ? `/workflow/builder/${item.id}` :
                    `/dashboard/analytics?tab=notes`
                  }
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pb-0.5">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-gray-400 capitalize">{item.type}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
