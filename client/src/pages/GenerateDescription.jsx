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
  FileText,
  Smartphone,
  Youtube,
  Linkedin
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
  const [plan, setPlan] = useState("free");

  /* ---------------- FETCH CREDITS ---------------- */
  const fetchCredits = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCredits(data.remaining);
        setPlan(data.plan || "free");
      }
    } catch {
      setCredits(null);
      setPlan("free");
    }
  };

  useEffect(() => {
    if (isLoaded) fetchCredits();
  }, [isLoaded]);

  /* ---------------- GENERATE HANDLER ---------------- */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    if (tone === "Custom" && !customTone.trim()) {
      toast.error("Please describe your custom tone");
      return;
    }

    // Free users only blocked
    if (plan !== "premium" && credits === null) {
      toast.error("Unable to verify credits. Refresh the page.");
      return;
    }

    if (plan !== "premium" && (credits ?? 0) <= 0) {
      toast.error("You’ve used all your free credits.");
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
          ctaLinks: links,
          tone: finalTone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!data.success) {
        toast.error(data.message || "Generation failed");
        return;
      }

      setDescription(data.content);

      // Update credits only for free users
      if (plan !== "premium") {
        setCredits(data.remainingCredits ?? data.remaining);
      }

      toast.success("Description generated!");

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- COPY HANDLER ---------------- */
  const copyToClipboard = async () => {
    if (!description) return;

    try {
      setCopying(true);

      const fullText = `${description.about}

--- TIMESTAMPS ---
${description.timestamps}

--- HASHTAGS ---
${description.hashtags}`.trim();

      await navigator.clipboard.writeText(fullText);
      toast.success("Copied to clipboard!");
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

  /* ================= UI BELOW (UNCHANGED) ================= */


  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      {/* ---------------- LEFT: INPUT ---------------- */}
      <section className="w-full lg:w-96 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Description Generator
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate SEO-optimized video descriptions.
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
                icon={<Youtube size={18} />}
                label="YouTube"
              />
              <PlatformOption
                active={platform === "reels"}
                onClick={() => setPlatform("reels")}
                icon={<Smartphone size={18} />}
                label="Reels/Shorts"
              />
              <PlatformOption
                active={platform === "linkedin"}
                onClick={() => setPlatform("linkedin")}
                icon={<Linkedin size={18} />}
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
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none transition-all"
              placeholder="e.g. Master React Hooks in 10 minutes"
            />
          </div>

          {/* CTA Links */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <LinkIcon size={14} /> CTA Links
            </label>
            <input
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="Your website, course, or social links"
            />
          </div>

          {/* Tone */}
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
                className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none animate-in fade-in slide-in-from-top-1"
                placeholder="Describe your tone (e.g. Witty and short)"
              />
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || (plan !== "premium" && credits === 0)}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap size={18} className="fill-current" />}
            {plan !== "premium" && credits === 0 ? "Out of Credits" : (loading ? "Generating..." : "Generate Description")}
          </button>

          {plan !== "premium" && credits !== null && (
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
            <>
              {loading && !description && (
                <div className="h-[40vh] flex items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
              )}
              {description && (
                <div className={`space-y-6 ${loading ? 'opacity-50 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">Video Description</h3>
                    <div className="flex gap-2 shrink-0">
                      <ActionButton
                        onClick={copyToClipboard}
                        icon={copying ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        label={copying ? "Copied" : "Copy All"}
                      />
                      {(plan === "premium" || credits > 0) && (
                        <ActionButton
                          onClick={handleGenerate}
                          icon={<RefreshCw size={16} />}
                          label="Regenerate"
                        />
                      )}
                    </div>
                  </div>

                  <ResultSection title="About This Video" icon={<AlignLeft size={16} />} iconBg="bg-blue-500/10">
                    <pre className="whitespace-pre-wrap text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
                      {description.about}
                    </pre>
                  </ResultSection>

                  <ResultSection title="Timestamps" icon={<Zap size={16} />} iconBg="bg-amber-500/10">
                    <pre className="whitespace-pre-wrap text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
                      {description.timestamps}
                    </pre>
                  </ResultSection>

                  <ResultSection title="Optimized Hashtags" icon={<Hash size={16} />} iconBg="bg-violet-500/10">
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{description.hashtags}</p>
                  </ResultSection>

                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex gap-4 bg-white/80">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                       <Lightbulb className="text-amber-500" size={20} />
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      <span className="font-bold text-slate-800 underline decoration-amber-200 decoration-2">SEO Tip:</span> Put your most important keywords in the first 2 lines of the description for better search ranking.
                    </p>
                  </div>
                </div>
              )}
            </>
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
      active ? "border-violet-500 bg-violet-50/50 text-violet-600 shadow-sm" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-500 shadow-none"
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className="text-[10px] font-bold uppercase mt-1.5 tracking-wider">{label}</span>
  </button>
);

const ActionButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm">
    {icon} <span>{label}</span>
  </button>
);

const ResultSection = ({ title, icon, iconBg, children }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
      <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">{title}</h4>
    </div>
    <div>{children}</div>
  </div>
);

const EmptyState = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 animate-in zoom-in duration-300">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6"><FileText className="text-slate-300" size={40} /></div>
    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Need a description?</h3>
    <p className="text-slate-500 text-sm mt-2 max-w-60 leading-relaxed">Fill out the video details on the left to generate SEO-ready metadata.</p>
  </div>
);

export default GenerateDescription;