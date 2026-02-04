import React from "react";
import { assets } from "../assets/assets";
import { 
  Users, 
  Zap, 
  Layers, 
  Star, 
  Clock, 
  Cpu, 
  Sparkles,
  ArrowRight
} from "lucide-react";

const About = () => {
  const stats = [
    { icon: <Users size={24} />, label: "Creators Empowered", value: "10K+" },
    { icon: <Zap size={24} />, label: "Assets Generated", value: "1M+" },
    { icon: <Layers size={24} />, label: "AI Tools Available", value: "4+" },
    { icon: <Star size={24} />, label: "User Rating", value: "4.9/5" },
  ];

  const features = [
    {
      title: "Workflow Velocity",
      desc: "Go from raw idea to publish-ready content in seconds. We cut the production time by 90%.",
      icon: <Clock size={20} className="text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "All-in-One Suite",
      desc: "Scripts, Titles, Descriptions, and Thumbnails. Stop switching between five different apps.",
      icon: <Layers size={20} className="text-white" />,
      color: "bg-violet-600"
    },
    {
      title: "AI Precision",
      desc: "Our models are fine-tuned for engagement, SEO, and click-through rates across all platforms.",
      icon: <Cpu size={20} className="text-white" />,
      color: "bg-pink-500"
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-40"></div>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-150 h-150 bg-violet-100/40 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider border border-violet-100">
              <Sparkles size={12} /> About Scriptly.AI
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              Reinventing How <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-600">
                Content is Created.
              </span>
            </h1>
            
            <p className="text-lg text-gray-500 leading-relaxed">
              Scriptly.AI is the all-in-one platform for modern creators. We combine cutting-edge AI with intuitive design to help you write, design, and scale your content workflow faster than ever.
            </p>

            {/* Founder Note */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet-600" />
              <p className="text-slate-700 italic font-medium mb-4 relative z-10">
                "Our mission is simple: To give every creator the power of a full production studio, right in their browser."
              </p>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                    <img src={assets.contact_image || "https://ui-avatars.com/api/?name=Saurabh+Tripathi"} alt="Founder" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-900">Saurabh Tripathi</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Founder, Scriptly.AI</p>
                 </div>
              </div>
            </div>
          </div>

          {/* --- NEW IMAGE LAYOUT: BROWSER WINDOW --- */}
          <div className="relative group perspective-1000">
             
             {/* 1. Decorative Glow behind */}
             <div className="absolute -inset-4 bg-linear-to-r from-violet-600/20 to-indigo-600/20 rounded-[2.5rem] blur-2xl -z-10 transition-all duration-500 group-hover:blur-3xl opacity-70" />

             {/* 2. Browser Window Frame */}
             <div className="relative bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(8,112,184,0.1)]">
                
                {/* Browser Header */}
                <div className="h-9 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-400/80" />
                   <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                   <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                   {/* Fake Address Bar */}
                   <div className="ml-4 h-5 w-full max-w-50 bg-gray-200/50 rounded-full hidden sm:block" />
                </div>

                {/* The Image */}
                <img 
                  src={assets.about_image} 
                  alt="Scriptly Dashboard" 
                  className="w-full h-auto object-cover block"
                />

                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent pointer-events-none" />
             </div>

             {/* 3. Floating "Speed" Badge */}
             <div className="absolute -bottom-6 -left-6 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 hidden md:flex items-center gap-3 animate-bounce-slow z-20">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                   <Zap size={20} fill="currentColor" />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Speed</p>
                   <p className="text-sm font-bold text-gray-900">10x Faster</p>
                </div>
             </div>
          </div>

        </div>

        {/* 2. STATS SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className="mx-auto w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 3. CORE VALUES / FEATURES */}
        <div className="space-y-12">
           <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for Growth</h2>
              <p className="text-gray-500">
                Whether you are a YouTuber, blogger, or marketer, our tools are designed to remove bottlenecks and fuel your creativity.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {features.map((item, index) => (
               <div 
                 key={index}
                 className="group p-8 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-violet-100 transition-all duration-300"
               >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-6 shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-6 font-medium">{item.desc}</p>
                  
                  <div className="flex items-center text-sm font-bold text-violet-600 group-hover:gap-2 transition-all cursor-pointer">
                    Start Creating <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default About;