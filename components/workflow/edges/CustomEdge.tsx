import React, { useState, useRef, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from 'reactflow';
import { useReactFlow } from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(label as string || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setIsEditing(true);
  };

  const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setLabelText(evt.target.value);
  };

  const onLabelBlur = () => {
    setIsEditing(false);
    setEdges((edges) =>
      edges.map((e) => {
        if (e.id === id) {
          return { ...e, label: labelText };
        }
        return e;
      })
    );
  };

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      onLabelBlur();
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan group"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={labelText}
              onChange={onLabelChange}
              onBlur={onLabelBlur}
              onKeyDown={onKeyDown}
              className="text-xs font-bold text-gray-900 bg-white border border-blue-400 rounded px-1 py-0.5 outline-none shadow-sm min-w-[60px] text-center"
            />
          ) : (
             <div onClick={onEdgeClick} className="relative flex items-center justify-center">
                 {labelText ? (
                     <div className="px-2 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer select-none text-xs font-bold text-gray-600 shadow-sm">
                         {labelText}
                     </div>
                 ) : (
                    <button className="w-5 h-5 rounded-full bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-400 flex items-center justify-center transition-all shadow-sm group-hover:scale-110">
                        <span className="text-gray-400 hover:text-blue-600 font-bold text-xs leading-none pb-0.5">+</span>
                    </button>
                 )}
             </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
