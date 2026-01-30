import { assets } from "../assets/assets";

const testimonialData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    name: "John Doe",
    title: "YouTube Creator",
    content:
      "The AI script generator completely changed my workflow. I can go from idea to publish-ready content in minutes.",
    rating: 5,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    name: "Jane Smith",
    title: "Instagram Content Creator",
    content:
      "Titles and descriptions are spot on. The platform understands what works on social media.",
    rating: 4,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    name: "David Lee",
    title: "Short-form Video Creator",
    content:
      "Thumbnail generation alone is worth it. Clean, fast, and optimized for clicks.",
    rating: 5,
  },
];

const Testimonial = () => {
  return (
    <section className="px-4 sm:px-20 xl:px-32 py-24">
      {/* Section header */}
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Loved by Creators
        </h2>
        <p className="mt-2 text-gray-500 max-w-lg mx-auto">
          See how creators use AI to speed up content creation and publishing.
        </p>
      </div>

      {/* Testimonials */}
      <div className="flex flex-wrap justify-center mt-12">
        {testimonialData.map((testimonial) => (
          <div
            key={testimonial.id}
            className="
              p-8 m-4 max-w-xs rounded-lg
              bg-[#FDFDFE] border border-gray-100
              shadow-lg transition duration-300
              hover:-translate-y-1
            "
          >
            {/* Rating */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <img
                  key={i}
                  src={
                    i < testimonial.rating
                      ? assets.star_icon
                      : assets.star_dull_icon
                  }
                  alt="star"
                  className="w-4 h-4"
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-gray-500 text-sm my-5">
              “{testimonial.content}”
            </p>

            <hr className="mb-5 border-gray-300" />

            {/* Author */}
            <div className="flex items-center gap-4">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="text-sm">
                <h3 className="font-medium text-gray-700">
                  {testimonial.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {testimonial.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonial;
