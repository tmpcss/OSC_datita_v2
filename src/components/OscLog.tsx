import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

export default function OscLog() {
  const { oscLog, showOscLog, clearOscLog } = useStore();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [oscLog]);

  if (!showOscLog) return null;

  return (
    <div className="h-40 bg-[#0a0a12] border-t border-white/5 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-amber-400/60 font-semibold">
            📡 OSC Monitor
          </span>
          <span className="text-[10px] text-white/20">{oscLog.length} messages</span>
        </div>
        <button
          onClick={clearOscLog}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
        >
          Clear
        </button>
      </div>
      <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-1 font-mono text-[11px] space-y-0.5">
        {oscLog.length === 0 ? (
          <div className="text-white/15 text-center py-4">No OSC messages yet. Interact with controls to see output.</div>
        ) : (
          oscLog.map((msg, i) => (
            <div key={i} className="flex items-center gap-3 hover:bg-white/5 rounded px-1">
              <span className="text-white/15 text-[9px] tabular-nums w-20 shrink-0">
                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 2 } as any)}
              </span>
              <span className="text-cyan-400/70">{msg.address}</span>
              <span className="text-amber-400/60">
                [{msg.args.map((a) => (typeof a === 'number' ? a.toFixed(3) : a)).join(', ')}]
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
