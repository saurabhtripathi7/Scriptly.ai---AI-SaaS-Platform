import React from "react";
import { 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Globe,
  ArrowRight
} from "lucide-react";

const Contact = () => {
  const contactInfo = [
    { 
      title: "Our Office", 
      content: "F-391, Gomti Nagar,\nLucknow (226010) India 🇮🇳",
      icon: <MapPin className="text-white" size={20} />,
      color: "bg-blue-500",
      action: "Visit Us",
      link: "#"
    },
    { 
      title: "Direct Reach", 
      content: "+91 95XXX-XXX97\nsaurabh7sde@gmail.com",
      icon: <Mail className="text-white" size={20} />,
      color: "bg-violet-600",
      action: "Email Now",
      link: "mailto:saurabh7sde@gmail.com"
    },
    {
      title: "Social Presence",
      content: "Connect with Saurabh across\nthese platforms.",
      icon: <Globe className="text-white" size={20} />,
      color: "bg-pink-500",
      action: "View Portfolio",
      link: "https://saurabhtripathi-sde.me",
      isSocial: true
    }
  ];

  return (
    <section className="relative py-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto overflow-hidden">
      
      {/* 1. BACKGROUND DECORATION (Fixes the "Empty" feel) */}
      {/* Subtle Dot Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      
      {/* Soft Purple Glow in the Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-100/40 blur-[120px] rounded-full -z-10" />

      {/* HEADER */}
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Touch</span>
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Have questions or want to collaborate? We are here to help you scale your content workflow.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {contactInfo.map((item, index) => (
          <div 
            key={index} 
            className="group relative flex flex-col p-8 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-violet-100"
          >
            {/* Hover Gradient Border Effect */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon Box */}
            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-6 shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
              {item.icon}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {item.title}
            </h3>
            <p className="text-gray-500 whitespace-pre-line mb-8 leading-relaxed flex-grow font-medium">
              {item.content}
            </p>

            {/* Footer Action */}
            {item.isSocial ? (
              <div className="flex gap-4 mt-auto">
                <SocialLink href="https://github.com/saurabhtripathi7" icon={<Github size={18} />} />
                <SocialLink href="https://www.linkedin.com/in/saurabhtripathicr7/" icon={<Linkedin size={18} />} />
                <SocialLink href="https://saurabhtripathi-sde.me" icon={<Globe size={18} />} />
              </div>
            ) : (
              <a 
                href={item.link}
                className="inline-flex items-center text-sm font-bold text-violet-600 hover:text-violet-700 mt-auto transition-colors"
              >
                {item.action} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const SocialLink = ({ href, icon }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="p-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors border border-gray-100 hover:border-violet-100"
  >
    {icon}
  </a>
);

export default Contact;