import { useEffect, useCallback } from 'react';
import useStore from './store/useStore';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import OscLog from './components/OscLog';

export default function App() {
  const {
    editMode,
    loadProject,
    removeSelectedWidgets,
    copySelected,
    pasteWidgets,
    deselectAll,
    selectedWidgetIds,
    undo,
    redo,
    initBridge,
    bridgeConnected,
  } = useStore();

  // Load saved project on mount
  useEffect(() => {
    loadProject();
    initBridge();
  }, [loadProject, initBridge]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (editMode && selectedWidgetIds.length > 0) {
        e.preventDefault();
        removeSelectedWidgets();
      }
    }
    if (e.key === 'Escape') {
      deselectAll();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      if (editMode) copySelected();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
      if (editMode) pasteWidgets();
    }

    // Undo / Redo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      if (!editMode) return;
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
    // Redo can also be Ctrl+Y on some systems, though Cmd+Shift+Z is standard on Mac
    if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
      if (!editMode) return;
      e.preventDefault();
      redo();
    }
  }, [editMode, selectedWidgetIds, removeSelectedWidgets, deselectAll, copySelected, pasteWidgets, undo, redo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen bg-[#0e0e16] text-white overflow-hidden select-none">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - component palette */}
        {editMode && <Sidebar />}

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />
          {/* OSC Log */}
          <OscLog />
        </div>

        {/* Right panel - properties */}
        {editMode && <PropertyPanel />}
      </div>

      {/* Status bar */}
      <div className="h-6 bg-[#0a0a12] border-t border-white/5 flex items-center px-3 gap-4 shrink-0">
        <span className="text-[10px] text-white/20">
          OSC Control Studio v1.0
        </span>
        <span className="text-[10px] text-white/15">|</span>
        <span className="text-[10px] text-white/20">
          {editMode ? '✏️ Edit Mode' : '▶ Live Mode'}
        </span>
        <span className="text-[10px] text-white/15">|</span>
        <button 
          onClick={() => initBridge()}
          className="flex items-center gap-1.5 hover:bg-white/5 px-2 py-1 rounded transition-colors group"
          title="Click to reconnect bridge"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${bridgeConnected ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 shadow-[0_0_5px_#ef4444]'}`} />
          <span className={`text-[10px] ${bridgeConnected ? 'text-green-500/60' : 'text-red-500/60'}`}>
            {bridgeConnected ? 'Bridge Active' : 'Bridge Offline'}
          </span>
          {!bridgeConnected && <span className="text-[10px] text-white/20 group-hover:text-white/40 ml-1">↻ Try Connect</span>}
        </button>
        <div className="flex-1" />
        <span className="text-[10px] text-white/15">
          OSC • MIDI • Lua • Realtime Relay
        </span>
      </div>
    </div>
  );
}
