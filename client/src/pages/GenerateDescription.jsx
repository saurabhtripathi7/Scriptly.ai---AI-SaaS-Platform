import { useState, useEffect } from "react";
import {
  Zap,
  PlayCircle,
  Video,
  Briefcase,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ChevronDown,
  AlignLeft,
  Lightbulb,
  Hash,
  Link as LinkIcon,
} from "lucide-react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateDescription = () => {
  /* ---------------- AUTH ---------------- */
  const { isLoaded } = useUser();
  const { getToken } = useAuth();

  /* ---------------- INPUT STATE ---------------- */
  const [platform, setPlatform] = useState("youtube");
  const [topic, setTopic] = useState("");
  const [links, setLinks] = useState("");
  const [tone, setTone] = useState("Professional & SEO Friendly");
  const [customTone, setCustomTone] = useState("");

  /* ---------------- UI STATE ---------------- */
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(null);
  const [copying, setCopying] = useState(false);
  const [credits, setCredits] = useState(null); 

  /* ---------------- HANDLERS ---------------- */
  const fetchCredits = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setCredits(data.remaining);
      }
    } catch {
      setCredits(null);
    }
  };

  // ✅ FIX: Avoid race conditions by waiting for Clerk to be ready
  useEffect(() => {
    if (isLoaded) {
      fetchCredits();
    }
  }, [isLoaded]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic or title");
      return;
    }

    if (tone === "Custom" && !customTone.trim()) {
      toast.error("Please describe your custom tone");
      return;
    }

    // ✅ FIX: Hardened credit guard (Safer Policy)
    if (credits === null) {
      toast.error("Unable to verify credits. Please refresh.");
      return;
    }
    if (credits <= 0) {
      toast.error("You’ve used all your free credits. Upgrade to continue.");
      return;
    }

    try {
      setDescription(null);
      setLoading(true);

      const token = await getToken();
      const finalTone = tone === "Custom" ? customTone : tone;

      const { data } = await axios.post(
        "/api/ai/generate-description",
        {
          platform,
          topic,
          links,
          tone: finalTone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setDescription(data.content);
        setCredits(data.remainingCredits); 
        toast.success("Description generated!");

        await axios.post(
          "/api/user/save-creation",
          {
            type: "description",
            prompt: topic,
            content: data.content,
            platform,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        toast.error(data.message || "Generation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!description) return;
    try {
      setCopying(true);
      const fullText = `${description.about}\n\n--- TIMESTAMPS ---\n${description.timestamps}\n\n--- HASHTAGS ---\n${description.hashtags}`.trim();

      await navigator.clipboard.writeText(fullText);
      toast.success("Description copied!");
      setTimeout(() => setCopying(false), 2000);
    } catch {
      toast.error("Failed to copy");
      setCopying(false);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Description Generator</h2>
          <p className="text-sm text-slate-500 mt-1">Generate SEO-optimized descriptions and timestamps.</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Select Platform</label>
            <div className="grid grid-cols-3 gap-2">
              <PlatformOption active={platform === "youtube"} onClick={() => setPlatform("youtube")} icon={<PlayCircle size={18} />} label="YouTube" />
              <PlatformOption active={platform === "reels"} onClick={() => setPlatform("reels")} icon={<Video size={18} />} label="Reels" />
              <PlatformOption active={platform === "linkedin"} onClick={() => setPlatform("linkedin")} icon={<Briefcase size={18} />} label="LinkedIn" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Video Title or Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
              placeholder="What is your video about?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <LinkIcon size={14} /> CTA Links (Optional)
            </label>
            <input
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. https://mycourse.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tone of Voice</label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none appearance-none pr-10 cursor-pointer"
              >
                <option>Professional & SEO Friendly</option>
                <option>Casual & Friendly</option>
                <option>Minimalist</option>
                <option>Hype & Salesy</option>
                <option value="Custom">Custom Tone...</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            {tone === "Custom" && (
              <input
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none mt-2 animate-in fade-in slide-in-from-top-1"
                placeholder="Describe your tone..."
              />
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || credits === 0}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap size={18} className="fill-current" />}
            {credits === 0 ? "Out of Credits" : (loading ? "Generating..." : "Generate Description")}
          </button>

          {credits !== null && (
            <p className="text-xs text-slate-400 text-center font-medium tracking-tight">
              {credits} free credits remaining
            </p>
          )}
        </div>
      </section>

      {/* ---------------- RIGHT: OUTPUT ---------------- */}
      <section className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {!description && !loading ? (
            <EmptyState />
          ) : (
            <div className={`space-y-6 ${loading ? 'opacity-50 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">Video Description</h3>
                <div className="flex gap-2 shrink-0">
                  <ActionButton
                    onClick={copyToClipboard}
                    icon={copying ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    label={copying ? "Copied" : "Copy All"}
                  />
                  {/* ✅ FIX: Regenerate button respects credits */}
                  {credits > 0 && (
                    <ActionButton
                      onClick={handleGenerate}
                      icon={<RefreshCw size={16} />}
                      label="Regenerate"
                    />
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <AlignLeft size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">About this Video</h4>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{description?.about}</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Zap size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Timestamps</h4>
                </div>
                <p className="text-slate-600 text-sm font-mono leading-relaxed whitespace-pre-wrap">{description?.timestamps}</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Hash size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Optimized Hashtags</h4>
                </div>
                <p className="text-violet-600 font-medium text-sm">{description?.hashtags}</p>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex gap-4 bg-white/80">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Lightbulb className="text-amber-500" size={20} />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-800 underline decoration-amber-200 decoration-2">SEO Tip:</span> Place your most important keywords in the first 2 lines of the description as this is what appears in search results before the "Show More" button.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* --- HELPERS --- */
const PlatformOption = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all duration-200 ${
      active
        ? "border-violet-500 bg-violet-50/50 text-violet-600 shadow-sm"
        : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 shadow-none"
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
      <AlignLeft className="text-slate-300" size={40} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create SEO Descriptions</h3>
    <p className="text-slate-500 text-sm mt-2 max-w-60 leading-relaxed">
      Enter your video topic on the left to generate a professional description with timestamps and hashtags.
    </p>
  </div>
);

export default GenerateDescription;