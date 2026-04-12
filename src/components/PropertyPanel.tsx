import React, { useCallback } from 'react';
import useStore from '../store/useStore';
import type { ControlWidget } from '../types';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#94a3b8',
];

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/40 font-semibold hover:text-white/60 transition-colors"
      >
        {title}
        <span className="text-white/30">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="px-4 pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-white/40 w-16 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Input({ value, onChange, type = 'text', ...props }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 outline-none focus:border-blue-500/50 transition-colors"
      {...props}
    />
  );
}

export default function PropertyPanel() {
  const { 
    selectedWidgetIds, showPropertyPanel, getActivePage, updateWidget, removeWidget, duplicateWidget,
    oscGlobalHost, oscGlobalPort, setOscGlobalHost, setOscGlobalPort
  } = useStore();

  const page = getActivePage();
  const selectedWidgets = page.widgets.filter((w) => selectedWidgetIds.includes(w.id));
  const widget = selectedWidgets.length === 1 ? selectedWidgets[0] : null;

  const update = useCallback((updates: Partial<ControlWidget>) => {
    if (!widget) return;
    updateWidget(widget.id, updates);
  }, [widget, updateWidget]);

  if (!showPropertyPanel) return null;

  if (!widget) {
    return (
      <div className="w-64 bg-[#12121a] border-l border-white/5 flex flex-col h-full">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white/60">Controls</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {selectedWidgets.length > 1 ? (
             <div className="flex items-center justify-center p-8 h-full min-h-[200px]">
               <div className="text-center text-white/20 space-y-2">
                 <div className="text-3xl">🎯</div>
                 <p className="text-xs">{selectedWidgets.length} widgets selected</p>
               </div>
             </div>
          ) : (
            <>
              <Section title="Global Settings">
                <Field label="Host">
                  <Input
                    value={oscGlobalHost}
                    onChange={(e: any) => setOscGlobalHost(e.target.value)}
                  />
                </Field>
                <Field label="Port">
                  <Input
                    type="number"
                    value={oscGlobalPort}
                    onChange={(e: any) => setOscGlobalPort(Number(e.target.value))}
                  />
                </Field>
              </Section>
              
              <div className="flex items-center justify-center p-8 mt-10 opacity-50">
                <div className="text-center text-white/20 space-y-2">
                  <div className="text-3xl">🎯</div>
                  <p className="text-xs">Select a widget to edit its properties</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#12121a] border-l border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/80">{widget.type.toUpperCase()}</h3>
          <p className="text-[10px] text-white/30 font-mono mt-0.5">{widget.id.slice(0, 8)}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => duplicateWidget(widget.id)}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 text-xs transition-colors"
            title="Duplicate"
          >
            📋
          </button>
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 text-xs transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* General */}
        <Section title="General">
          <Field label="Label">
            <Input value={widget.label} onChange={(e: any) => update({ label: e.target.value })} />
          </Field>
          <Field label="Color">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={widget.color}
                  onChange={(e: any) => update({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <Input value={widget.color} onChange={(e: any) => update({ color: e.target.value })} className="flex-1" />
              </div>
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-4 h-4 rounded-sm border border-white/10 hover:scale-125 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => update({ color: c })}
                  />
                ))}
              </div>
            </div>
          </Field>
          <Field label="Locked">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widget.locked}
                onChange={(e) => update({ locked: e.target.checked })}
                className="rounded bg-white/10 border-white/20"
              />
              <span className="text-xs text-white/50">{widget.locked ? 'Locked' : 'Unlocked'}</span>
            </label>
          </Field>
        </Section>

        {/* Position & Size */}
        <Section title="Position & Size">
          <div className="grid grid-cols-2 gap-2">
            <Field label="X">
              <Input type="number" value={Math.round(widget.x)} onChange={(e: any) => update({ x: Number(e.target.value) })} />
            </Field>
            <Field label="Y">
              <Input type="number" value={Math.round(widget.y)} onChange={(e: any) => update({ y: Number(e.target.value) })} />
            </Field>
            <Field label="W">
              <Input type="number" value={Math.round(widget.width)} onChange={(e: any) => update({ width: Math.max(30, Number(e.target.value)) })} />
            </Field>
            <Field label="H">
              <Input type="number" value={Math.round(widget.height)} onChange={(e: any) => update({ height: Math.max(30, Number(e.target.value)) })} />
            </Field>
          </div>
        </Section>

        {/* Value */}
        {widget.type !== 'label' && (
          <Section title="Value">
            <Field label="Current">
              <div className="text-xs text-white/60 font-mono">
                {widget.value.toFixed(3)}
                {widget.valueY !== undefined && ` / ${widget.valueY.toFixed(3)}`}
              </div>
            </Field>
            <Field label="Min">
              <Input
                type="number"
                step="0.01"
                value={widget.osc.min}
                onChange={(e: any) => update({ osc: { ...widget.osc, min: Number(e.target.value) } })}
              />
            </Field>
            <Field label="Max">
              <Input
                type="number"
                step="0.01"
                value={widget.osc.max}
                onChange={(e: any) => update({ osc: { ...widget.osc, max: Number(e.target.value) } })}
              />
            </Field>
          </Section>
        )}

        {/* Type-specific */}
        {(widget.type === 'slider' || widget.type === 'fader') && (
          <Section title={`${widget.type.toUpperCase()} Options`}>
            <Field label="Layout">
              <select
                value={widget.orientation || 'horizontal'}
                onChange={(e) => update({ orientation: e.target.value as 'horizontal' | 'vertical' })}
                className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 outline-none"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </Field>
          </Section>
        )}

        {widget.type === 'button' && (
          <Section title="Button Options">
            <Field label="Mode">
              <select
                value={widget.momentary ? 'momentary' : 'toggle'}
                onChange={(e) => update({ momentary: e.target.value === 'momentary' })}
                className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 outline-none"
              >
                <option value="momentary">Momentary</option>
                <option value="toggle">Toggle</option>
              </select>
            </Field>
          </Section>
        )}

        {/* OSC */}
        <Section title="OSC Configuration" defaultOpen={false}>
          <Field label="Address">
            <Input
              value={widget.osc.address}
              onChange={(e: any) => update({ osc: { ...widget.osc, address: e.target.value } })}
              placeholder={`/${widget.type}/1`}
            />
          </Field>
          {widget.type === 'xypad' && (
            <Field label="Address Y">
              <Input
                value={widget.osc.addressY || ''}
                onChange={(e: any) => update({ osc: { ...widget.osc, addressY: e.target.value } })}
                placeholder="/xypad/2"
              />
            </Field>
          )}
          <Field label="Data Type">
            <select
              value={widget.osc.dataType || 'float'}
              onChange={(e) => update({ osc: { ...widget.osc, dataType: e.target.value as any } })}
              className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 outline-none"
            >
              <option value="float">Float (0.00)</option>
              <option value="int">Integer (0)</option>
              <option value="string">String ("0.00")</option>
              <option value="boolean">Boolean (0/1)</option>
            </select>
          </Field>

        </Section>

        {/* MIDI */}
        <Section title="MIDI Configuration" defaultOpen={false}>
          <Field label="Enable">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widget.midi.enabled}
                onChange={(e) => update({ midi: { ...widget.midi, enabled: e.target.checked } })}
                className="rounded"
              />
              <span className="text-xs text-white/50">{widget.midi.enabled ? 'On' : 'Off'}</span>
            </label>
          </Field>
          <Field label="Channel">
            <Input
              type="number"
              min="1"
              max="16"
              value={widget.midi.channel}
              onChange={(e: any) => update({ midi: { ...widget.midi, channel: Number(e.target.value) } })}
            />
          </Field>
          <Field label="CC">
            <Input
              type="number"
              min="0"
              max="127"
              value={widget.midi.cc}
              onChange={(e: any) => update({ midi: { ...widget.midi, cc: Number(e.target.value) } })}
            />
          </Field>
        </Section>

        {/* Lua Scripting */}
        <Section title="Lua Script" defaultOpen={false}>
          <Field label="Enable">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widget.lua.enabled}
                onChange={(e) => update({ lua: { ...widget.lua, enabled: e.target.checked } })}
                className="rounded"
              />
              <span className="text-xs text-white/50">{widget.lua.enabled ? 'Active' : 'Inactive'}</span>
            </label>
          </Field>
          <div>
            <textarea
              value={widget.lua.code}
              onChange={(e) => update({ lua: { ...widget.lua, code: e.target.value } })}
              className="w-full h-28 bg-black/30 border border-white/10 rounded-md px-2 py-1.5 text-[10px] text-green-400/80 font-mono outline-none focus:border-green-500/30 resize-none"
              spellCheck={false}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
