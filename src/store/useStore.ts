import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { ControlWidget, ControlType, Page, OscMessage } from '../types';

const DEFAULT_COLORS: Record<ControlType, string> = {
  slider: '#6366f1',
  button: '#ef4444',
  knob: '#10b981',
  fader: '#f59e0b',
  xypad: '#8b5cf6',
  toggle: '#3b82f6',
  label: '#94a3b8',
};

const DEFAULT_SIZES: Record<ControlType, { w: number; h: number }> = {
  slider: { w: 200, h: 50 },
  button: { w: 100, h: 100 },
  knob: { w: 100, h: 100 },
  fader: { w: 60, h: 200 },
  xypad: { w: 200, h: 200 },
  toggle: { w: 80, h: 40 },
  label: { w: 150, h: 40 },
};

function createWidget(type: ControlType, x: number, y: number): ControlWidget {
  const size = DEFAULT_SIZES[type];
  return {
    id: uuidv4(),
    type,
    x,
    y,
    width: size.w,
    height: size.h,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    color: DEFAULT_COLORS[type],
    value: 0,
    valueY: type === 'xypad' ? 0 : undefined,
    osc: {
      address: `/${type}/1`,
      addressY: type === 'xypad' ? `/${type}/2` : undefined,
      dataType: 'float',
      port: 9000,
      min: 0,
      max: 1,
      host: '127.0.0.1',
    },
    midi: {
      channel: 1,
      cc: 1,
      enabled: false,
    },
    lua: {
      enabled: false,
      code: `-- Transform value before sending\nfunction transform(value)\n  return value\nend`,
    },
    locked: false,
    visible: true,
    momentary: type === 'button',
    orientation: type === 'fader' ? 'vertical' : 'horizontal',
  };
}

const defaultPage: Page = {
  id: uuidv4(),
  name: 'Page 1',
  color: '#1e1e2e',
  widgets: [],
};

interface AppStore {
  // Project
  projectName: string;
  pages: Page[];
  activePageId: string;
  selectedWidgetIds: string[];
  editMode: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  oscGlobalHost: string;
  oscGlobalPort: number;
  oscLog: OscMessage[];
  showOscLog: boolean;
  showPropertyPanel: boolean;
  draggingType: ControlType | null;
  clipboard: ControlWidget[];

