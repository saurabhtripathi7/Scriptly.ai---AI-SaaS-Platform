// Dashboard.jsx - Polished UI + Load More Activity
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Gem, History, LayoutGrid, Loader2, ArrowUpRight, 
  CreditCard, Zap, Type, ImageIcon, FileText 
} from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  /* ---------------- STATE ---------------- */
  const [creations, setCreations] = useState([]);
  const [totalCount, setTotalCount] = useState(0); 
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [usage, setUsage] = useState({ used: 0, limit: 0, ready: false });

  /* ---------------- FETCH DASHBOARD (Initial & Refresh) ---------------- */
  const fetchDashboard = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const token = await getToken();

      // We always fetch page 0 for a fresh state or "real-time" update
      const { data } = await axios.get("/api/user/get-dashboard-overview?page=0", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCreations(data.creations || []);
        setTotalCount(data.totalCreations || 0); 
        setUsage({ ...data.usage, ready: true });
        setPage(0); // Reset page counter
        
        const confirmedPlan = data.plan || user?.publicMetadata?.plan || "free";
        setPlan(confirmedPlan);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  /* ---------------- LOAD MORE LOGIC (Restored) ---------------- */
  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const token = await getToken();
      
      const { data } = await axios.get(`/api/user/get-dashboard-overview?page=${nextPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.creations.length > 0) {
        setCreations(prev => [...prev, ...data.creations]);
        setPage(nextPage);
      }
    } catch (error) {
      toast.error("Could not load more items");
    } finally {
      setLoadingMore(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (isLoaded) {
      fetchDashboard();
      
      // Real-time: Refresh when user returns to this tab
      const handleFocus = () => fetchDashboard(true);
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [isLoaded, fetchDashboard]);

  const progress =
    usage.ready && usage.limit > 0
      ? Math.min((usage.used / usage.limit) * 100, 100)
      : 0;

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
    </div>
  );

  return (
    <div className="h-full bg-white overflow-y-auto custom-scrollbar p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Workspace Overview</h1>
            <p className="text-slate-500 mt-1">Manage your AI-generated assets and subscription.</p>
          </div>
          <button
            onClick={() => navigate("/ai/generate-script")}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-200"
          >
            <Zap size={18} /> New Creation
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Creations" value={totalCount} icon={<History className="text-blue-600" size={20} />} iconBg="bg-blue-50" description="Lifetime assets" />
          <StatCard label="Active Plan" value={plan === "premium" ? "Premium" : "Free Plan"} icon={<Gem className="text-violet-600" size={20} />} iconBg="bg-violet-50" description="Plan status" />
          <StatCard label="Usage Credits" value={plan === "premium" ? "∞" : `${usage.used}/${usage.limit}`} icon={<CreditCard className="text-emerald-600" size={20} />} iconBg="bg-emerald-50" description="Monthly usage" />
        </div>

        {/* Recent Activity Section */}
        <section className="space-y-6 pb-10">
          <div className="flex items-center gap-2">
            <LayoutGrid size={20} className="text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {creations.map((item) => (
              <CreationRow key={item.id} item={item} navigate={navigate} />
            ))}
          </div>

          {/* LOAD MORE BUTTON LOGIC */}
          {creations.length < totalCount && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={loadMore} 
                disabled={loadingMore}
                className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="animate-spin" size={18} /> : "Load More Activity"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/* ---------------- INTERNAL COMPONENTS ---------------- */

const StatCard = ({ label, value, icon, iconBg, description }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>{icon}</div>
    <p className="text-slate-500 text-xs uppercase font-medium">{label}</p>
    <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
    <p className="text-xs text-slate-400 mt-4">{description}</p>
  </div>
);

const CreationRow = ({ item, navigate }) => {
  const getBadgeStyle = (type) => {
    const normalized = type?.toLowerCase().trim() || "";
    if (normalized.includes('script')) return { label: 'Script Generation', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (normalized.includes('thumbnail')) return { label: 'Thumbnail Design', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (normalized.includes('title')) return { label: 'Title Ideation', color: 'text-violet-600', bg: 'bg-violet-50' };
    if (normalized.includes('description')) return { label: 'Description Copy', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    return { label: 'AI Creation', color: 'text-slate-600', bg: 'bg-slate-50' };
  };

  const style = getBadgeStyle(item.type);

  return (
    <div className="group bg-white border border-slate-200 p-4 rounded-2xl hover:border-violet-200 transition-all flex items-center justify-between">
      <div className="flex items-center gap-4">
        <TypeBadge type={item.type} />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 line-clamp-1">{item.prompt}</h4>
            <span className={`px-2 py-0.5 rounded-full ${style.bg} ${style.color} text-[10px] font-black uppercase tracking-wider border`}>{style.label}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "Recent"}</p>
        </div>
      </div>
      <button onClick={() => navigate(`/view/${item.id}`)} className="p-2.5 bg-slate-50 group-hover:bg-violet-600 group-hover:text-white text-slate-400 rounded-xl transition-all"><ArrowUpRight size={18} /></button>
    </div>
  );
};

const TypeBadge = ({ type }) => {
  const normalized = type?.toLowerCase() || "";
  const config = normalized.includes('thumbnail') ? { icon: <ImageIcon size={16}/>, color: "text-amber-600", bg: "bg-amber-50" } : 
                 normalized.includes('title') ? { icon: <Type size={16}/>, color: "text-violet-600", bg: "bg-violet-50" } : 
                 { icon: <FileText size={16}/>, color: "text-blue-600", bg: "bg-blue-50" };
  return <div className={`${config.bg} ${config.color} p-3 rounded-xl shrink-0`}>{config.icon}</div>;
};

export default Dashboard;