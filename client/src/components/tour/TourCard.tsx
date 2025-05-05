import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { type Tour } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Clock, HeartIcon, Map, MoveRight, Star, Users } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

interface TourCardProps {
  tour: Tour;
}

// High-quality tour images from Uzbekistan and Central Asia
const tourImages = {
  "Silk Road Expedition": "https://i0.wp.com/reconasia.csis.org/wp-content/uploads/2017/11/trekking_5500_miles_across_the_silk_road.png?fit=1200%2C900&ssl=1",
  // (Exploration through caravan routes and deserts)

  "Uzbekistan Heritage Tour": "https://uzbek-travel.com/images/cms/data/culture.jpg",
  // (Cultural heritage of Uzbekistan - historical cities and madrasahs)

  "Ancient Cities Explorer": "https://wander-lush.org/wp-content/uploads/2020/07/Uzbekistan-culture-guide-Registan-Samarkand.jpg",
  // (Ancient cities like Bukhara and Samarkand)
"Cultural Immersion": "https://wander-lush.org/wp-content/uploads/2020/07/Uzbekistan-culture-guide-Registan-Samarkand.jpg",
  "Desert Adventure": "https://kalpak-travel.com/wp-content/uploads/2022/11/ayaz-kala-karakalpakstan-uzbekistan.jpg",
  "Culinary Journey": "https://uzbekistan.travel/storage/app/media/nargiza/cropped-images/1-0-0-0-0-1583311273.png",
  "Sufi Heritage Tour": "https://www.advantour.com/img/uzbekistan/tours/zoroastrian-buddhist-tour/guri-emir.jpg",
  "Tashkent to Termez Expedition":"https://mediaim.expedia.com/destination/1/a5802867f568358fff376863138b3fdf.jpg?impolicy=fcrop&w=450&h=280&q=medium",
  
  "Aral Sea Expedition": "https://nuratau.com/wp-content/uploads/2025/01/2-Day-Aral-Sea-Tour-Featured.jpg",
  "Fergana Valley Cultural Tour":"https://uzbekistan.travel/storage/app/media/nargiza/cropped-images/1-0-0-0-0-1583481798.jpg",
  "Uzbekistan Architectural Wonders": "https://m.thepeninsulaqatar.com/get/maximage/20240730_1722356496-724.jpg?1722356496",
  "Mountains of Uzbekistan": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,dpr=1/tour_img/16289f2dc587a1f0ef5182c09e855438e7e8d52bec2d069dc333c207694f581e.jpg",
 "Central Asian Odyssey": "https://eurasia.travel/wp-content/uploads/2024/09/Burana-Tower.jpg",
  "Photography Tour of Uzbekistan":"https://www.israelphotographytour.com/wp-content/uploads/2020/11/uzbekistan-photo-workshop-adventures-laurie-cohen-barcelona-photography-tour-2-1.jpg",

  "Silk Road: Uzbekistan & Turkmenistan": "https://triporient.com//data/uploads/module/tour/gallery//85/original/5e259355150ff.jpg"
  
};


const TourCard = ({ tour }: TourCardProps) => {
  const { t } = useTranslation();
  const { isTourInWishlist, addTourToWishlist, removeTourFromWishlist } = useWishlist();

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link/card click
    
    if (isTourInWishlist(tour.id)) {
      removeTourFromWishlist(tour.id);
    } else {
      addTourToWishlist(tour);
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative">
        <img
          src={tour.title && tourImages[tour.title as keyof typeof tourImages] 
            ? tourImages[tour.title as keyof typeof tourImages] 
            : tour.image}
          alt={tour.title}
          className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback to a default image if the tour image doesn't load
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1636790230684-1d42b13a918f?w=1200&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute top-4 right-4 bg-[#FF9800] text-white py-1 px-3 rounded-full text-xs font-medium">
          {tour.duration}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className={`absolute top-4 left-4 rounded-full bg-white/80 ${isTourInWishlist(tour.id) ? 'text-red-500' : 'text-gray-500'}`} 
          onClick={toggleWishlist}
        >
          <HeartIcon className={`h-5 w-5 ${isTourInWishlist(tour.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-heading font-bold line-clamp-1">{tour.title}</h3>
          <div className="text-[#FF9800] font-bold">{tour.price}</div>
        </div>
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{tour.description}</p>
        
        <div className="grid grid-cols-3 gap-2 mb-4 mt-auto">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1 text-[#FF9800]" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Map className="h-3 w-3 mr-1 text-[#FF9800]" />
            <span>{tour.cities}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Users className="h-3 w-3 mr-1 text-[#FF9800]" />
            <span>{t("tours.details.maxPeople", { count: tour.maxPeople })}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{tour.rating}</span>
          </div>
          <Link 
            href={`/tours/${tour.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#FF9800] hover:text-[#FF9800]/80 transition-colors"
          >
            {t("tours.details.view")}
            <MoveRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="bg-[#FF9800] px-5 py-3 text-white">
        <Link 
          href={`/tours/${tour.id}`}
          className="block w-full text-center font-medium"
        >
          {t("tours.book")}
        </Link>
      </div>
    </div>
  );
};

export default TourCard;
