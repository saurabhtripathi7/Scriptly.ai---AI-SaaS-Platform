import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Hero = () => {
  // Used for CTA navigation
  const navigate = useNavigate();

  return (
    <section
      className="
        relative min-h-screen w-full
        bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat
        flex flex-col justify-center
        px-4 sm:px-20 xl:px-32
      "
    >
      {/* Heading + description */}
      <div className="text-center mb-8">
        <h1 className="mx-auto font-semibold leading-[1.2]
          text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl"
        >
          Create high-quality content <br />
          with <span className="text-primary">AI tools</span>
        </h1>

        <p className="mt-4 mx-auto text-gray-600
          max-w-xs sm:max-w-lg 2xl:max-w-xl
          max-sm:text-xs"
        >
          An all-in-one AI platform to write, design, and scale your content
          workflow faster than ever.
        </p>
      </div>

      {/* Primary actions */}
      <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs">
        <button
          onClick={() => navigate("/ai")}
          className="
            bg-primary text-white
            px-10 py-3 rounded-lg
            transition hover:scale-102 active:scale-95
          "
        >
          Start creating
        </button>

        <button
          className="
            bg-white border border-gray-300
            px-10 py-3 rounded-lg
            transition hover:scale-102 active:scale-95
          "
        >
          Watch demo
        </button>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600">
        <img src={assets.user_group} alt="users" className="h-8" />
        Trusted by 10k+ creators & teams
      </div>

      {/* Brand marquee */}
      <div className="overflow-hidden mt-16 w-full flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {/* Original set */}
            <img src={assets.facebook} alt="Facebook" className="h-8" />
            <img src={assets.slack} alt="Slack" className="h-8" />
            <img src={assets.framer} alt="Framer" className="h-8" />
            <img src={assets.netflix} alt="Netflix" className="h-8" />
            <img src={assets.google} alt="Google" className="h-8" />
            <img src={assets.linkedin} alt="LinkedIn" className="h-8" />

            {/* Duplicate for seamless animation */}
            <img src={assets.facebook} alt="Facebook" className="h-8" />
            <img src={assets.slack} alt="Slack" className="h-8" />
            <img src={assets.framer} alt="Framer" className="h-8" />
            <img src={assets.netflix} alt="Netflix" className="h-8" />
            <img src={assets.google} alt="Google" className="h-8" />
            <img src={assets.linkedin} alt="LinkedIn" className="h-8" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