  // Actions
  setProjectName: (name: string) => void;
  setEditMode: (mode: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setOscGlobalHost: (host: string) => void;
  setOscGlobalPort: (port: number) => void;
  setShowOscLog: (show: boolean) => void;
  setShowPropertyPanel: (show: boolean) => void;
  setDraggingType: (type: ControlType | null) => void;

  // Page actions
  addPage: () => void;
  removePage: (id: string) => void;
  setActivePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;

  // Widget actions
  addWidget: (type: ControlType, x: number, y: number) => void;
  removeWidget: (id: string) => void;
  removeSelectedWidgets: () => void;
  updateWidget: (id: string, updates: Partial<ControlWidget>) => void;
  moveWidget: (id: string, x: number, y: number) => void;
  resizeWidget: (id: string, width: number, height: number) => void;
  selectWidget: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  duplicateWidget: (id: string) => void;
  copySelected: () => void;
  pasteWidgets: () => void;
  setWidgetValue: (id: string, value: number, valueY?: number) => void;

  // OSC log
  logOscMessage: (msg: OscMessage) => void;
  clearOscLog: () => void;

  // Persistence
  saveProject: () => void;
  loadProject: () => void;

  // Get helpers
  getActivePage: () => Page;
  getSelectedWidgets: () => ControlWidget[];
}

const useStore = create<AppStore>((set, get) => ({
  projectName: 'Untitled Project',
  pages: [defaultPage],
  activePageId: defaultPage.id,
  selectedWidgetIds: [],
  editMode: true,
  gridSize: 20,
  snapToGrid: true,
  showGrid: true,
  oscGlobalHost: '127.0.0.1',
  oscGlobalPort: 9000,
  oscLog: [],
  showOscLog: false,
  showPropertyPanel: true,
  draggingType: null,
  clipboard: [],

  setProjectName: (name) => set({ projectName: name }),
  setEditMode: (mode) => set({ editMode: mode, selectedWidgetIds: mode ? get().selectedWidgetIds : [] }),
  setGridSize: (size) => set({ gridSize: size }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setShowGrid: (show) => set({ showGrid: show }),
  setOscGlobalHost: (host) => set({ oscGlobalHost: host }),
  setOscGlobalPort: (port) => set({ oscGlobalPort: port }),
  setShowOscLog: (show) => set({ showOscLog: show }),
  setShowPropertyPanel: (show) => set({ showPropertyPanel: show }),
  setDraggingType: (type) => set({ draggingType: type }),

  addPage: () => {
    const newPage: Page = {
      id: uuidv4(),
      name: `Page ${get().pages.length + 1}`,
      color: '#1e1e2e',
      widgets: [],
    };
    set((s) => ({ pages: [...s.pages, newPage], activePageId: newPage.id }));
  },

  removePage: (id) => {
    const pages = get().pages;
    if (pages.length <= 1) return;
    const idx = pages.findIndex((p) => p.id === id);
    const newPages = pages.filter((p) => p.id !== id);
    const newActive = id === get().activePageId
      ? newPages[Math.min(idx, newPages.length - 1)].id
      : get().activePageId;
    set({ pages: newPages, activePageId: newActive });
  },

  setActivePage: (id) => set({ activePageId: id, selectedWidgetIds: [] }),

  renamePage: (id, name) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  addWidget: (type, x, y) => {
    const snap = get().snapToGrid;
    const grid = get().gridSize;
    const sx = snap ? Math.round(x / grid) * grid : x;
    const sy = snap ? Math.round(y / grid) * grid : y;
    const widget = createWidget(type, sx, sy);
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.activePageId ? { ...p, widgets: [...p.widgets, widget] } : p
      ),
      selectedWidgetIds: [widget.id],
    }));
  },

