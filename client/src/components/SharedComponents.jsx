// src/components/SharedComponents.jsx
import { Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";

export const EmptyState = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50 p-10">
    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
      <ImageIcon className="text-slate-200" size={48} />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Imagine. Generate. Grow.</h3>
    <p className="text-slate-500 text-sm mt-3 max-w-xs leading-relaxed italic">
      Your content deserves more clicks. Describe your video concept and watch AI build your thumbnail.
    </p>
  </div>
);

export const PlatformOption = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${
      active 
        ? "border-violet-500 bg-violet-50/50 text-violet-600 shadow-sm" 
        : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
    }`}
  >
    <div className={`transition-transform ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">{label}</span>
  </button>
);

export const ActionButton = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
  >
    {icon} <span>{label}</span>
  </button>
);

// FIX: Removed the duplicate declaration that was causing the crash.
export const ResultSection = ({ loading, content }) => (
  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-xl flex items-center justify-center min-h-125">
    {loading ? (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Computing Pixels...</p>
      </div>
    ) : (
      content && (
        <img
          src={content}
          alt="generated thumbnail"
          className="rounded-2xl max-h-[70vh] shadow-2xl border-4 border-white transition-all duration-500"
        />
      )
    )}
  </div>
);