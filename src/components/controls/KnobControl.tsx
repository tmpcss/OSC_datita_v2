import React, { useCallback, useRef } from 'react';
import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
  onValueChange: (value: number) => void;
  editMode: boolean;
}

export default function KnobControl({ widget, onValueChange, editMode }: Props) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const { min, max } = widget.osc;
  const range = max - min;
  const normalized = range > 0 ? (widget.value - min) / range : 0;

  const startAngle = -135;
  const endAngle = 135;
  const angle = startAngle + normalized * (endAngle - startAngle);

  const size = Math.min(widget.width, widget.height) * 0.7;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.4;

  const arcPath = (start: number, end: number, r: number) => {
    const s = ((start - 90) * Math.PI) / 180;
    const e = ((end - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (editMode) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = widget.value;
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [editMode, widget.value]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || editMode) return;
    e.preventDefault();
    e.stopPropagation();
    const dy = startY.current - e.clientY;
    const sensitivity = range / 150;
    const newVal = Math.max(min, Math.min(max, startValue.current + dy * sensitivity));
    onValueChange(newVal);
  }, [editMode, min, max, range, onValueChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    isDragging.current = false;
  }, []);

  const indicatorAngle = ((angle - 90) * Math.PI) / 180;
  const indLen = radius * 0.55;
  const indEnd = radius * 0.9;

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full select-none"
      style={{ background: `${widget.color}08`, borderRadius: 8 }}
    >
      {/* Label */}
      <span className="text-[10px] text-white/40 font-medium mb-0.5 truncate max-w-full px-1">{widget.label}</span>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="cursor-pointer"
        style={{ touchAction: 'none' }}
      >
        {/* Background track */}
        <path
          d={arcPath(startAngle, endAngle, radius)}
          fill="none"
          stroke={`${widget.color}25`}
          strokeWidth={size * 0.07}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {normalized > 0.005 && (
          <path
            d={arcPath(startAngle, angle, radius)}
            fill="none"
            stroke={widget.color}
            strokeWidth={size * 0.07}
            strokeLinecap="round"
            filter={`drop-shadow(0 0 4px ${widget.color}60)`}
          />
        )}
        {/* Knob body */}
        <circle cx={cx} cy={cy} r={radius * 0.55} fill="rgba(20,20,35,0.95)" stroke={`${widget.color}30`} strokeWidth={1.5} />
        {/* Indicator line */}
        <line
          x1={cx + indLen * Math.cos(indicatorAngle)}
          y1={cy + indLen * Math.sin(indicatorAngle)}
          x2={cx + indEnd * Math.cos(indicatorAngle)}
          y2={cy + indEnd * Math.sin(indicatorAngle)}
          stroke={widget.color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>
      {/* Value display */}
      <span className="text-[9px] text-white/30 font-mono tabular-nums mt-0.5">{widget.value.toFixed(2)}</span>
    </div>
  );
}
