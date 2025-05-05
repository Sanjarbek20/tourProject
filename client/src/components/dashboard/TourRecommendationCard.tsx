import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { CalendarIcon, HeartIcon, MapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tour } from "@shared/schema";
import { useWishlist } from "@/context/WishlistContext";

// Extended Tour interface for dashboard display
interface DashboardTour extends Tour {
  destinations?: string[];
}

interface TourRecommendationCardProps {
  tour: DashboardTour;
}

export function TourRecommendationCard({ tour }: TourRecommendationCardProps) {
  const { t } = useTranslation();
  const { addTourToWishlist, removeTourFromWishlist, isTourInWishlist } = useWishlist();

  const toggleWishlist = () => {
    if (isTourInWishlist(tour.id)) {
      removeTourFromWishlist(tour.id);
    } else {
      addTourToWishlist(tour);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        <img 
          src={tour.image} 
          alt={tour.title} 
          className="object-cover w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
          }}
        />
        <div className="absolute top-2 right-2">
          <Button 
            variant="outline" 
            size="icon" 
            className={`h-8 w-8 rounded-full bg-white/80 ${isTourInWishlist(tour.id) ? 'text-red-500' : ''}`} 
            onClick={toggleWishlist}
          >
            <HeartIcon className={`h-4 w-4 ${isTourInWishlist(tour.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <Badge className="absolute bottom-2 left-2 bg-white/80 text-black">
          {tour.price}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-medium">{tour.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mt-1 mb-2">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {tour.duration}
          {tour.destinations && tour.destinations.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <MapIcon className="h-4 w-4 mr-1" />
              {Array.isArray(tour.destinations) 
                ? tour.destinations.join(", ") 
                : (tour.cities || '')}
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tour.description}
        </p>
        <div className="flex justify-between mt-2">
          {tour.category && <Badge variant="outline">{tour.category}</Badge>}
          <Button size="sm" asChild>
            <Link to={`/tours/${tour.id}`}>
              {t("userDashboard.viewTour")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}