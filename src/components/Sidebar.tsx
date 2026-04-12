import React, { useCallback } from 'react';
import useStore from '../store/useStore';
import type { ControlType } from '../types';

const CONTROLS: { type: ControlType; icon: string; label: string; desc: string }[] = [
  { type: 'slider', icon: '⬜', label: 'Slider', desc: 'Horizontal slider' },
  { type: 'fader', icon: '📊', label: 'Fader', desc: 'Vertical fader' },
  { type: 'knob', icon: '🎛️', label: 'Knob', desc: 'Rotary encoder' },
  { type: 'button', icon: '🔘', label: 'Button', desc: 'Push button' },
  { type: 'toggle', icon: '🔀', label: 'Toggle', desc: 'On/Off switch' },
  { type: 'xypad', icon: '✛', label: 'XY Pad', desc: '2D controller' },
  { type: 'label', icon: '🏷️', label: 'Label', desc: 'Text label' },
];

const COLORS: Record<ControlType, string> = {
  slider: '#6366f1',
  button: '#ef4444',
  knob: '#10b981',
  fader: '#f59e0b',
  xypad: '#8b5cf6',
  toggle: '#3b82f6',
  label: '#94a3b8',
};

interface PageTabsProps {
  collapsed: boolean;
}

function PageTabs({ collapsed }: PageTabsProps) {
  const { pages, activePageId, setActivePage, addPage, removePage, renamePage } = useStore();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  if (collapsed) return null;

  return (
    <div className="px-3 pb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Pages</span>
        <button
          onClick={addPage}
          className="text-white/40 hover:text-white/80 text-lg leading-none transition-colors"
          title="Add page"
        >
          +
        </button>
      </div>
      <div className="space-y-1">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
              page.id === activePageId
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:bg-white/5 hover:text-white/70'
            }`}
            onClick={() => setActivePage(page.id)}
            onDoubleClick={() => {
              setEditingId(page.id);
              setEditName(page.name);
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: page.id === activePageId ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
            {editingId === page.id ? (
              <input
                className="bg-transparent border-b border-blue-400 outline-none text-white text-sm flex-1 w-0"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  renamePage(page.id, editName);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renamePage(page.id, editName);
                    setEditingId(null);
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate flex-1">{page.name}</span>
            )}
            {pages.length > 1 && (
              <button
                className="text-white/20 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removePage(page.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { setDraggingType, editMode } = useStore();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, type: ControlType) => {
    e.dataTransfer.setData('widget-type', type);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingType(type);
  }, [setDraggingType]);

  return (
    <div
      className={`bg-[#12121a] border-r border-white/5 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
              🎚️
            </div>
            <span className="text-white/80 font-semibold text-sm">Controls</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/40 hover:text-white/80 transition-colors p-1"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Page tabs */}
      <div className="pt-3">
        <PageTabs collapsed={collapsed} />
      </div>

      {/* Divider */}
      {!collapsed && <div className="mx-3 border-b border-white/5" />}

      {/* Controls palette */}
      {!collapsed && (
        <div className="px-3 py-3">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
            Components
          </span>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto ${collapsed ? 'px-1' : 'px-3'} pb-3`}>
        <div className={collapsed ? 'space-y-2' : 'grid grid-cols-2 gap-2'}>
          {CONTROLS.map((ctrl) => (
            <div
              key={ctrl.type}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, ctrl.type)}
              className={`
                rounded-lg border border-white/5 cursor-grab active:cursor-grabbing
                transition-all duration-150 hover:border-white/20 hover:bg-white/5
                ${!editMode ? 'opacity-40 cursor-not-allowed' : ''}
                ${collapsed ? 'p-2 flex items-center justify-center' : 'p-3'}
              `}
              style={{
                background: `linear-gradient(135deg, ${COLORS[ctrl.type]}10, transparent)`,
              }}
              title={ctrl.desc}
            >
              <div className={collapsed ? '' : 'text-center space-y-1'}>
                <div
                  className={`${collapsed ? 'text-lg' : 'text-2xl'}`}
                >
                  {ctrl.icon}
                </div>
                {!collapsed && (
                  <>
                    <div className="text-xs font-medium text-white/70">{ctrl.label}</div>
                    <div className="text-[9px] text-white/30">{ctrl.desc}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode indicator */}
      <div className={`p-3 border-t border-white/5 ${collapsed ? 'text-center' : ''}`}>
        <div
          className={`text-[10px] uppercase tracking-wider font-bold ${
            editMode ? 'text-blue-400' : 'text-green-400'
          }`}
        >
          {collapsed ? (editMode ? '✏️' : '▶') : (editMode ? '✏️ Edit Mode' : '▶ Live Mode')}
        </div>
      </div>
    </div>
  );
}
