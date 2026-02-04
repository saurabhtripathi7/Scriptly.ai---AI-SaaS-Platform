import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-gray-500 mt-20">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-6">
        
        {/* Logo Section */}
        <div className="md:max-w-96">
          <img 
            className="h-9 cursor-pointer" 
            src={assets.logo} 
            alt="logo" 
            onClick={() => navigate("/")} 
          />
          <p className="mt-6 text-sm leading-relaxed">
            Experience the power of AI with Scriptly.AI <br /> Transform your
            content creation with our suite of premium AI tools. Write articles,
            generate images, and enhance your workflow.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex-1 flex items-start md:justify-end gap-20">
          <div>
            <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
            <ul className="text-sm space-y-3">
              <li 
                onClick={() => navigate("/")} 
                className="cursor-pointer hover:text-violet-600 transition-colors"
              >
                Home
              </li>
              <li 
                onClick={() => navigate("/about")} 
                className="cursor-pointer hover:text-violet-600 transition-colors"
              >
                About us
              </li>
              <li 
                onClick={() => navigate("/contact")} 
                className="cursor-pointer hover:text-violet-600 transition-colors"
              >
                Contact us
              </li>
              {/* Replaced Privacy Policy with Community */}
              <li 
                onClick={() => navigate("/ai/community")} 
                className="cursor-pointer hover:text-violet-600 transition-colors"
              >
                Community
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-5">
              Subscribe to our newsletter
            </h2>
            <div className="text-sm space-y-2">
              <p>
                The latest news, articles, and resources, sent to your inbox
                weekly.
              </p>
              <div className="flex items-center gap-2 pt-4">
                <input
                  className="border border-gray-500/30 placeholder-gray-500 focus:ring-2 ring-indigo-600 outline-none w-full max-w-64 h-9 rounded px-2"
                  type="email"
                  placeholder="Enter your email"
                />
                <button className="bg-violet-600 hover:bg-violet-700 transition-colors w-24 h-9 text-white rounded cursor-pointer font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="pt-4 text-center text-xs md:text-sm pb-5">
        Copyright 2026 ©{" "}
        <a 
          target="_blank" 
          rel="noopener noreferrer"
          href="https://www.linkedin.com/in/saurabhtripathicr7/"
          className="hover:text-violet-600 transition-colors font-medium"
        >
          Saurabh Tripathi
        </a>
        . All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;