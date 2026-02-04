import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  PlayCircle,
  Video,
  Briefcase,
  Zap,
  RefreshCw,
  Loader2,
  ChevronDown,
  Copy,
  Check,
  Lightbulb,
  Type,
  ShieldCheck,
  CreditCard,
  Youtube,
  Smartphone,
  Linkedin,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

import {
  PlatformOption,
  ActionButton,
  EmptyState,
} from "../components/SharedComponents";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateTitle = () => {
  const { getToken } = useAuth();
  const { balance, fetchBalance } = useOutletContext();

  /* ---------------- STATE ---------------- */
  const [platform, setPlatform] = useState("youtube");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Catchy & Viral");
  const [customTone, setCustomTone] = useState("");

  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState(null);
  const [copyIndex, setCopyIndex] = useState(null);

  /* ---------------- GENERATE ---------------- */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    if (tone === "Custom" && !customTone.trim()) {
      toast.error("Please describe custom tone");
      return;
    }

    if (balance.plan !== "premium" && (balance.remaining ?? 0) <= 0) {
      toast.error("Insufficient credits.");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();
      const finalTone = tone === "Custom" ? customTone : tone;

      const { data } = await axios.post(
        "/api/ai/generate-titles",
        { platform, topic, keywords, tone: finalTone },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!data.success) {
        toast.error(data.message || "Generation failed");
        return;
      }

      setTitles(data.content);
      toast.success("Titles generated!");

      fetchBalance(); // sync navbar credits
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Server error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- COPY ---------------- */
  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyIndex(index);
      toast.success("Copied!");
      setTimeout(() => setCopyIndex(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
      {/* ---------------- SIDEBAR ---------------- */}
      <section className="w-full lg:w-96 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Title Studio</h2>
            <p className="text-sm text-slate-500 mt-1">
              Create high CTR titles.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100 uppercase">
            <ShieldCheck size={12} />{" "}
            {balance.plan === "premium" ? "PRO" : "FREE"}
          </div>
        </header>

        <div className="space-y-5">
          {/* Platform */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Target Platform
            </label>

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
            <label className="text-sm font-semibold text-slate-700">
              Video Topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
              placeholder="e.g. Learn React Hooks Fast"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Keywords
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="SEO, Growth, Coding..."
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Title Style
            </label>

            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none appearance-none pr-10"
              >
                <option>Catchy & Viral</option>
                <option>How-to / Educational</option>
                <option>Listicle</option>
                <option>Click-worthy</option>
                <option>Professional & Clear</option>
                <option value="Custom">Custom...</option>
              </select>

              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
            </div>

            {tone === "Custom" && (
              <input
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none mt-2"
                placeholder="Describe tone..."
              />
            )}
          </div>

          {/* Generate */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={
                loading ||
                (balance.plan !== "premium" && balance.remaining === 0)
              }
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap size={18} />
              )}
              {loading ? "Generating..." : "Generate Titles"}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <CreditCard size={14} />
              <span className="text-[11px] font-bold uppercase">
                Cost: 1 Credit
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- OUTPUT ---------------- */}
      <section className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {!titles && !loading ? (
            <EmptyState
              icon={Type}
              title="Generate Viral Titles"
              description="Enter topic details to generate titles."
            />
          ) : (
            <div className="space-y-6">
              <header className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  Recommended Titles
                </h3>

                {titles && (
                  <ActionButton
                    onClick={handleGenerate}
                    icon={<RefreshCw size={16} />}
                    label="Regenerate"
                  />
                )}
              </header>

              <div className="grid gap-4">
                {(loading && !titles ? [1, 2, 3, 4, 5] : titles)?.map(
                  (title, index) => (
                    <div
                      key={index}
                      className="group bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex justify-between gap-4"
                    >
                      <p className="font-semibold text-slate-800">
                        {loading && !titles ? "Generating..." : title}
                      </p>

                      <button
                        onClick={() => copyToClipboard(title, index)}
                        className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100"
                      >
                        {copyIndex === index ? (
                          <Check size={18} className="text-emerald-500" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                  ),
                )}
              </div>

              {titles && !loading && (
                <footer className="p-5 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <Lightbulb className="text-amber-500" size={20} />
                  </div>

                  <p className="text-xs text-slate-500 italic">
                    <span className="font-bold text-slate-800">Pro Tip:</span>{" "}
                    The first 3 words matter most for CTR.
                  </p>
                </footer>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GenerateTitle;