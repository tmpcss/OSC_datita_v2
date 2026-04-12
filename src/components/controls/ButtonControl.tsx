import React, { useCallback } from 'react';
import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
  onValueChange: (value: number) => void;
  editMode: boolean;
}

export default function ButtonControl({ widget, onValueChange, editMode }: Props) {
  const isPressed = widget.value > 0.5;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (editMode) return;
    e.preventDefault();
    e.stopPropagation();
    if (widget.momentary) {
      onValueChange(widget.osc.max);
    } else {
      onValueChange(isPressed ? widget.osc.min : widget.osc.max);
    }
  }, [editMode, widget.momentary, widget.osc.max, widget.osc.min, isPressed, onValueChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (editMode) return;
    e.stopPropagation();
    if (widget.momentary) {
      onValueChange(widget.osc.min);
    }
  }, [editMode, widget.momentary, widget.osc.min, onValueChange]);

  return (
    <div
      className="w-full h-full flex items-center justify-center select-none cursor-pointer p-1"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        className="w-full h-full rounded-xl flex items-center justify-center font-bold text-white/90 transition-all duration-75"
        style={{
          backgroundColor: isPressed ? widget.color : `${widget.color}18`,
          border: `2px solid ${isPressed ? widget.color : `${widget.color}50`}`,
          boxShadow: isPressed
            ? `0 0 25px ${widget.color}50, inset 0 0 25px ${widget.color}25`
            : `inset 0 0 8px ${widget.color}08`,
          fontSize: Math.max(10, Math.min(widget.width, widget.height) * 0.16),
          textShadow: isPressed ? `0 0 10px ${widget.color}` : 'none',
        }}
      >
        {widget.label}
      </div>
    </div>
  );
}
