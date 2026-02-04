import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Loader2, Copy, Download, ExternalLink, 
  ZoomIn, ZoomOut, Trash2, RefreshCw, Globe, Lock, Sparkles, Check
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const ViewCreation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [creation, setCreation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchCreation = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const { data } = await axios.get(`/api/user/get-creation/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setCreation(data.creation);
      } catch (error) {
        toast.error("Failed to load asset");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCreation();
  }, [id, getToken]);

  /* ---------------- UNIVERSAL COPY LOGIC ---------------- */
  const handleUniversalCopy = () => {
    if (!creation?.content) return;
    
    // For thumbnails, we copy the Data URL (base64)
    // For text, we parse and copy the clean string
    let contentToCopy = creation.content;
    try {
        const parsed = JSON.parse(creation.content);
        contentToCopy = Array.isArray(parsed) ? parsed.join('\n') : (parsed.about || parsed.description || creation.content);
    } catch (e) { /* Content is plain text */ }

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  /* ---------------- OTHER ACTIONS ---------------- */
  const handleTogglePublish = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(`/api/user/toggle-publish-creation/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setCreation(prev => ({ ...prev, publish: data.isPublished }));
        toast.success(data.isPublished ? "Asset is now Public" : "Asset is now Private");
      }
    } catch (error) { toast.error("Sync failed"); }
  };

  const handleRegenerate = () => {
    const typeRouteMap = {
      'generate script': 'generate-script',
      'generate thumbnail': 'generate-thumbnails',
      'generate thumbnails': 'generate-thumbnails',
      'generate title': 'generate-title',
      'generate description': 'generate-description'
    };
    const route = typeRouteMap[creation.type?.toLowerCase().trim()] || 'generate-script';
    navigate(`/ai/${route}`, { state: { initialPrompt: creation.prompt } });
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>;
  if (!creation) return <div className="p-10 text-center">Asset not found.</div>;

  const isThumbnail = creation.type?.toLowerCase().includes("thumbnail");

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 pb-10 pt-32 lg:px-10 lg:pt-32">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Improvising the Header with Labels and Copy Button */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={() => navigate("/ai/dashboard")} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <button 
              onClick={handleTogglePublish}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border ${
                creation.publish ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-transparent"
              }`}
            >
              {creation.publish ? <Globe size={14} /> : <Lock size={14} />}
              {creation.publish ? "PUBLIC" : "PRIVATE"}
            </button>

            {/* UNIVERSAL COPY BUTTON */}
            <button 
              onClick={handleUniversalCopy} 
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-all font-bold text-xs"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              {isThumbnail ? "Copy Image Link" : "Copy All"}
            </button>

            <button onClick={handleRegenerate} className="flex items-center gap-2 px-3 py-2 hover:bg-violet-50 text-violet-600 rounded-xl transition-all font-bold text-xs">
              <RefreshCw size={16} /> Regenerate
            </button>
            <button 
                onClick={async () => {
                    if(window.confirm("Permanently delete this asset?")) {
                        const token = await getToken();
                        await axios.delete(`/api/user/delete-creation/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                        navigate("/ai/dashboard");
                        toast.success("Deleted");
                    }
                }} 
                className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-400 rounded-xl transition-all font-bold text-xs"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </header>

        {/* Content Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2.5 bg-violet-600 rounded-xl shadow-lg shadow-violet-200">
                  <Sparkles size={18} className="text-white" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600">
                 {creation.type} result
               </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-10 max-w-4xl">
              {creation.prompt}
            </h1>

            <div className="bg-slate-50/50 rounded-[3rem] p-6 lg:p-12 border border-slate-100">
              {isThumbnail ? (
                <FixedSquareDisplay content={creation.content} />
              ) : (
                <TextDisplay content={creation.content} type={creation.type} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 1024x1024 Fixed Display with Bottom Controls --- */
const FixedSquareDisplay = ({ content }) => {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative w-full max-w-160 aspect-square bg-white rounded-3xl shadow-2xl overflow-auto custom-scrollbar border-[6px] border-white ring-1 ring-slate-200">
        <div 
           className="flex items-center justify-center min-h-full min-w-full bg-[#f1f5f9]"
           style={{ width: `${zoom}%`, height: `${zoom}%` }}
        >
           <img 
            src={content} 
            alt="AI Visual" 
            className="block h-full w-full object-contain"
           />
        </div>
      </div>

      {/* Slider & Download below image */}
      <div className="w-full max-w-md flex items-center gap-5 bg-white px-6 py-4 rounded-4xl border border-slate-200 shadow-lg">
        <ZoomOut size={18} className="text-slate-400" />
        <input 
          type="range" min="30" max="200" value={zoom} 
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
        />
        <ZoomIn size={18} className="text-slate-400" />
        <span className="text-[11px] font-black text-slate-400 w-12">{zoom}%</span>
        <div className="w-px h-6 bg-slate-100 mx-2" />
        <a 
          href={content} 
          download="scriptly-asset.png" 
          className="p-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all shadow-md active:scale-95"
        >
          <Download size={20} />
        </a>
      </div>
    </div>
  );
};

/* --- Refined Text Display with JSON Parsing --- */
const TextDisplay = ({ content, type }) => {
  const isTitles = type?.toLowerCase().includes("title");
  let displayContent = content;

  try {
    const parsed = JSON.parse(content);
    if (isTitles && Array.isArray(parsed)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {parsed.map((t, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 transition-all group flex flex-col justify-between min-h-40">
              <p className="font-bold text-slate-700 leading-relaxed text-lg italic">"{t}"</p>
              <button 
                onClick={() => { navigator.clipboard.writeText(t); toast.success("Copied!"); }}
                className="self-end p-3 bg-slate-50 text-slate-400 hover:bg-violet-600 hover:text-white rounded-xl transition-all"
              >
                <Copy size={18} />
              </button>
            </div>
          ))}
        </div>
      );
    }
    if (typeof parsed === 'object') {
      displayContent = parsed.about || parsed.description || content;
    }
  } catch (e) { }

  return (
    <div className="bg-white p-10 lg:p-16 rounded-[3rem] border border-slate-200 shadow-inner">
      <div className="whitespace-pre-wrap text-xl leading-loose text-slate-600 font-medium italic">
        {displayContent}
      </div>
    </div>
  );
};

export default ViewCreation;