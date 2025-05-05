import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { type Tour } from "@shared/schema";
import TourCard from "@/components/tour/TourCard";
import { Skeleton } from "@/components/ui/skeleton";
import Newsletter from "@/components/home/Newsletter";

const AllTours = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });

  const filteredTours = tours
    ?.filter(tour => 
      (activeCategory === "all" || tour.category.toLowerCase() === activeCategory) &&
      (searchTerm === "" || tour.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Create placeholder items for loading state
  const placeholders = Array(6).fill(0).map((_, index) => (
    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
      <Skeleton className="h-64 w-full" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/6" />
        </div>
        <Skeleton className="h-20 w-full mb-4" />
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  ));

  return (
    <>
      <div className="pt-20 pb-16">
        <div className="bg-neutral-100 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
              {t("tours.title")}
            </h1>
            <p className="text-xl text-neutral-800/70 text-center max-w-2xl mx-auto mb-8">
              {t("tours.subtitle")}
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="Search tours..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full p-3 border border-neutral-100 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="md:w-1/4">
                  <select
                    className="w-full p-3 border border-neutral-100 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    value={activeCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="all">{t("tours.filters.all")}</option>
                    <option value="cultural">{t("tours.filters.cultural")}</option>
                    <option value="historical">{t("tours.filters.historical")}</option>
                    <option value="adventure">{t("tours.filters.adventure")}</option>
                    <option value="culinary">{t("tours.filters.culinary")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {placeholders}
            </div>
          ) : filteredTours && filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-heading font-bold mb-4">No Tours Found</h3>
              <p className="text-neutral-800/70 mb-6">
                We couldn't find any tours matching your criteria. Please try a different search or category.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchTerm("");
                }}
                className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Newsletter />
    </>
  );
};

export default AllTours;
