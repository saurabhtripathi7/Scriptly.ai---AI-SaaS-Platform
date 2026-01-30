import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";

import { AiToolsData } from "../assets/assets";

const AiTools = () => {
  // Router navigation
  const navigate = useNavigate();

  // Auth state
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  // Tool click handler
  const handleToolClick = (path) => {
    if (!isLoaded) return;

    if (!user) {
      openSignIn(); // trigger auth instead of silent block
      return;
    }

    navigate(path);
  };

  return (
    <section className="px-4 sm:px-20 xl:px-32 my-24">
      {/* Section header */}
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Powerful AI Tools
        </h2>
        <p className="mt-2 text-gray-500 max-w-lg mx-auto">
          Everything you need to create, enhance, and optimize your content with
          cutting-edge AI technology.
        </p>
      </div>

      {/* Tools grid */}
      <div className="flex flex-wrap justify-center mt-12">
        {AiToolsData.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleToolClick(tool.path)}
            className={`
              p-8 m-4 max-w-xs rounded-lg
              bg-[#FDFDFE] border border-gray-100
              shadow-lg transition-all duration-300
              hover:-translate-y-1
              ${
                user
                  ? "cursor-pointer"
                  : "opacity-70 cursor-pointer hover:opacity-90"
              }
            `}
          >
            {/* Tool icon */}
            <tool.Icon
              className="w-12 h-12 p-3 text-white rounded-xl"
              style={{
                background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`,
              }}
            />

            <h3 className="mt-6 mb-3 text-lg font-semibold">
              {tool.title}
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed">
              {tool.description}
            </p>

            {/* Locked hint */}
            {!user && (
              <span className="mt-3 block text-xs text-primary">
                Sign in to use
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AiTools;
