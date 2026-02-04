import { useState } from "react";
import { useOutletContext } from "react-router-dom"; 
import {
  Zap, Youtube, Smartphone, Linkedin, Download,
  RefreshCw, Loader2, Lightbulb, ShieldCheck,
  Copy, Check, Image as ImageIcon, CreditCard
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { PlatformOption, ActionButton, EmptyState } from "../components/SharedComponents";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const THUMBNAIL_STYLES = [
  "High Contrast", "Minimalist", "Gaming/Neon", "Corporate",
  "Cinematic", "3D Render", "Anime", "Custom",
];

const PLATFORMS = [
  { label: "YouTube", value: "youtube", icon: <Youtube size={18} /> },
  { label: "Reels/Shorts", value: "reels", icon: <Smartphone size={18} /> },
  { label: "LinkedIn", value: "linkedin", icon: <Linkedin size={18} /> },
];

const GenerateThumbnails = () => {
  const { getToken } = useAuth();
  
  // 1. Consume shared context from Layout
  const { balance, fetchBalance } = useOutletContext(); 

  /* ---------------- STATE ---------------- */
  const [selectedStyle, setSelectedStyle] = useState("High Contrast");
  const [customStyle, setCustomStyle] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copying, setCopying] = useState(false);

  /* ---------------- HANDLERS ---------------- */
  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Describe your thumbnail idea");
      return;
    }

    if (balance.plan !== "premium" && balance.remaining < 5) {
      toast.error("Insufficient credits. Each thumbnail costs 5 credits.");
      return;
    }

    try {
      setLoading(true);
      setContent("");
      const token = await getToken();
      const finalStyle = selectedStyle === "Custom" ? customStyle : selectedStyle;

      const { data } = await axios.post(
        "/api/ai/generate-thumbnail",
        { prompt: input, platform: selectedPlatform, style: finalStyle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Thumbnail generated!");
        // 2. Re-sync the Navbar credits immediately
        fetchBalance(); 
      } else {
        toast.error(data.message || "Generation failed");
      }
    } catch (err) {
      toast.error("Server error. AI might be busy.");
    } finally {
      setLoading(false);
    }
  };

  const copyImageLink = async () => {
    if (!content) return;
    try {
      setCopying(true);
      await navigator.clipboard.writeText(content);
      toast.success("Image link copied!");
      setTimeout(() => setCopying(false), 2000);
    } catch {
      toast.error("Copy failed");
      setCopying(false);
    }
  };

  const downloadImage = async () => {
    if (!content) return;
    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scriptly-thumbnail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(content, "_blank");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      {/* ---------------- SIDEBAR: INPUTS ---------------- */}
      <section className="w-full lg:w-96 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thumbnail Studio</h2>
            <p className="text-sm text-slate-500 mt-1">Design high-CTR visuals.</p>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100 uppercase">
            <ShieldCheck size={12} /> {balance.plan === "premium" ? "PRO" : "FREE"}
          </div>
        </header>

        <div className="space-y-5">
          {/* Target Platform */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Target Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <PlatformOption
                  key={p.value}
                  active={selectedPlatform === p.value}
                  onClick={() => setSelectedPlatform(p.value)}
                  icon={p.icon}
                  label={p.label}
                />
              ))}
            </div>
          </div>

          {/* Visual Concept Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Visual Concept</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none"
              placeholder="e.g. A luxury supercar driving through a neon city at night..."
            />
          </div>

          {/* Art Style Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Art Style</label>
            <div className="flex flex-wrap gap-2">
              {THUMBNAIL_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedStyle === style 
                      ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            {selectedStyle === "Custom" && (
              <input
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none mt-2 animate-in fade-in slide-in-from-top-1"
                placeholder="Describe your custom style..."
              />
            )}
          </div>

          {/* Generate Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading || (balance.plan !== "premium" && balance.remaining < 5)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap size={18} className="fill-current" />}
              {loading ? "Creating..." : "Generate Masterpiece"}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <CreditCard size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Cost: 5 Credits</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- MAIN CANVAS: OUTPUT ---------------- */}
      <section className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!content && !loading ? (
            <EmptyState 
              icon={ImageIcon} 
              title="Thumbnail Studio" 
              description="Describe your vision and let AI create high-converting thumbnails in seconds."
            />
          ) : (
            <div className="space-y-6">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your Creation</h3>
                <div className="flex gap-2 shrink-0">
                  {content && (
                    <>
                      <ActionButton 
                        onClick={copyImageLink} 
                        icon={copying ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />} 
                        label={copying ? "Copied" : "Copy Link"} 
                      />
                      <ActionButton 
                        onClick={downloadImage} 
                        icon={<Download size={16} />} 
                        label="Download PNG" 
                      />
                    </>
                  )}
                  <ActionButton onClick={handleGenerate} icon={<RefreshCw size={16} />} label="Regenerate" />
                </div>
              </header>

              {/* Centered Image Result Section */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-xl flex items-center justify-center min-h-125 transition-all duration-500">
                {loading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] animate-pulse">Painting your idea...</p>
                  </div>
                ) : (
                  content && <img src={content} alt="generated thumbnail" className="rounded-3xl max-h-[70vh] shadow-2xl border-4 border-white animate-in zoom-in fade-in duration-500" />
                )}
              </div>

              {/* Pro Growth Tip */}
              <footer className="p-5 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Lightbulb className="text-amber-500" size={20} />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  <span className="font-bold text-slate-800 not-italic">Growth Tip:</span> High-performing thumbnails often feature an "emotional face" or a "curiosity gap." Keep text punchy and mobile-friendly!
                </p>
              </footer>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GenerateThumbnails;