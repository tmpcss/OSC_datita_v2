import useStore from '../../store/useStore';
import type { ControlWidget } from '../../types';

interface Props {
  widget: ControlWidget;
}

export default function LabelControl({ widget }: Props) {
  const { editMode, triggerWidgetMessage } = useStore();

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editMode) return;
    e.stopPropagation();
    triggerWidgetMessage(widget.id);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`w-full h-full flex items-center justify-center select-none ${!editMode ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
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
