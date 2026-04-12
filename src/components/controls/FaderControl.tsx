import React, { useCallback, useRef } from 'react';
import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
  onValueChange: (value: number) => void;
  editMode: boolean;
}

export default function FaderControl({ widget, onValueChange, editMode }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const { min, max } = widget.osc;
  const range = max - min;
  const normalized = range > 0 ? (widget.value - min) / range : 0;

  const isHorizontal = widget.orientation === 'horizontal';

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

  const trackSize = Math.max(14, (isHorizontal ? widget.height : widget.width) * 0.35);

  return (
    <div
      className={`w-full h-full flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center justify-between ${isHorizontal ? 'px-2' : 'py-2'} select-none`}
      style={{ background: `${widget.color}08`, borderRadius: 8 }}
    >
      {/* Label */}
      <span className="text-[10px] text-white/40 font-medium truncate px-1">{widget.label}</span>

      <div
        ref={trackRef}
        className={`relative rounded-lg cursor-pointer flex-1 ${isHorizontal ? 'mx-1' : 'my-1'}`}
        style={{ 
          [isHorizontal ? 'height' : 'width']: trackSize, 
          touchAction: 'none' 
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Track background */}
        <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: `${widget.color}15` }} />
        {/* Filled track */}
        <div
          className={`absolute ${isHorizontal ? 'inset-y-0 left-0' : 'inset-x-0 bottom-0'} rounded-lg`}
          style={{
            [isHorizontal ? 'width' : 'height']: `${normalized * 100}%`,
            backgroundColor: widget.color,
            opacity: 0.6,
            boxShadow: `0 0 12px ${widget.color}30`,
          }}
        />
        {/* Notches */}
        {[0, 0.25, 0.5, 0.75, 1].map((n) => (
          <div
            key={n}
            className={`absolute ${isHorizontal ? 'top-0 bottom-0 w-px' : 'left-0 right-0 h-px'}`}
            style={{
              [isHorizontal ? 'left' : 'bottom']: `${n * 100}%`,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
        {/* Thumb */}
        <div
          className={`absolute rounded bg-white shadow-lg ${isHorizontal ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'}`}
          style={{
            [isHorizontal ? 'left' : 'bottom']: `calc(${normalized * 100}% - 5px)`,
            [isHorizontal ? 'width' : 'height']: 10,
            [isHorizontal ? 'height' : 'width']: Math.max(24, (isHorizontal ? widget.height : widget.width) * 0.6),
            boxShadow: `0 0 10px ${widget.color}50, 0 2px 4px rgba(0,0,0,0.4)`,
            border: `1px solid ${widget.color}60`,
          }}
        />
      </div>

      {/* Value */}
      <span className="text-[9px] text-white/30 font-mono tabular-nums">{widget.value.toFixed(2)}</span>
    </div>
  );
}
