import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Gem, 
  Sparkles, 
  History, 
  LayoutGrid, 
  Loader2, 
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Zap,
  Type,
  ImageIcon,
  FileText
} from "lucide-react";
import { Protect, useAuth, useUser } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns"; // Recommended for time awareness

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  /* ---------------- STATE ---------------- */
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    used: 0,
    limit: 0,
    isLoaded: false
  });

  /* ---------------- HANDLERS ---------------- */
  const getDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Fetch both creations and usage stats for honesty
      const { data } = await axios.get("/api/user/get-dashboard-overview", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCreations(data.creations);
        setUserStats({
          used: data.usage.used,
          limit: data.usage.limit,
          isLoaded: true
        });
      }
    } catch (error) {
      // If backend isn't ready for stats yet, we show "Coming Soon" instead of faking it
      setUserStats({ used: 0, limit: 0, isLoaded: false });
      toast.error("Limited dashboard data available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="h-full bg-white overflow-y-auto custom-scrollbar p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header: Fixed Navigation */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Workspace Overview
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your AI-generated assets and subscription.
            </p>
          </div>
          <button 
            onClick={() => navigate('/ai/generate-script')} // ✅ Fixed: SPA Navigation
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-200"
          >
            <Zap size={18} className="fill-current" />
            New Creation
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Creations"
            value={creations.length}
            icon={<History className="text-blue-600" size={20} />}
            iconBg="bg-blue-50"
            description="Lifetime assets"
          />

          <StatCard 
            label="Active Plan"
            value={
              <Protect plan="premium" fallback="Free Plan">
                Premium
              </Protect>
            }
            icon={<Gem className="text-violet-600" size={20} />}
            iconBg="bg-violet-50"
            description={
              <Protect plan="premium" fallback="Standard Features">
                Pro Tools Unlocked
              </Protect>
            }
          />

          {/* ✅ FIXED: Honest Credits Stat */}
          <StatCard 
            label="Usage Credits"
            value={userStats.isLoaded ? `${userStats.used} / ${userStats.limit}` : "—"}
            icon={<CreditCard className="text-emerald-600" size={20} />}
            iconBg="bg-emerald-50"
            description={userStats.isLoaded ? "Monthly consumption" : "Tracking coming soon"}
            progress={userStats.isLoaded ? (userStats.used / userStats.limit) * 100 : 0}
          />
        </div>

        {/* Recent Creations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid size={20} className="text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            </div>
            {/* ✅ FIXED: Wired "View All" */}
            <button 
              onClick={() => navigate('/ai/community')} // or a specific '/my-creations' route
              className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 group"
            >
              View Full Library 
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center border border-slate-100 rounded-3xl">
              <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-2" />
            </div>
          ) : creations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {creations.map((item) => (
                <div key={item.id} className="group relative bg-white border border-slate-200 p-4 rounded-2xl hover:border-violet-200 transition-all shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* ✅ FIXED: Creation Type Badges */}
                    <TypeBadge type={item.type} />
                    
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{item.prompt || item.title}</h4>
                      {/* ✅ FIXED: Time Awareness */}
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <ClockIcon size={12} />
                        {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "Recent"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ✅ FIXED: Differentiate Pro content */}
                    {item.type === 'thumbnail' && (
                      <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-[10px] font-black uppercase border border-amber-100 mr-2">
                         Pro
                      </span>
                    )}
                    {/* Action button passed to parent wrapper */}
                    <button onClick={() => navigate(`/view/${item.id}`)} className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-slate-400 text-sm italic">No creations found. Start building!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/* ---------------- UI SUB-COMPONENTS ---------------- */

const TypeBadge = ({ type }) => {
  const configs = {
    script: { icon: <FileText size={16} />, color: "text-blue-600", bg: "bg-blue-50", label: "Script" },
    thumbnail: { icon: <ImageIcon size={16} />, color: "text-amber-600", bg: "bg-amber-50", label: "Thumbnail" },
    title: { icon: <Type size={16} />, color: "text-violet-600", bg: "bg-violet-50", label: "Title" },
    description: { icon: <AlignLeft size={16} />, color: "text-emerald-600", bg: "bg-emerald-50", label: "Desc" },
  };

  const config = configs[type] || configs.script;

  return (
    <div className={`${config.bg} ${config.color} p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm`} title={config.label}>
      {config.icon}
    </div>
  );
};

const StatCard = ({ label, value, icon, iconBg, description, progress }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
    </div>
    
    {progress !== undefined && progress > 0 ? (
      <div className="mt-4 space-y-2">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-violet-600 h-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 font-medium">{description}</p>
      </div>
    ) : (
      <p className="text-[10px] text-slate-400 font-medium mt-4 italic">{description}</p>
    )}
  </div>
);

const ClockIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const AlignLeft = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
);

export default Dashboard;