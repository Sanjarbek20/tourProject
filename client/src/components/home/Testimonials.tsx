import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { type Testimonial } from "@shared/schema";
import TestimonialCard from "@/components/testimonial/TestimonialCard";
import { Skeleton } from "@/components/ui/skeleton";

const Testimonials = () => {
  const { t } = useTranslation();
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  // Create placeholder items for loading state
  const placeholders = Array(3).fill(0).map((_, index) => (
    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex text-[#FF9800] mb-4">
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-24 w-full mb-6" />
      <div className="flex items-center">
        <Skeleton className="w-12 h-12 rounded-full mr-4" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  ));

  return (
    <section id="testimonials" className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-neutral-800 mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-lg text-neutral-800/70 max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading
              ? placeholders
              : testimonials?.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="#"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
            >
              {t("testimonials.readMore")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
