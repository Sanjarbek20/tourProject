import { type Testimonial } from "@shared/schema";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  // Create an array of stars based on the rating
  const stars = Array(testimonial.rating).fill(0).map((_, i) => (
    <i key={i} className="fas fa-star"></i>
  ));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex text-[#FF9800] mb-4">
        {stars}
      </div>
      <p className="text-neutral-800/70 mb-6 italic">{testimonial.text}</p>
      <div className="flex items-center">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-bold">{testimonial.name}</h4>
          <p className="text-neutral-800/70">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
