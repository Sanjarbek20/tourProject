import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { type Destination } from "@shared/schema";
import DestinationCard from "@/components/destination/DestinationCard";
import { Skeleton } from "@/components/ui/skeleton";
import Newsletter from "@/components/home/Newsletter";

const AllDestinations = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  const filteredDestinations = destinations
    ?.filter(destination => 
      searchTerm === "" || 
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Create placeholder items for loading state
  const placeholders = Array(6).fill(0).map((_, index) => (
    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
      <Skeleton className="h-64 w-full" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  ));

  return (
    <>
      <div className="pt-20 pb-16">
        <div className="bg-neutral-100 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
              {t("destinations.title")}
            </h1>
            <p className="text-xl text-neutral-800/70 text-center max-w-2xl mx-auto mb-8">
              {t("destinations.subtitle")}
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-10 border border-neutral-100 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {placeholders}
            </div>
          ) : filteredDestinations && filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-heading font-bold mb-4">No Destinations Found</h3>
              <p className="text-neutral-800/70 mb-6">
                We couldn't find any destinations matching your search. Please try a different search term.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
              >
                Show All Destinations
              </button>
            </div>
          )}
        </div>
      </div>
      <Newsletter />
    </>
  );
};

export default AllDestinations;
