import { useState } from "react";
import {
  Zap,
  PlayCircle,
  Video,
  Briefcase,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Tally3,
  ChevronDown,
  Type,
  Lightbulb,
} from "lucide-react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateTitle = () => {
  /* ---------------- AUTH ---------------- */
  const { isLoaded } = useUser();
  const { getToken } = useAuth();

  /* ---------------- INPUT STATE ---------------- */
  const [platform, setPlatform] = useState("youtube");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Catchy & Viral");
  const [customTone, setCustomTone] = useState("");

  /* ---------------- UI STATE ---------------- */
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState(null); // Expecting an array of strings
  const [copyIndex, setCopyIndex] = useState(null);

  /* ---------------- HANDLERS ---------------- */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const finalTone = tone === "Custom" ? customTone : tone;

      const { data } = await axios.post(
        "/api/ai/generate-titles",
        {
          platform,
          topic,
          keywords,
          tone: finalTone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setTitles(data.content); // Assuming backend returns { content: ["Title 1", "Title 2"...] }
        toast.success("Titles generated!");
      } else {
        toast.error(data.message || "Generation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyIndex(index);
      toast.success("Title copied!");
      setTimeout(() => setCopyIndex(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center min-h-100">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      {/* ---------------- LEFT: INPUT ---------------- */}
      <section className="w-full lg:w-96 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Title Generator
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create high-CTR titles designed to go viral.
          </p>
        </div>

        <div className="space-y-5">
          {/* Platform */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Select Platform</label>
            <div className="grid grid-cols-3 gap-2">
              <PlatformOption
                active={platform === "youtube"}
                onClick={() => setPlatform("youtube")}
                icon={<PlayCircle size={18} />}
                label="YouTube"
              />
              <PlatformOption
                active={platform === "reels"}
                onClick={() => setPlatform("reels")}
                icon={<Video size={18} />}
                label="Reels"
              />
              <PlatformOption
                active={platform === "linkedin"}
                onClick={() => setPlatform("linkedin")}
                icon={<Briefcase size={18} />}
                label="LinkedIn"
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Video Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none"
              placeholder="What is your video about?"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Target Keywords (Optional)</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. SEO, passive income, 2024"
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title Style</label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none appearance-none pr-10 cursor-pointer"
              >
                <option>Catchy & Viral</option>
                <option>How-to / Educational</option>
                <option>Listicle (Top 10...)</option>
                <option>Click-worthy / Curiosity</option>
                <option>Professional & Clear</option>
                <option value="Custom">Custom Style...</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            {tone === "Custom" && (
              <input
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none mt-2 animate-in fade-in slide-in-from-top-1"
                placeholder="e.g. Minimalist and short"
              />
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap size={18} className="fill-current" />}
            {loading ? "Generating..." : "Generate Titles"}
          </button>
        </div>
      </section>

      {/* ---------------- RIGHT: OUTPUT ---------------- */}
      <section className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {!titles && !loading ? (
            <EmptyState />
          ) : (
            <div className={`space-y-6 ${loading ? 'opacity-50 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900">Recommended Titles</h3>
                {titles && (
                  <button onClick={handleGenerate} className="text-violet-600 flex items-center gap-2 text-sm font-semibold hover:text-violet-700 transition-colors">
                    <RefreshCw size={16} /> Regenerate
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                {titles?.map((title, index) => (
                  <div 
                    key={index} 
                    className="group bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-800 font-semibold text-lg leading-snug">{title}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(title, index)}
                      className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors shrink-0"
                    >
                      {copyIndex === index ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-slate-400 group-hover:text-violet-500" />}
                    </button>
                  </div>
                ))}
              </div>

              {titles && (
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex gap-4 bg-white/80">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Lightbulb className="text-amber-500" size={20} />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-800 underline decoration-amber-200 decoration-2">Pro Tip:</span>{" "}
                    Use titles that create a "Curiosity Gap"—mention a result but don't explain exactly how it was achieved until the viewer clicks.
                  </p>
                </div>
              )}
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
        ? "border-violet-500 bg-violet-50/50 text-violet-600 shadow-sm"
        : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className="text-[10px] font-bold uppercase mt-1.5 tracking-wider">{label}</span>
  </button>
);

const EmptyState = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 animate-in zoom-in duration-300">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <Type className="text-slate-300" size={40} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Generate Viral Titles</h3>
    <p className="text-slate-500 text-sm mt-2 max-w-60 leading-relaxed">
      Type your video topic and keywords on the left to get AI-optimized title suggestions.
    </p>
  </div>
);

export default GenerateTitle;