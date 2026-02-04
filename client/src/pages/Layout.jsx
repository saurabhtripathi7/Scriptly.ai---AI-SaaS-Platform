import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X, Wallet, Loader2, Zap } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { SignIn, useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

const Layout = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [sidebar, setSidebar] = useState(false);

  /* --- CENTRALIZED CREDIT STATE --- */
  const [balance, setBalance] = useState({ remaining: 0, plan: "free" });
  const [loadingBalance, setLoadingBalance] = useState(true);

  const fetchBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const token = await getToken();
      const { data } = await axios.get("/api/user/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setBalance({ remaining: data.remaining ?? 0, plan: data.plan || "free" });
      }
    } catch (err) {
      console.error("Layout Balance Error:", err);
    } finally {
      setLoadingBalance(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (user) fetchBalance();
  }, [user, fetchBalance]);

  return user ? (
    <div className="flex flex-col items-start justify-start h-screen overflow-hidden">
      {/* NAVBAR */}
      <nav className="w-full px-4 sm:px-8 h-16 flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <img
            onClick={() => navigate("/")}
            src={assets.logo}
            alt="logo"
            className="cursor-pointer w-32 sm:w-44"
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* CENTRALIZED BALANCE DISPLAY */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
              <Wallet size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-700 uppercase leading-none"> Remaining Credits</span>
              <span className="text-sm font-black text-slate-900 leading-tight">
                {loadingBalance ? <Loader2 size={12} className="animate-spin" /> : 
                 balance.plan === "premium" ? "Unlimited" : balance.remaining}
              </span>
            </div>
            {balance.plan !== "premium" && (
              <button 
                onClick={() => navigate("/#plans")}
                className="ml-2 bg-violet-600 hover:bg-violet-700 text-white p-1.5 rounded-full transition-all"
                title="Upgrade"
              >
                <Zap size={12} fill="currentColor" />
              </button>
            )}
          </div>

          {sidebar ? (
            <X onClick={() => setSidebar(false)} className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer" />
          ) : (
            <Menu onClick={() => setSidebar(true)} className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer" />
          )}
        </div>
      </nav>

      {/* BODY */}
      <div className="flex-1 w-full flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 bg-[#F4F7FB] overflow-y-auto">
          {/* Passing balance update function to tools if needed via context or props */}
          <Outlet context={{ balance, fetchBalance }} />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <SignIn />
    </div>
  );
};

export default Layout;