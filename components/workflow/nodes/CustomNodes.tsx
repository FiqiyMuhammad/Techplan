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
      className={`nodrag cursor-text outline-none empty:before:content-['Label...'] empty:before:text-gray-400 focus:bg-blue-50/20 rounded px-2 transition-colors min-w-[30px] whitespace-pre-wrap ${className}`}
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
    <div className={`relative flex items-center justify-center min-w-[150px] max-w-[300px] aspect-square transition-all ${selected ? 'scale-105' : ''}`}>
      {/* Diamond Shape Background - Perfect Square Rotated */}
      <div 
        className={`absolute w-[71%] h-[71%] bg-white dark:bg-gray-800 border-2 rotate-45 transition-all
          ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-900 dark:border-white'}`}
      />
      
      {/* Content */}
      <div className="relative z-10 p-8 text-center w-full flex items-center justify-center">
        <EditableLabel 
          id={id} 
          initialLabel={data.label} 
          className="text-xs font-bold text-gray-900 dark:text-white break-words" 
        />
      </div>
      
      {/* Handles - Bidirectional on all 4 sides */}
      {/* Top */}
      <Handle type="target" position={Position.Top} id="t-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Top} id="t-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      {/* Bottom */}
      <Handle type="target" position={Position.Bottom} id="b-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="b-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      {/* Left */}
      <Handle type="target" position={Position.Left} id="l-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="l-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      {/* Right */}
      <Handle type="target" position={Position.Right} id="r-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="r-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
    </div>
  );
};

// --- Circle Node ---
const CircleNode = ({ id, data, selected }: NodeProps) => {
  return (
    <div 
        className={`min-w-[120px] max-w-[280px] aspect-square rounded-full border-2 bg-white dark:bg-gray-800 flex items-center justify-center transition-all relative p-8
        ${selected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-900 dark:border-white'}`}
    >
      <div className="w-full flex items-center justify-center text-center">
        <EditableLabel 
            id={id} 
            initialLabel={data.label} 
            className="text-xs font-bold text-gray-900 dark:text-white w-full break-words" 
        />
      </div>
      
      {/* Bidirectional handles */}
      <Handle type="target" position={Position.Top} id="t-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Top} id="t-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      <Handle type="target" position={Position.Bottom} id="b-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="b-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      <Handle type="target" position={Position.Left} id="l-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="l-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      <Handle type="target" position={Position.Right} id="r-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="r-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
    </div>
  );
};

// --- Rectangle / Roadmap Node ---
const RectangleNode = ({ id, data, selected }: NodeProps) => {
  return (
    <div 
        className={`min-w-[160px] max-w-[320px] p-6 rounded-xl border-2 bg-white dark:bg-gray-800 flex items-center justify-center transition-all relative
        ${selected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-900 dark:border-white'}`}
    >
      <div className="w-full flex items-center justify-center text-center">
        <EditableLabel 
            id={id} 
            initialLabel={data.label} 
            className="text-sm font-bold text-gray-900 dark:text-white w-full break-words" 
        />
      </div>
      
      {/* Bidirectional handles */}
      <Handle type="target" position={Position.Top} id="t-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Top} id="t-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      <Handle type="target" position={Position.Bottom} id="b-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="b-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      <Handle type="target" position={Position.Right} id="r-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="r-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      
      <Handle type="target" position={Position.Left} id="l-t" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="l-s" className="w-4 h-4 !bg-blue-500 !border-2 !border-white" />
    </div>
  );
};

export const nodeTypes = {
  diamond: memo(DiamondNode),
  circle: memo(CircleNode),
  rectangle: memo(RectangleNode),
};
