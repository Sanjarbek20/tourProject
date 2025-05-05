import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import DestinationCard from "@/components/destination/DestinationCard";
import { type Destination } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { MoveRight } from "lucide-react";

const FeaturedDestinations = () => {
  const { t } = useTranslation();
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  // Create placeholder items for loading state
  const placeholders = Array(3).fill(0).map((_, index) => (
    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md">
      <Skeleton className="h-72 w-full" />
    </div>
  ));

  return (
    <section id="destinations" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-800 mb-4">
              {t("destinations.title")}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              {t("destinations.subtitle")}
            </p>
          </div>
          <Link 
            href="/destinations" 
            className="inline-flex items-center gap-2 text-[#FF9800] font-medium hover:underline"
          >
            {t("destinations.viewAll")}
            <MoveRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading 
            ? placeholders
            : destinations?.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
        </div>

        <div className="text-center mt-16">
          <Link 
            href="/destinations" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF9800] text-white font-medium rounded-full hover:bg-[#FF9800]/90 transition-all duration-300"
          >
            {t("destinations.viewAll")}
            <MoveRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
