import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import {
  House,
  Hash,
  Image,
  SquarePen,
  FileText,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/ai/dashboard", label: "Dashboard", Icon: House },
  { to: "/ai/generate-title", label: "Generate Title", Icon: Hash },
  { to: "/ai/generate-description", label: "Generate Description", Icon: FileText },
  { to: "/ai/generate-script", label: "Generate Script", Icon: SquarePen },
  { to: "/ai/generate-thumbnails", label: "Generate Thumbnails", Icon: Image },
  { to: "/ai/community", label: "Community", Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  // 1. Handle Loading State: Prevents "cannot read property of null" errors
  if (!isLoaded || !isSignedIn) {
    return <div className="w-60 bg-white border-r h-full animate-pulse" />;
  }

  return (
    <>
      {/* Mobile Overlay: Closes sidebar when clicking outside on mobile */}
      {sidebar && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 sm:hidden" 
          onClick={() => setSidebar(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-200 flex flex-col justify-between 
          transition-transform duration-300 ease-in-out z-20
          ${sidebar ? "translate-x-0" : "-translate-x-full"} 
          sm:relative sm:translate-x-0`}
      >
        {/* -------- TOP SECTION: Branding & Profile -------- */}
        <div className="flex flex-col w-full py-8">
          <div className="flex flex-col items-center mb-8 px-6">
            <div className="relative group cursor-pointer" onClick={() => openUserProfile()}>
              <img
                src={user.imageUrl}
                alt={user.fullName}
                className="w-16 h-16 rounded-full border-2 border-transparent group-hover:border-purple-500 transition-all shadow-sm"
              />
              <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-100 shadow-sm">
                 <Settings className="w-3 h-3 text-gray-500" />
              </div>
            </div>
            <h2 className="mt-3 font-semibold text-gray-800 tracking-tight">
              {user.fullName}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              Creator Account
            </p>
          </div>

          {/* -------- NAVIGATION -------- */}
          <nav className="px-4 space-y-1">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebar(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-100" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
                }
              >
                <Icon className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* -------- BOTTOM SECTION: User & Plan -------- */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => openUserProfile()}
              className="flex items-center gap-3 text-left hover:opacity-80 transition"
            >
              <img
                src={user.imageUrl}
                alt="Avatar"
                className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
              />
              <div>
                <p className="text-xs font-bold text-gray-800 line-clamp-1">
                  {user.firstName}
                </p>
                <div className="text-[10px] font-semibold">
                  <Protect plan="premium" fallback={<span className="text-gray-400">Free Tier</span>}>
                    <span className="text-purple-600 uppercase">Premium</span>
                  </Protect>
                </div>
              </div>
            </button>

            <button 
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;