  removeWidget: (id) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.activePageId
          ? { ...p, widgets: p.widgets.filter((w) => w.id !== id) }
          : p
      ),
      selectedWidgetIds: s.selectedWidgetIds.filter((sid) => sid !== id),
    })),

  removeSelectedWidgets: () => {
    const ids = get().selectedWidgetIds;
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.activePageId
          ? { ...p, widgets: p.widgets.filter((w) => !ids.includes(w.id)) }
          : p
      ),
      selectedWidgetIds: [],
    }));
  },

  updateWidget: (id, updates) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.activePageId
          ? {
              ...p,
              widgets: p.widgets.map((w) =>
                w.id === id ? { ...w, ...updates } : w
              ),
            }
          : p
      ),
    })),

  moveWidget: (id, x, y) => {
    const snap = get().snapToGrid && get().editMode;
    const grid = get().gridSize;
    const sx = snap ? Math.round(x / grid) * grid : x;
    const sy = snap ? Math.round(y / grid) * grid : y;
    get().updateWidget(id, { x: Math.max(0, sx), y: Math.max(0, sy) });
  },

  resizeWidget: (id, width, height) => {
    get().updateWidget(id, { width: Math.max(30, width), height: Math.max(30, height) });
  },

  selectWidget: (id, multi = false) => {
    if (multi) {
      set((s) => ({
        selectedWidgetIds: s.selectedWidgetIds.includes(id)
          ? s.selectedWidgetIds.filter((sid) => sid !== id)
          : [...s.selectedWidgetIds, id],
      }));
    } else {
      set({ selectedWidgetIds: [id] });
    }
  },

  deselectAll: () => set({ selectedWidgetIds: [] }),

  duplicateWidget: (id) => {
    const page = get().getActivePage();
    const widget = page.widgets.find((w) => w.id === id);
    if (!widget) return;
    const dup = { ...widget, id: uuidv4(), x: widget.x + 20, y: widget.y + 20 };
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.activePageId ? { ...p, widgets: [...p.widgets, dup] } : p
      ),
      selectedWidgetIds: [dup.id],
    }));
  },

  copySelected: () => {
    const page = get().getActivePage();
    const selected = page.widgets.filter((w) => get().selectedWidgetIds.includes(w.id));
    set({ clipboard: selected });
  },

  pasteWidgets: () => {
    const clips = get().clipboard;
    if (clips.length === 0) return;
    const newWidgets = clips.map((w) => ({
      ...w,
      id: uuidv4(),
      x: w.x + 20,
      y: w.y + 20,
    }));
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.activePageId ? { ...p, widgets: [...p.widgets, ...newWidgets] } : p
      ),
      selectedWidgetIds: newWidgets.map((w) => w.id),
    }));
  },

  setWidgetValue: (id, value, valueY) => {
    const page = get().getActivePage();
    const widget = page.widgets.find((w) => w.id === id);
    if (!widget) return;

    const clampedValue = Math.max(widget.osc.min, Math.min(widget.osc.max, value));
    const updates: Partial<ControlWidget> = { value: clampedValue };
    let clampedValueY: number | undefined;
    if (valueY !== undefined) {
      clampedValueY = Math.max(widget.osc.min, Math.min(widget.osc.max, valueY));
      updates.valueY = clampedValueY;
    }

    get().updateWidget(id, updates);

    // Format values based on data type
    const formatValue = (v: number) => {
      // Provide a fallback 'float' if dataType is missing on older loaded widgets
      const type = widget.osc.dataType || 'float';
      switch (type) {
        case 'int': return Math.round(v);
        case 'string': return String(Math.round(v * 100) / 100);
        case 'boolean': return v > (widget.osc.min + (widget.osc.max - widget.osc.min) / 2) ? 1 : 0;
        case 'float':
        default: return v;
      }
    };

    const formattedX = formatValue(clampedValue);

    // Log OSC
    const msgs: OscMessage[] = [];
    if (widget.type === 'xypad') {
      msgs.push({
        address: widget.osc.address,
        args: [formattedX],
        timestamp: Date.now(),
      });
      if (clampedValueY !== undefined && widget.osc.addressY) {
        msgs.push({
          address: widget.osc.addressY,
          args: [formatValue(clampedValueY)],
          timestamp: Date.now() + 1,
        });
      }
    } else {
      msgs.push({
        address: widget.osc.address,
        args: clampedValueY !== undefined ? [formattedX, formatValue(clampedValueY)] : [formattedX],
        timestamp: Date.now(),
      });
    }

    msgs.forEach(msg => get().logOscMessage(msg));
  },

  logOscMessage: (msg) =>
    set((s) => ({
      oscLog: [...s.oscLog.slice(-99), msg],
    })),

  clearOscLog: () => set({ oscLog: [] }),

  saveProject: () => {
    const state = get();
    const data = {
      projectName: state.projectName,
      pages: state.pages,
      oscGlobalHost: state.oscGlobalHost,
      oscGlobalPort: state.oscGlobalPort,
      gridSize: state.gridSize,
      snapToGrid: state.snapToGrid,
    };
    localStorage.setItem('osc-studio-project', JSON.stringify(data));
  },

  loadProject: () => {
    const raw = localStorage.getItem('osc-studio-project');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      set({
        projectName: data.projectName || 'Untitled',
        pages: data.pages || [defaultPage],
        activePageId: data.pages?.[0]?.id || defaultPage.id,
        oscGlobalHost: data.oscGlobalHost || '127.0.0.1',
        oscGlobalPort: data.oscGlobalPort || 9000,
        gridSize: data.gridSize || 20,
        snapToGrid: data.snapToGrid ?? true,
      });
    } catch (e) {
      console.error('Failed to load project', e);
    }
  },

  getActivePage: () => {
    const state = get();
    return state.pages.find((p) => p.id === state.activePageId) || state.pages[0];
  },

  getSelectedWidgets: () => {
    const page = get().getActivePage();
    return page.widgets.filter((w) => get().selectedWidgetIds.includes(w.id));
  },
}));

export default useStore;
