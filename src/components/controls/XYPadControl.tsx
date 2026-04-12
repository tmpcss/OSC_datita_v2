import React, { useCallback, useRef } from 'react';
import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
  onValueChange: (value: number, valueY?: number) => void;
  editMode: boolean;
}

export default function XYPadControl({ widget, onValueChange, editMode }: Props) {
  const padRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const { min, max } = widget.osc;
  const range = max - min;
  const normX = range > 0 ? (widget.value - min) / range : 0;
  const normY = range > 0 ? ((widget.valueY ?? 0) - min) / range : 0;

  const updateValue = useCallback((clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    onValueChange(min + px * range, min + py * range);
  }, [min, range, onValueChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (editMode) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    updateValue(e.clientX, e.clientY);
  }, [editMode, updateValue]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || editMode) return;
    e.preventDefault();
    e.stopPropagation();
    updateValue(e.clientX, e.clientY);
  }, [editMode, updateValue]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    isDragging.current = false;
  }, []);

  return (
    <div
      className="w-full h-full flex flex-col select-none"
      style={{ background: `${widget.color}08`, borderRadius: 8 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-1">
        <span className="text-[9px] text-white/40 font-medium truncate">{widget.label}</span>
        <span className="text-[8px] text-white/20 font-mono tabular-nums">
          {widget.value.toFixed(2)} / {(widget.valueY ?? 0).toFixed(2)}
        </span>
      </div>
      {/* Pad */}
      <div className="flex-1 p-1.5">
        <div
          ref={padRef}
          className="relative w-full h-full rounded-md overflow-hidden cursor-crosshair"
          style={{
            backgroundColor: `${widget.color}10`,
            border: `1px solid ${widget.color}25`,
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/4 top-0 bottom-0 w-px" style={{ backgroundColor: `${widget.color}10` }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: `${widget.color}15` }} />
            <div className="absolute left-3/4 top-0 bottom-0 w-px" style={{ backgroundColor: `${widget.color}10` }} />
            <div className="absolute top-1/4 left-0 right-0 h-px" style={{ backgroundColor: `${widget.color}10` }} />
            <div className="absolute top-1/2 left-0 right-0 h-px" style={{ backgroundColor: `${widget.color}15` }} />
            <div className="absolute top-3/4 left-0 right-0 h-px" style={{ backgroundColor: `${widget.color}10` }} />
          </div>
          {/* Crosshair lines */}
          <div
            className="absolute w-px pointer-events-none"
            style={{ left: `${normX * 100}%`, top: 0, bottom: 0, backgroundColor: `${widget.color}40` }}
          />
          <div
            className="absolute h-px pointer-events-none"
            style={{ bottom: `${normY * 100}%`, left: 0, right: 0, backgroundColor: `${widget.color}40` }}
          />
          {/* Dot */}
          <div
            className="absolute w-5 h-5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"
            style={{
              left: `${normX * 100}%`,
              bottom: `${normY * 100}%`,
              backgroundColor: widget.color,
              boxShadow: `0 0 16px ${widget.color}80, 0 0 4px ${widget.color}`,
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          />
          {/* Trail ring */}
          <div
            className="absolute w-9 h-9 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"
            style={{
              left: `${normX * 100}%`,
              bottom: `${normY * 100}%`,
              border: `1px solid ${widget.color}30`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
