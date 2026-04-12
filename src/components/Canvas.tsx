import React, { useCallback, useRef } from 'react';
import useStore from '../store/useStore';
import WidgetWrapper from './WidgetWrapper';

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    editMode,
    showGrid,
    gridSize,
    draggingType,
    selectedWidgetIds,
    addWidget,
    deselectAll,
    setDraggingType,
    getActivePage,
  } = useStore();

  const page = getActivePage();

  const handleCanvasClick = useCallback((e: React.PointerEvent) => {
    if (e.target === canvasRef.current) {
      deselectAll();
    }
  }, [deselectAll]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('widget-type') || draggingType;
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = e.clientY - rect.top + canvasRef.current.scrollTop;

    addWidget(type as any, x, y);
    setDraggingType(null);
  }, [draggingType, addWidget, setDraggingType]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-auto"
      style={{
        backgroundColor: '#0e0e16',
        backgroundImage: editMode && showGrid
          ? `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
             linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`
          : 'none',
        backgroundSize: editMode && showGrid ? `${gridSize}px ${gridSize}px` : undefined,
      }}
      onPointerDown={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Canvas workspace */}
      <div className="relative min-w-[2000px] min-h-[1200px]">
        {page.widgets.map((widget) => (
          <WidgetWrapper
            key={widget.id}
            widget={widget}
            isSelected={selectedWidgetIds.includes(widget.id)}
            canvasRef={canvasRef}
          />
        ))}
      </div>

      {/* Empty state */}
      {page.widgets.length === 0 && editMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/20 space-y-3">
            <div className="text-6xl">🎛️</div>
            <p className="text-lg font-medium">Arrastra controles aquí</p>
            <p className="text-sm">Drag controls from the sidebar to start building</p>
          </div>
        </div>
      )}
    </div>
  );
}
