import React, { useState, useCallback } from 'react';

export interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  children?: React.ReactNode;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, children }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileList = Array.from(e.dataTransfer.files);
        onFilesDropped(fileList);
      }
    },
    [onFilesDropped]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-full"
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-indigo-950/80 border-2 border-dashed border-indigo-400 backdrop-blur-sm pointer-events-none transition-all">
          <div className="p-4 rounded-full bg-indigo-500/20 text-indigo-300 mb-2">
            <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Drop folders or files to import into Onyx</span>
          <span className="text-xs text-indigo-300 mt-1">Automatic AST indexing & binary filtering</span>
        </div>
      )}
      {children}
    </div>
  );
};
