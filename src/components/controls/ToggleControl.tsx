import React, { useCallback } from 'react';
import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
  onValueChange: (value: number) => void;
  editMode: boolean;
}

export default function ToggleControl({ widget, onValueChange, editMode }: Props) {
  const isOn = widget.value > 0.5;

  const handleClick = useCallback((e: React.PointerEvent) => {
    if (editMode) return;
    e.preventDefault();
    e.stopPropagation();
    onValueChange(isOn ? widget.osc.min : widget.osc.max);
  }, [editMode, isOn, widget.osc.min, widget.osc.max, onValueChange]);

  const switchW = Math.min(widget.width * 0.7, 56);
  const switchH = switchW * 0.5;
  const thumbSize = switchH - 4;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center select-none cursor-pointer gap-1"
      onPointerDown={handleClick}
      style={{ touchAction: 'none', background: `${widget.color}06`, borderRadius: 8 }}
    >
      <span className="text-[9px] text-white/35 font-medium">{widget.label}</span>
      <div
        className="relative rounded-full transition-colors duration-200"
        style={{
          width: switchW,
          height: switchH,
          backgroundColor: isOn ? widget.color : `${widget.color}20`,
          boxShadow: isOn ? `0 0 12px ${widget.color}40` : 'none',
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-all duration-200"
          style={{
            width: thumbSize,
            height: thumbSize,
            left: isOn ? `calc(100% - ${thumbSize + 2}px)` : '2px',
            boxShadow: isOn ? `0 0 6px ${widget.color}60` : '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      <span className="text-[8px] text-white/20 font-mono">{isOn ? 'ON' : 'OFF'}</span>
    </div>
  );
}
