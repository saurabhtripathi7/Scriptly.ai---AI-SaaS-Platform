import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Heart, Loader2, Sparkles, User, MessageSquare, Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  /* ---------------- LOGIC ---------------- */
  const fetchCreations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-published-creations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load community creations");
    } finally {
      setLoading(false);
    }
  };

  const imageLikeToggle = async (id) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Optimistic UI update or re-fetch
        fetchCreations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (userLoaded && user) {
      fetchCreations();
    }
  }, [user, userLoaded]);

  /* ---------------- UI ---------------- */
  if (!userLoaded || (loading && creations.length === 0)) {
    return (
      <div className="h-full flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Community Feed...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-violet-600 w-5 h-5" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community Spotlight</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Explore and get inspired by high-converting visuals created by the Scriptly.AI community.
            </p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-violet-500 border rounded-xl text-sm transition-all w-full md:w-64 outline-none"
            />
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {creations.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
               <MessageSquare className="text-slate-300 w-16 h-16 mb-4" />
               <h3 className="text-lg font-semibold text-slate-900">The feed is quiet...</h3>
               <p className="text-slate-500 text-sm max-w-xs mt-2">
                 Be the first to publish a creation and inspire the community!
               </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {creations.map((creation) => (
                <div
                  key={creation.id || creation._id}
                  className="relative break-inside-avoid bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
                >
                  {/* Image Display */}
                  <img
                    src={creation.content}
                    alt="Community Creation"
                    className="w-full h-auto object-cover display-block"
                  />

                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <p className="text-white text-xs leading-relaxed mb-4 line-clamp-3 italic">
                      "{creation.prompt}"
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-white/20 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center border border-white/30">
                          <User size={12} className="text-white" />
                        </div>
                        <span className="text-white text-[10px] font-bold tracking-wider uppercase">
                          Creator
                        </span>
                      </div>

                      <button 
                        onClick={() => imageLikeToggle(creation.id || creation._id)}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/20 transition-all active:scale-90"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            creation.likes.includes(user?.id)
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }`}
                        />
                        <span className="text-white text-xs font-bold">{creation.likes.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Community;