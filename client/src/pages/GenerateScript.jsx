import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import {
  Zap,
  Briefcase,
  Check,
  ChevronDown,
  Copy,
  FileText,
  PlayCircle,
  RefreshCw,
  Video,
  Loader2,
  Anchor,
  List,
  Megaphone,
  Lightbulb,
  Youtube, Smartphone, Linkedin
} from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateScript = () => {
  /* ---------------- AUTH ---------------- */
  const { isLoaded } = useUser();
  const { getToken } = useAuth();

  /* ---------------- INPUT STATE ---------------- */
  const [platform, setPlatform] = useState("youtube");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Informative & Educational");
  const [customTone, setCustomTone] = useState("");

  /* ---------------- OUTPUT STATE ---------------- */
  const [script, setScript] = useState({
    title: "",
    hook: "",
    points: [],
    cta: "",
  });

  /* ---------------- SYSTEM STATE ---------------- */
  const [loading, setLoading] = useState(false);
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
    } catch (err) {
      console.error("Credits fetch failed:", err);
      setCredits(null);
      setPlan("free");
    }
  };

  useEffect(() => {
    if (isLoaded) fetchCredits();
  }, [isLoaded]);

  /* ---------------- GENERATE SCRIPT ---------------- */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter video topic");
      return;
    }

    if (tone === "Custom" && !customTone.trim()) {
      toast.error("Describe custom tone");
      return;
    }

    if (plan !== "premium" && credits === null) {
      toast.error("Checking credits...");
      return;
    }

    if (plan !== "premium" && (credits ?? 0) <= 0) {
      toast.error("No credits remaining");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const finalTone = tone === "Custom" ? customTone : tone;

      const { data } = await axios.post(
        "/api/ai/generate-script",
        {
          platform,
          topic,
          audience,
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

      const output = data.content || "";

      /* Your Specific Logic: Safe parsing */
      const hookMatch = output.match(/Hook[\s\S]*?\n“?([\s\S]*?)”?\n/i);
      const bodyMatch = output.match(/Body[\s\S]*?\n“?([\s\S]*?)”?\n/i);
      const engagementMatch = output.match(/Engagement prompts[\s\S]*?\n“?([\s\S]*?)”?\n/i);
      const ctaMatch = output.match(/CTA ending[\s\S]*?\n“?([\s\S]*)”?$/i);

      setScript({
        title: topic,
        hook: hookMatch?.[1]?.trim() || "",
        points: [
          { label: "Body", content: bodyMatch?.[1]?.trim() || "" },
          {
            label: "Engagement",
            content: engagementMatch?.[1]?.trim() || "",
          },
        ],
        cta: ctaMatch?.[1]?.trim() || "",
      });

      if (plan !== "premium" && data.remainingCredits !== undefined) {
        setCredits(data.remainingCredits);
      }

      toast.success("Script generated!");
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- COPY SCRIPT ---------------- */
  const copyToClipboard = async () => {
    try {
      setCopying(true);
      const text = `
${script.title}

HOOK:
${script.hook}

BODY:
${script.points.map((p) => `${p.label}: ${p.content}`).join("\n\n")}

CTA:
${script.cta}
`.trim();

      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Copy failed");
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      {/* ---------------- LEFT: INPUT ---------------- */}
      <section className="w-full lg:w-96 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Script Generator</h2>
          <p className="text-sm text-slate-500 mt-1">Generate high-converting video scripts.</p>
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
              rows={4}
              placeholder="e.g. 5 Productivity Hacks for Developers"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Target Audience</label>
            <input
              placeholder="e.g. Tech students, entrepreneurs"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
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
                <option>Informative & Educational</option>
                <option>Energetic</option>
                <option>Professional</option>
                <option value="Custom">Custom Tone...</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {tone === "Custom" && (
              <input
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none animate-in fade-in slide-in-from-top-1 mt-2"
                placeholder="Describe your tone..."
              />
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap size={18} className="fill-current" />}
            {loading ? "Generating..." : "Generate Script"}
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
          {!script.title && !loading ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {loading && !script.hook && (
                <div className="h-[40vh] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
              )}

              {!loading && script.title && (
                <div className="animate-in fade-in duration-500 space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                      {script.title}
                    </h3>
                    <div className="flex gap-2 shrink-0">
                      <ActionButton
                        onClick={copyToClipboard}
                        icon={copying ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        label={copying ? "Copied" : "Copy"}
                      />
                      <ActionButton
                        onClick={handleGenerate}
                        icon={<RefreshCw size={16} />}
                        label="Regenerate"
                      />
                    </div>
                  </div>

                  <ResultSection title="The Hook" icon={<Anchor size={16} />} iconBg="bg-amber-500/10">
                    <p className="italic text-slate-600 leading-relaxed border-l-4 border-amber-200 pl-4 py-1">
                      "{script.hook}"
                    </p>
                  </ResultSection>

                  <ResultSection title="Content Body" icon={<List size={16} />} iconBg="bg-violet-500/10">
                    <div className="space-y-5">
                      {script.points.map((p, i) => (
                        <div key={i} className="group">
                          <p className="font-bold text-slate-800 mb-1 flex gap-2">
                            <span className="text-violet-400">#</span> {p.label}
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed pl-5 whitespace-pre-wrap">
                            {p.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ResultSection>

                  <ResultSection title="Call to Action" icon={<Megaphone size={16} />} iconBg="bg-emerald-500/10">
                    <p className="text-slate-600 font-medium">{script.cta}</p>
                  </ResultSection>

                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex gap-4 bg-white/80">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <Lightbulb className="text-amber-500" size={20} />
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      <span className="font-bold text-slate-800 underline decoration-amber-200 decoration-2">Creator's Note:</span> Ensure your Hook is delivered within the first 3 seconds to maximize viewer retention.
                    </p>
                  </div>
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
        : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-500"
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? "scale-110" : "scale-100"}`}>{icon}</div>
    <span className="text-[10px] font-bold uppercase mt-1.5 tracking-wider">{label}</span>
  </button>
);

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
  >
    {icon} <span>{label}</span>
  </button>
);

const ResultSection = ({ title, icon, iconBg, children }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">{title}</h4>
    </div>
    <div className="text-sm sm:text-base">{children}</div>
  </div>
);

const EmptyState = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 animate-in zoom-in duration-300">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <FileText className="text-slate-300" size={40} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Script Ready?</h3>
    <p className="text-slate-500 text-sm mt-2 max-w-60 leading-relaxed">
      Fill out the details on the left and let AI craft your perfect video script.
    </p>
  </div>
);

export default GenerateScript;