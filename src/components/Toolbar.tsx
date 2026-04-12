import React from 'react';
import useStore from '../store/useStore';

export default function Toolbar() {
  const {
    projectName,
    setProjectName,
    editMode,
    setEditMode,
    snapToGrid,
    setSnapToGrid,
    showGrid,
    setShowGrid,
    gridSize,
    setGridSize,
    showOscLog,
    setShowOscLog,
    showPropertyPanel,
    setShowPropertyPanel,
    saveProject,
    loadProject,
    removeSelectedWidgets,
    copySelected,
    pasteWidgets,
    selectedWidgetIds,
  } = useStore();

  const [editingName, setEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(projectName);

  return (
    <div className="h-11 bg-[#0e0e16] border-b border-white/5 flex items-center px-3 gap-2 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px]">
          🎚️
        </div>
        {editingName ? (
          <input
            className="bg-white/5 border border-blue-500/50 rounded px-2 py-0.5 text-sm text-white/80 outline-none w-40"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => {
              setProjectName(tempName);
              setEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setProjectName(tempName);
                setEditingName(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="text-white/60 text-sm font-medium cursor-pointer hover:text-white/80 transition-colors"
            onDoubleClick={() => {
              setTempName(projectName);
              setEditingName(true);
            }}
          >
            {projectName}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10" />

      {/* Edit/Live Toggle */}
      <button
        onClick={() => setEditMode(!editMode)}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
          editMode
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}
      >
        {editMode ? '✏️ Edit' : '▶ Live'}
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Grid controls */}
      {editMode && (
        <>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              showGrid ? 'bg-white/10 text-white/70' : 'text-white/30 hover:text-white/50'
            }`}
            title="Toggle grid"
          >
            Grid
          </button>
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              snapToGrid ? 'bg-white/10 text-white/70' : 'text-white/30 hover:text-white/50'
            }`}
            title="Snap to grid"
          >
            Snap
          </button>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-xs text-white/60 outline-none"
          >
            <option value={10}>10px</option>
            <option value={20}>20px</option>
            <option value={40}>40px</option>
          </select>

          <div className="w-px h-5 bg-white/10" />

          {/* Edit actions */}
          <button
            onClick={copySelected}
            disabled={selectedWidgetIds.length === 0}
            className="px-2 py-1 rounded text-xs text-white/30 hover:text-white/60 disabled:opacity-30 transition-colors"
            title="Copy (Ctrl+C)"
          >
            Copy
          </button>
          <button
            onClick={pasteWidgets}
            className="px-2 py-1 rounded text-xs text-white/30 hover:text-white/60 transition-colors"
            title="Paste (Ctrl+V)"
          >
            Paste
          </button>
          <button
            onClick={removeSelectedWidgets}
            disabled={selectedWidgetIds.length === 0}
            className="px-2 py-1 rounded text-xs text-white/30 hover:text-red-400 disabled:opacity-30 transition-colors"
            title="Delete (Del)"
          >
            Delete
          </button>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <button
        onClick={() => setShowOscLog(!showOscLog)}
        className={`px-2 py-1 rounded text-xs transition-colors ${
          showOscLog ? 'bg-amber-500/20 text-amber-400' : 'text-white/30 hover:text-white/60'
        }`}
      >
        📡 OSC Log
      </button>
      <button
        onClick={() => setShowPropertyPanel(!showPropertyPanel)}
        className={`px-2 py-1 rounded text-xs transition-colors ${
          showPropertyPanel ? 'bg-white/10 text-white/70' : 'text-white/30 hover:text-white/60'
        }`}
      >
        ⚙️ Props
      </button>

      <div className="w-px h-5 bg-white/10" />

      <button
        onClick={saveProject}
        className="px-2 py-1 rounded text-xs text-white/30 hover:text-white/60 transition-colors"
        title="Save project"
      >
        💾 Save
      </button>
      <button
        onClick={loadProject}
        className="px-2 py-1 rounded text-xs text-white/30 hover:text-white/60 transition-colors"
        title="Load project"
      >
        📂 Load
      </button>
    </div>
  );
}
