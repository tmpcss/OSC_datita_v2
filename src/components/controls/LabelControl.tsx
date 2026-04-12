import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
}

export default function LabelControl({ widget }: Props) {
  return (
    <div
      className="w-full h-full flex items-center justify-center select-none"
      style={{
        color: widget.color,
        fontSize: Math.max(10, Math.min(widget.width * 0.12, widget.height * 0.5)),
        fontWeight: 600,
        textShadow: `0 0 20px ${widget.color}30`,
        letterSpacing: '0.02em',
      }}
    >
      {widget.label}
    </div>
  );
}
