import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import TourCard from "@/components/tour/TourCard";
import { type Tour } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { MoveRight } from "lucide-react";

const TourPackages = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });

  const filteredTours = activeCategory === "all"
    ? tours
    : tours?.filter(tour => tour.category.toLowerCase() === activeCategory);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Create placeholder items for loading state
  const placeholders = Array(3).fill(0).map((_, index) => (
    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md flex flex-col">
      <Skeleton className="h-56 w-full" />
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-1/6" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-1/6" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  ));

  return (
    <section id="tours" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-800 mb-4">
              {t("tours.title")}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              {t("tours.subtitle")}
            </p>
          </div>
          <Link 
            href="/tours" 
            className="inline-flex items-center gap-2 text-[#FF9800] font-medium hover:underline"
          >
            {t("tours.viewAll")}
            <MoveRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12 bg-white p-4 rounded-full shadow-sm max-w-3xl mx-auto">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === "all"
                ? "bg-[#FF9800] text-white shadow-md"
                : "bg-white text-neutral-600 hover:bg-gray-100"
            }`}
            onClick={() => handleCategoryChange("all")}
          >
            {t("tours.filters.all")}
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === "cultural"
                ? "bg-[#FF9800] text-white shadow-md"
                : "bg-white text-neutral-600 hover:bg-gray-100"
            }`}
            onClick={() => handleCategoryChange("cultural")}
          >
            {t("tours.filters.cultural")}
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === "historical"
                ? "bg-[#FF9800] text-white shadow-md"
                : "bg-white text-neutral-600 hover:bg-gray-100"
            }`}
            onClick={() => handleCategoryChange("historical")}
          >
            {t("tours.filters.historical")}
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === "adventure"
                ? "bg-[#FF9800] text-white shadow-md"
                : "bg-white text-neutral-600 hover:bg-gray-100"
            }`}
            onClick={() => handleCategoryChange("adventure")}
          >
            {t("tours.filters.adventure")}
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === "culinary"
                ? "bg-[#FF9800] text-white shadow-md"
                : "bg-white text-neutral-600 hover:bg-gray-100"
            }`}
            onClick={() => handleCategoryChange("culinary")}
          >
            {t("tours.filters.culinary")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? placeholders
            : filteredTours?.map((tour) => <TourCard key={tour.id} tour={tour} />)}
        </div>

        <div className="text-center mt-16">
          <Link 
            href="/tours" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF9800] text-white font-medium rounded-full hover:bg-[#FF9800]/90 transition-all duration-300"
          >
            {t("tours.viewAll")}
            <MoveRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TourPackages;
