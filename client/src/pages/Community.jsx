import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState, useMemo } from "react";
import { 
  Heart, Loader2, Sparkles, User, MessageSquare, 
  Search, FileText, Type, Copy, ExternalLink 
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const navigate = useNavigate();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  /* ---------------- FETCH DATA ---------------- */
  const fetchCreations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-published-creations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setCreations(data.creations);
    } catch (error) {
      toast.error("Failed to load community feed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEARCH LOGIC ---------------- */
  const filteredCreations = useMemo(() => {
    return creations.filter((item) =>
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [creations, searchQuery]);

  /* ---------------- LIKE LOGIC ---------------- */
  const imageLikeToggle = async (id) => {
    if (!user) return toast.error("Please sign in to like creations");
    try {
      const token = await getToken();
      const { data } = await axios.post("/api/user/toggle-like-creation", { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setCreations(prev => prev.map(item => 
          (item.id === id) ? { ...item, likes: data.likes } : item
        ));
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    if (userLoaded && user) fetchCreations();
  }, [user, userLoaded]);

  if (!userLoaded || (loading && creations.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Syncing Community Feed...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/50 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Sparkles className="text-violet-600 w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community Spotlight</h1>
            </div>
            <p className="text-slate-500 text-sm">Explore and repurpose high-performing AI assets.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by prompt or type..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-violet-500 border rounded-2xl text-sm transition-all outline-none shadow-inner"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {filteredCreations.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white p-10">
               <div className="bg-slate-50 p-6 rounded-full mb-4">
                 <MessageSquare className="text-slate-300 w-12 h-12" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
               <p className="text-slate-500 text-sm max-w-xs mt-2">Try adjusting your search terms or exploring different categories.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {filteredCreations.map((creation) => (
                <CommunityCard 
                  key={creation.id} 
                  creation={creation} 
                  userId={user?.id} 
                  onLike={() => imageLikeToggle(creation.id)}
                  onView={() => navigate(`/view/${creation.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* --- Refined Card Component --- */
const CommunityCard = ({ creation, userId, onLike, onView }) => {
  const isThumbnail = creation.type?.toLowerCase().includes('thumbnail') || creation.content.startsWith('data:image');
  
  const handleCopyPrompt = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(creation.prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const renderContent = () => {
    try {
      const parsed = JSON.parse(creation.content);
      if (Array.isArray(parsed)) {
        return (
          <ul className="space-y-3">
            {parsed.slice(0, 3).map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 text-[13px] leading-snug">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                <span className="line-clamp-2">{t}</span>
              </li>
            ))}
          </ul>
        );
      }
      const text = parsed.about || parsed.description || parsed.script || creation.content;
      return <p className="text-slate-600 text-[13px] leading-relaxed italic line-clamp-6">{text}</p>;
    } catch {
      return <p className="text-slate-600 text-[13px] leading-relaxed italic line-clamp-6">{creation.content}</p>;
    }
  };

  return (
    <div className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)] bg-white rounded-4xl border border-slate-200 overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col shadow-sm">
      
      {/* Top Media/Text Section */}
      <div className="relative flex-1 cursor-pointer" onClick={onView}>
        {isThumbnail ? (
          <div className="aspect-4/3 bg-slate-100 overflow-hidden">
            <img 
              src={creation.content} 
              alt="AI Creation" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          </div>
        ) : (
          <div className="p-7 bg-linear-to-br from-violet-50/80 to-white min-h-55">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-violet-600">
                {creation.type === 'script' ? <FileText size={16} /> : <Type size={16} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{creation.type}</span>
              </div>
              <ExternalLink size={14} className="text-slate-300 group-hover:text-violet-400 transition-colors" />
            </div>
            {renderContent()}
          </div>
        )}
        
        {/* Hover Overlay for Prompt Copy */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
             <button 
               onClick={handleCopyPrompt}
               className="bg-white text-slate-900 p-3 rounded-2xl hover:bg-violet-600 hover:text-white transition-all shadow-xl flex items-center gap-2 font-bold text-xs"
             >
               <Copy size={16} /> Copy Prompt
             </button>
        </div>
      </div>

      {/* Persistent Info Footer */}
      <div className="p-6 bg-white border-t border-slate-50 mt-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-slate-400 text-[9px] uppercase font-black tracking-[0.15em]">Original Prompt</p>
          </div>
          <p className="text-slate-900 text-xs font-bold line-clamp-2 leading-relaxed italic">
            "{creation.prompt}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-violet-500 to-fuchsia-500 p-[1.5px]">
               <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                 <User size={14} className="text-violet-500" />
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 text-[10px] font-bold leading-none">Creator</span>
              <span className="text-slate-400 text-[8px] font-bold uppercase tracking-tighter">Verified User</span>
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border transition-all active:scale-90 shadow-xs ${
              creation.likes?.includes(userId) 
              ? "bg-red-50 border-red-100 text-red-500" 
              : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200"
            }`}
          >
            <Heart size={14} className={creation.likes?.includes(userId) ? "fill-red-500" : ""} />
            <span className="text-[11px] font-black">{creation.likes?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;