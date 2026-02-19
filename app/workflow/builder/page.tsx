
"use client";

import dynamic from 'next/dynamic';
import { ReactFlowProvider } from 'reactflow';

const WorkflowEditor = dynamic(
  () => import('@/components/workflow/WorkflowEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 animate-pulse">Initializing Canvas...</p>
        </div>
      </div>
    )
  }
);

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  );
}
