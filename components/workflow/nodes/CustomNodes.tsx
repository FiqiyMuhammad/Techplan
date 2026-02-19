"use client";

import { memo, useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "reactflow";

// --- Helper for Content Editable ---
const EditableLabel = ({ id, initialLabel, className }: { id: string, initialLabel: string, className?: string }) => {
  const { setNodes } = useReactFlow();
  const [text, setText] = useState(initialLabel);

  const onInput = (e: React.FocusEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || "";
    if (newText !== text) {
        setText(newText);
        setNodes((nds) => nds.map((n) => {
          if (n.id === id) {
            return { ...n, data: { ...n.data, label: newText } };
          }
          return n;
        }));
    }
  };

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={onInput} // Update on blur to avoid excessive re-renders/focus loss
      className={`nodrag cursor-text outline-none empty:before:content-['Label...'] empty:before:text-gray-400 focus:bg-blue-50/20 rounded px-1 transition-colors min-w-[20px] ${className}`}
      onMouseDownCapture={(e) => e.stopPropagation()}
      onTouchStartCapture={(e) => e.stopPropagation()}
    >
      {initialLabel}
    </div>
  );
};

// --- Diamond Node ---
const DiamondNode = ({ id, data, selected }: NodeProps) => {
  return (
    <div className={`relative flex items-center justify-center min-w-[140px] min-h-[140px] aspect-square transition-all ${selected ? 'scale-105' : ''}`}>
      {/* Diamond Shape Background */}
      <div 
        className={`absolute w-[70%] h-[70%] bg-white dark:bg-gray-800 border-2 rotate-45 transition-all
          ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-900 dark:border-white'}`}
      />
      
      {/* Content */}
      <div className="relative z-10 p-4 text-center w-full flex items-center justify-center">
        <EditableLabel 
          id={id} 
          initialLabel={data.label} 
          className="text-xs font-bold text-gray-900 dark:text-white max-w-[80px] break-words" 
        />
      </div>
      
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400 !border-2 !border-white -top-4" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400 !border-2 !border-white -bottom-4" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 !bg-gray-400 !border-2 !border-white -left-4" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-gray-400 !border-2 !border-white -right-4" />
    </div>
  );
};

// --- Circle Node ---
const CircleNode = ({ id, data, selected }: NodeProps) => {
  return (
    <div 
        className={`min-w-[120px] min-h-[120px] aspect-square rounded-full border-2 bg-white dark:bg-gray-800 flex items-center justify-center transition-all relative
        ${selected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-900 dark:border-white'}`}
    >
      <div className="p-6 w-full flex items-center justify-center text-center">
        <EditableLabel 
            id={id} 
            initialLabel={data.label} 
            className="text-xs font-bold text-gray-900 dark:text-white w-full break-words" 
        />
      </div>
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
    </div>
  );
};

// --- Rectangle / Roadmap Node ---
const RectangleNode = ({ id, data, selected }: NodeProps) => {
  return (
    <div 
        className={`min-w-[160px] p-4 rounded-xl border-2 bg-white dark:bg-gray-800 flex items-center justify-center transition-all relative
        ${selected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-900 dark:border-white'}`}
    >
      <div className="w-full flex items-center justify-center text-center">
        <EditableLabel 
            id={id} 
            initialLabel={data.label} 
            className="text-sm font-bold text-gray-900 dark:text-white w-full break-words" 
        />
      </div>
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
    </div>
  );
};

export const nodeTypes = {
  diamond: memo(DiamondNode),
  circle: memo(CircleNode),
  rectangle: memo(RectangleNode),
};
