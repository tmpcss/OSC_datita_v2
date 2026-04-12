import React, { useCallback, useRef } from 'react';
import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
  onValueChange: (value: number) => void;
  editMode: boolean;
}

export default function SliderControl({ widget, onValueChange, editMode }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const { min, max } = widget.osc;
  const range = max - min;
  const normalized = range > 0 ? (widget.value - min) / range : 0;

  const isHorizontal = widget.orientation !== 'vertical';

  const updateValue = useCallback((clientPos: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let pct = 0;
    if (isHorizontal) {
      pct = Math.max(0, Math.min(1, (clientPos - rect.left) / rect.width));
    } else {
      pct = Math.max(0, Math.min(1, 1 - (clientPos - rect.top) / rect.height));
    }
    onValueChange(min + pct * range);
  }, [min, range, isHorizontal, onValueChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (editMode) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    updateValue(isHorizontal ? e.clientX : e.clientY);
  }, [editMode, updateValue, isHorizontal]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || editMode) return;
    e.preventDefault();
    e.stopPropagation();
    updateValue(isHorizontal ? e.clientX : e.clientY);
  }, [editMode, updateValue, isHorizontal]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    isDragging.current = false;
  }, []);

  const trackThickness = Math.max(8, (isHorizontal ? widget.height : widget.width) * 0.25);
  const thumbSize = Math.max(18, (isHorizontal ? widget.height : widget.width) * 0.55);

  return (
    <div className={`w-full h-full flex ${isHorizontal ? 'flex-col justify-center px-3' : 'flex-col items-center justify-between py-2'} select-none`}
      style={{ background: `${widget.color}08`, borderRadius: 8 }}>
      {/* Label + value */}
      <div className={`flex ${isHorizontal ? 'items-center justify-between mb-1 px-1' : 'flex-col items-center gap-1 w-full truncate'}`}>
        <span className="text-[10px] text-white/40 font-medium truncate">{widget.label}</span>
        {isHorizontal && <span className="text-[10px] text-white/30 font-mono tabular-nums">{widget.value.toFixed(2)}</span>}
      </div>
      <div
        ref={trackRef}
        className={`relative rounded-full cursor-pointer ${isHorizontal ? 'w-full' : 'flex-1 my-1'}`}
        style={{ 
          [isHorizontal ? 'height' : 'width']: trackThickness,
          touchAction: 'none' 
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Track background */}
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: `${widget.color}20` }} />
        {/* Filled track */}
        <div
          className={`absolute rounded-full ${isHorizontal ? 'inset-y-0 left-0' : 'inset-x-0 bottom-0'}`}
          style={{
            [isHorizontal ? 'width' : 'height']: `${normalized * 100}%`,
            backgroundColor: widget.color,
            boxShadow: `0 0 8px ${widget.color}40`,
          }}
        />
        {/* Thumb */}
        <div
          className={`absolute bg-white shadow-lg rounded-full ${isHorizontal ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'}`}
          style={{
            [isHorizontal ? 'left' : 'bottom']: `calc(${normalized * 100}% - ${thumbSize / 2}px)`,
            width: thumbSize,
            height: thumbSize,
            border: `3px solid ${widget.color}`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px ${widget.color}30`,
          }}
        />
      </div>

      {!isHorizontal && <span className="text-[9px] text-white/30 font-mono tabular-nums">{widget.value.toFixed(2)}</span>}
    </div>
  );
}
