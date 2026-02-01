import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import {
  Zap,
  PlayCircle,
  Video,
  Briefcase,
  Download,
  RefreshCw,
  Loader2,
  ChevronDown,
  Layout,
  Lightbulb,
  Sparkles,
  Maximize2,
  Lock,
  Crown,
  ShieldCheck,
  Plus,
  Palette,
  Copy,
  Check,
  Youtube
} from "lucide-react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const THUMBNAIL_STYLES = [
  "High Contrast",
  "Minimalist",
  "Gaming/Neon",
  "Corporate",
  "Cinematic",
  "3D Render",
  "Anime",
  "Custom",
];

const ASPECT_RATIOS = [
  { label: "16:9 Video", value: "16:9", icon: <PlayCircle size={16} /> },
  { label: "9:16 Shorts", value: "9:16", icon: <Video size={16} /> },
  { label: "1:1 Post", value: "1:1", icon: <Briefcase size={16} /> },
];

const GenerateThumbnails = () => {
  const navigate = useNavigate(); // Hook for routing
  
  /* ---------------- AUTH & PLAN ---------------- */
  const { isLoaded } = useUser();
  const { getToken, has } = useAuth();
  const isPremium = has({ plan: "premium" });

  /* ---------------- INPUT STATE ---------------- */
  const [selectedStyle, setSelectedStyle] = useState("High Contrast");
  const [customStyle, setCustomStyle] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [input, setInput] = useState("");

  /* ---------------- UI STATE ---------------- */
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copying, setCopying] = useState(false);

  /* ---------------- HANDLERS ---------------- */
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!isPremium) {
      toast.error("Premium subscription required");
      return;
    }

    if (!input.trim()) {
      toast.error("Please describe your video topic");
      return;
    }

    if (selectedStyle === "Custom" && !customStyle.trim()) {
      toast.error("Please enter your custom style description");
      return;
    }

    try {
      setLoading(true);
      setContent("");
      const token = await getToken();
      const finalStyle = selectedStyle === "Custom" ? customStyle : selectedStyle;

      const { data } = await axios.post(
        "/api/ai/generate-thumbnail",
        {
          prompt: input,
          aspect_ratio: selectedRatio,
          style: finalStyle,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Thumbnail generated!");
      } else {
        toast.error(data.message || "Generation failed");
      }
    } catch (err) {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      setCopying(true);
      await navigator.clipboard.writeText(content);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
      setCopying(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      {/* ---------------- LEFT: SETTINGS SIDEBAR ---------------- */}
      <section className="w-full lg:w-96 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
        
        {/* Premium Overlay */}
        {!isPremium && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 mb-4">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Premium Feature</h3>
            <p className="text-sm text-slate-500 mt-2">
              Thumbnail generation is exclusive to Scriptly.AI Pro members.
            </p>
            {/* ✅ FIXED: Added navigation to pricing */}
            <button 
              onClick={() => navigate("/plans")}
              className="mt-6 w-full bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
            >
              Unlock Studio
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thumbnail Studio</h2>
          {isPremium ? (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3 h-3" /> PRO
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-full border border-amber-100">
              <Lock className="w-3 h-3" /> PRO
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((r) => (
                <PlatformOption
                  key={r.value}
                  active={selectedRatio === r.value}
                  onClick={() => setSelectedRatio(r.value)}
                  icon={r.icon}
                  label={r.value}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Sparkles size={14} className="text-violet-500" /> Describe Image
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none transition-all placeholder:text-slate-400"
              placeholder="e.g. A futuristic creator room with purple neon lights..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Art Style</label>
            <div className="flex flex-wrap gap-2">
              {THUMBNAIL_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                    selectedStyle === style
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {style === "Custom" ? (
                    <span className="flex items-center gap-1">
                      <Plus size={12} /> Custom
                    </span>
                  ) : style}
                </button>
              ))}
            </div>

            {selectedStyle === "Custom" && (
              <div className="relative mt-2 animate-in fade-in slide-in-from-top-1">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="e.g. Cyberpunk with neon pink"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-violet-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !isPremium}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap size={18} className="fill-current" />
            )}
            {loading ? "Generating Artwork..." : "Generate Artwork"}
          </button>
        </div>

        <div className="mt-auto bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-3">
          <ShieldCheck className="w-5 h-5 text-violet-500 shrink-0" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Optimized for CTR algorithms. Pro users get high-resolution exports and aspect ratio control.
          </p>
        </div>
      </section>

      {/* ---------------- RIGHT: CANVAS AREA ---------------- */}
      <section className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="max-w-4xl mx-auto flex flex-col h-full">
          {!content && !loading ? (
            <EmptyState />
          ) : (
            <div className={`space-y-6 ${loading ? 'opacity-50 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">Studio Canvas</h3>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  {content && (
                    <>
                      <ActionButton onClick={copyToClipboard} icon={copying ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />} label="Copy Link" />
                      <ActionButton onClick={() => window.open(content, "_blank")} icon={<Download size={16} />} label="Export HD" />
                    </>
                  )}
                  {/* ✅ FIXED: Gated Regenerate button behind isPremium */}
                  {isPremium && (
                    <ActionButton onClick={handleGenerate} icon={<RefreshCw size={16} />} label="Regenerate" />
                  )}
                </div>
              </div>

              <div className="relative group bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-100 flex items-center justify-center">
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-500 mb-4" />
                    <p className="text-violet-400 font-bold uppercase tracking-widest text-xs">Developing Vision...</p>
                  </div>
                )}
                
                {content ? (
                  <>
                    <img 
                      src={content} 
                      alt="AI Generated" 
                      className={`shadow-2xl transition-transform duration-700 group-hover:scale-105 ${
                        selectedRatio === "9:16" ? "h-[70vh] w-auto" : "w-full h-auto"
                      }`}
                    />
                    <button 
                      onClick={() => window.open(content, "_blank")}
                      className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <Layout className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Canvas Ready</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex gap-4 bg-white/80">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Lightbulb className="text-amber-500" size={20} />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-800 underline decoration-amber-200 decoration-2">Pro Tip:</span>{" "}
                  Keep text to a minimum. Use no more than 3-4 words in high-contrast colors to ensure readability on small mobile screens.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ---------------- HELPERS ---------------- */

const PlatformOption = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all duration-200 ${
      active
        ? "border-violet-500 bg-violet-50 text-violet-600 shadow-sm"
        : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className="text-[10px] font-bold uppercase mt-1.5 tracking-wider">{label}</span>
  </button>
);

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
  >
    {icon} <span>{label}</span>
  </button>
);

const EmptyState = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 animate-in zoom-in duration-300">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <Sparkles className="text-slate-300" size={40} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create Scroll-Stopping Visuals</h3>
    <p className="text-slate-500 text-sm mt-2 max-w-60 leading-relaxed">
      Describe your scene on the left and our AI will generate a high-CTR thumbnail for your next video.
    </p>
  </div>
);

export default GenerateThumbnails;