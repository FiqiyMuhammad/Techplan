
"use client";

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '@/components/workflow/nodes/CustomNodes';
import CustomEdge from '@/components/workflow/edges/CustomEdge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  PencilIcon, 
  DocumentTextIcon, 
  Square2StackIcon,
  FolderIcon,
  ChevronLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { getWorkflows, saveWorkflow, deleteWorkflow } from '@/lib/actions/workflow-actions';
import { toast } from 'sonner';
import ConfirmModal from '@/components/elements/ConfirmModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkflowModel {
    id: string;
    title: string;
    nodes: unknown;
    edges: unknown;
    color: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const edgeTypes = {
  custom: CustomEdge,
};

export default function WorkflowEditor({ initialId }: { initialId?: string }) {
  const searchParams = useSearchParams();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(initialId || null);
  
  const [workflowTitle, setWorkflowTitle] = useState(searchParams.get('title') || "Untitled Workflow");
  const [workflowColor, setWorkflowColor] = useState(searchParams.get('color') || "blue");
  
  // Drag State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const queryClient = useQueryClient();

  const { data: savedWorkflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
        const data = await getWorkflows();
        return data as WorkflowModel[];
    }
  });

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (initialId && savedWorkflows.length > 0 && !hasLoadedRef.current) {
        const target = savedWorkflows.find(w => w.id === initialId);
        if (target) {
            setWorkflowTitle(target.title);
            setWorkflowColor(target.color || "blue");
            setNodes((target.nodes as Node[]) || []);
            setEdges((target.edges as Edge[]) || []);
            hasLoadedRef.current = true;
        }
    }
  }, [initialId, savedWorkflows, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ 
        ...params, 
        type: 'custom',
        animated: true, 
        style: { strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed } 
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: Math.random().toString(),
        type,
        position,
        data: { label: type === 'diamond' ? 'Decision?' : `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const saveMutation = useMutation({
    mutationFn: saveWorkflow,
    onSuccess: (saved) => {
        setCurrentWorkflowId(saved.id);
        queryClient.invalidateQueries({ queryKey: ['workflows'] });
        toast.success("Workflow saved");
    },
    onError: (error) => {
        console.error("Failed to save workflow:", error);
        toast.error("Failed to save workflow");
    }
  });

  const handleSave = () => {
    // Sanitize nodes to remove internal React Flow properties (symbols like 'internals')
    const sanitizedNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        dragHandle: node.dragHandle,
        parentNode: node.parentNode,
        extent: node.extent
    }));

    // Sanitize edges to ensure serializable data
    const sanitizedEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        animated: edge.animated,
        style: edge.style,
        markerEnd: edge.markerEnd,
        data: edge.data,
        label: edge.label
    }));

    saveMutation.mutate({
        id: currentWorkflowId || undefined,
        title: workflowTitle,
        nodes: sanitizedNodes,
        edges: sanitizedEdges,
        color: workflowColor
    });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: (_, deletedId) => {
        queryClient.invalidateQueries({ queryKey: ['workflows'] });
        toast.success("Workflow deleted");
        if (currentWorkflowId === deletedId) createNew();
    },
    onError: () => {
        toast.error("Failed to delete workflow");
    }
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteWorkflow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const loadWorkflow = (w: WorkflowModel) => {
      setCurrentWorkflowId(w.id);
      setWorkflowTitle(w.title);
      setWorkflowColor(w.color || "blue");
      setNodes((w.nodes as Node[]) || []);
      setEdges((w.edges as Edge[]) || []);
  };

  const createNew = () => {
      setCurrentWorkflowId(null);
      setWorkflowTitle("New Workflow");
      setWorkflowColor("blue");
      setNodes([]);
      setEdges([]);
  };

  useEffect(() => {
    // Determine initial sidebar state after mount to avoid hydration mismatch
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-inter">
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
      />
      
      {/* Sidebar - Projects & Nodes */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`video-editor-sidebar w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-40 shadow-xl transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-80'} fixed md:relative h-full`}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
           <div className="flex items-center gap-2">
             <Link href="/dashboard" className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -ml-2 rounded-lg transition-colors">
                <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
             </Link>
             <span className="font-bold text-lg font-aspekta">Workflows</span>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
             <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
           </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 border-b border-gray-100 dark:border-gray-800">
           <button 
            onClick={createNew}
            className="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group font-medium text-sm text-gray-600 dark:text-gray-300"
           >
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <PlusIcon className="w-4 h-4" />
              </div>
              New Workflow
           </button>
           
           {savedWorkflows.map((w) => (
             <div key={w.id} className="group/item relative">
                <button 
                    onClick={() => {
                      loadWorkflow(w);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all font-medium text-sm text-left pr-10 ${currentWorkflowId === w.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <FolderIcon className="w-4 h-4" />
                    <span className="truncate">{w.title}</span>
                </button>
                <button 
                    onClick={(e) => handleDeleteWorkflow(e, w.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
             </div>
           ))}

           {!isLoading && savedWorkflows.length === 0 && (
               <p className="text-[10px] text-gray-400 text-center py-4 italic">No saved workflows yet.</p>
           )}
        </div>

        {/* Nodes Palette */}
        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 flex-1">
           <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Nodes Library</h3>
           <div className="grid grid-cols-1 gap-4">
              <div 
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 cursor-grab flex items-center gap-4 transition-all hover:shadow-md"
                onDragStart={(event) => onDragStart(event, 'diamond')} 
                draggable
              >
                 <div className="w-8 h-8 rotate-45 border-2 border-gray-900 dark:border-white" />
                 <span className="font-semibold text-sm">Diamond</span>
              </div>
              
              <div 
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 cursor-grab flex items-center gap-4 transition-all hover:shadow-md"
                onDragStart={(event) => onDragStart(event, 'circle')} 
                draggable
              >
                 <div className="w-8 h-8 rounded-full border-2 border-gray-900 dark:border-white" />
                 <span className="font-semibold text-sm">Circle</span>
              </div>

              <div 
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 cursor-grab flex items-center gap-4 transition-all hover:shadow-md"
                onDragStart={(event) => onDragStart(event, 'rectangle')} 
                draggable
              >
                 <div className="w-10 h-6 rounded-md border-2 border-gray-900 dark:border-white" />
                 <span className="font-semibold text-sm">Roadmap</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        
        {/* Top Bar Overlay */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-10 flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-none">
           <div className="flex items-center gap-3 pointer-events-auto">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className={`p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl transition-all ${isSidebarOpen ? 'hidden' : 'flex'}`}
                >
                  <Square2StackIcon className="w-5 h-5 text-gray-600" />
                </button>
                <div className="relative">
                  <input 
                      value={workflowTitle}
                      onChange={(e) => setWorkflowTitle(e.target.value)}
                      className="bg-white dark:bg-gray-900 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:min-w-[200px]" 
                  />
                  <PencilIcon className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
           </div>
           
           <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl flex gap-1 pointer-events-auto w-full md:w-auto">
              <button 
                onClick={handleSave}
                className="flex-1 md:flex-none px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                 Save Changes
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                 <DocumentTextIcon className="w-4 h-4" />
                 <span className="hidden sm:inline">Export</span>
              </button>
           </div>
        </div>

        {/* Floating Bottom Toolbar */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto w-[calc(100%-2rem)] md:w-auto">
            <div className="bg-white dark:bg-gray-900/90 backdrop-blur-md p-1.5 md:p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl flex items-center justify-center gap-1 md:gap-2">
               <button 
                className="p-2.5 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-600 dark:text-gray-300 flex flex-col items-center gap-1 min-w-[55px] md:min-w-[60px]"
                onClick={() => {
                    const id = Math.random().toString();
                    const position = reactFlowInstance?.project({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) || { x: 300, y: 300 };
                    setNodes((nds) => nds.concat({ id, type: 'rectangle', position, data: { label: 'New Node' } }));
                }}
               >
                   <Square2StackIcon className="w-5 h-5 md:w-5 md:h-5 text-blue-500" />
                   <span className="text-[9px] md:text-[10px] font-bold">Shape</span>
               </button>
               <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
               <button className="p-2.5 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-600 dark:text-gray-300 flex flex-col items-center gap-1 min-w-[55px] md:min-w-[60px]">
                   <DocumentTextIcon className="w-5 h-5 md:w-5 md:h-5 text-emerald-500" />
                   <span className="text-[9px] md:text-[10px] font-bold">Text</span>
               </button>
               <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 md:hidden" />
               <button 
                className="md:hidden p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-600 dark:text-gray-300 flex flex-col items-center gap-1 min-w-[55px]"
                onClick={() => setIsSidebarOpen(true)}
               >
                   <FolderIcon className="w-5 h-5 text-indigo-500" />
                   <span className="text-[9px] font-bold">Files</span>
               </button>
            </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 h-full w-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-gray-50 dark:bg-gray-950"
          >
            <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-lg !m-4 md:!m-10" />
            <Background gap={20} size={1} variant={BackgroundVariant.Dots} className="opacity-50" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
