import React, { useCallback, useRef } from 'react';
import type { ControlWidget } from '../types';
import useStore from '../store/useStore';
import SliderControl from './controls/SliderControl';
import ButtonControl from './controls/ButtonControl';
import KnobControl from './controls/KnobControl';
import FaderControl from './controls/FaderControl';
import XYPadControl from './controls/XYPadControl';
import ToggleControl from './controls/ToggleControl';
import LabelControl from './controls/LabelControl';

interface Props {
  widget: ControlWidget;
  isSelected: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export default function WidgetWrapper({ widget, isSelected, canvasRef }: Props) {
  const { editMode, moveWidget, selectWidget, setWidgetValue, resizeWidget } = useStore();
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleValueChange = useCallback((value: number, valueY?: number) => {
    setWidgetValue(widget.id, value, valueY);
  }, [widget.id, setWidgetValue]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    selectWidget(widget.id, e.shiftKey);

    if (widget.locked) return;

    isDragging.current = true;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    dragOffset.current = {
      x: e.clientX - widget.x - canvasRect.left + (canvasRef.current?.scrollLeft || 0),
      y: e.clientY - widget.y - canvasRect.top + (canvasRef.current?.scrollTop || 0),
    };

    (e.target as Element).setPointerCapture(e.pointerId);
  }, [editMode, widget.id, widget.x, widget.y, widget.locked, selectWidget, canvasRef]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!editMode) return;

    if (isDragging.current && !widget.locked) {
      e.stopPropagation();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const newX = e.clientX - dragOffset.current.x - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
      const newY = e.clientY - dragOffset.current.y - canvasRect.top + (canvasRef.current?.scrollTop || 0);
      moveWidget(widget.id, newX, newY);
    }

    if (isResizing.current && !widget.locked) {
      e.stopPropagation();
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      resizeWidget(widget.id, resizeStart.current.w + dx, resizeStart.current.h + dy);
    }
  }, [editMode, widget.id, widget.locked, moveWidget, resizeWidget, canvasRef]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    isDragging.current = false;
    isResizing.current = false;
  }, []);

  const handleResizeDown = useCallback((e: React.PointerEvent) => {
    if (!editMode || widget.locked) return;
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: widget.width, h: widget.height };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [editMode, widget.locked, widget.width, widget.height]);

  const renderControl = () => {
    switch (widget.type) {
      case 'slider':
        return <SliderControl widget={widget} onValueChange={handleValueChange} editMode={editMode} />;
      case 'button':
        return <ButtonControl widget={widget} onValueChange={handleValueChange} editMode={editMode} />;
      case 'knob':
        return <KnobControl widget={widget} onValueChange={handleValueChange} editMode={editMode} />;
      case 'fader':
        return <FaderControl widget={widget} onValueChange={handleValueChange} editMode={editMode} />;
      case 'xypad':
        return <XYPadControl widget={widget} onValueChange={handleValueChange} editMode={editMode} />;
      case 'toggle':
        return <ToggleControl widget={widget} onValueChange={handleValueChange} editMode={editMode} />;
      case 'label':
        return <LabelControl widget={widget} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute group"
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: isSelected ? 10 : 1,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Selection border */}
      {editMode && isSelected && (
        <div
          className="absolute -inset-1 rounded-lg border-2 pointer-events-none"
          style={{ borderColor: '#60a5fa' }}
        />
      )}
      {/* Widget content */}
      <div className="w-full h-full rounded-lg overflow-hidden">
        {renderControl()}
      </div>
      {/* Resize handle */}
      {editMode && isSelected && !widget.locked && (
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 cursor-se-resize z-20"
          onPointerDown={handleResizeDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-blue-400">
            <path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
      {/* Lock indicator */}
      {editMode && widget.locked && (
        <div className="absolute top-0 right-0 text-xs bg-black/60 text-yellow-400 px-1 rounded-bl">
          🔒
        </div>
      )}
    </div>
  );
}
