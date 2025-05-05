import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { type Destination } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { HeartIcon, MoveRight } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

interface DestinationCardProps {
  destination: Destination;
}

// Use high quality landmark/architectural images for destinations
const realImages = {
  // Uzbekistan destinations
  "Samarkand": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/78/99/60/photo1jpg.jpg?w=1500&h=800&s=1", // Registan Square
  "Bukhara": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2012_Bukhara_7515821196.jpg/1200px-2012_Bukhara_7515821196.jpg", // Bukhara similar to Petra
  "Khiva": "https://uzbekistan.travel/storage/app/media/Rasmlar/Xorazm/cropped-images/2085225817-0-0-0-0-1738669642.jpg", // Khiva fortress
  "Tashkent": "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0a/c3/f0/1c.jpg", // Architecture view
  "Nukus": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/SavickiMuseum.jpg/250px-SavickiMuseum.jpg", // Desert vista
  "Fergana Valley": "https://monkeystale.ca/wp-content/uploads/2023/07/3l4a3022-11-1.jpg?w=2048", // Mountain valley
  "Shakhrisabz": "https://t4.ftcdn.net/jpg/03/61/64/97/360_F_361649752_LxYglPdiBtYnRLl0ceqzrD3uXPdu3t4F.jpg", // Historical ruin
  "Termez": "https://www.gazeta.uz/media/img/2015/02/qd4eAb14244251245496_b.jpg", // Archaeological ruins
  "Chimgan Mountains": "https://www.orexca.com/img/uzbekistan/chimgan/chimgan8.jpg", // Mountain landscape
  "Aral Sea": "https://lh3.googleusercontent.com/proxy/4uyJTYeONO62OMw92yTT090xxTlBYzCR-Mz3859X_Jkg08KyaKL85U8xExR52c8naYSQikLAD7tv82a5r893m5SFBUPnPgsONJ3RFtbL", // Dried landscape
  "Navoi": "https://www.tourstouzbekistan.com/uploads/2021%20photos/Bukhara/navoi_city_Uzbekistan_anurtour.jpg", // Desert canyon
  
  // Kazakhstan destination
  "Almaty": "https://almaty.citypass.kz/wp-content/uploads/2023/11/1650914266_62-vsegda-pomnim-com-p-almati-vid-na-gori-foto-68.jpg", // Mountain landscape
  
  // Kyrgyzstan destination
  "Bishkek": "https://cdn.tripster.ru/photos/27d7fd66-eabd-4e81-a7c7-5c98f548515f.jpg" // Mountain vista
};

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const { t } = useTranslation();
  const { isDestinationInWishlist, addDestinationToWishlist, removeDestinationFromWishlist } = useWishlist();

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the card click
    
    if (isDestinationInWishlist(destination.id)) {
      removeDestinationFromWishlist(destination.id);
    } else {
      addDestinationToWishlist(destination);
    }
  };

  // Use real image if available, otherwise use the destination.image
  const imageUrl = destination.name && realImages[destination.name as keyof typeof realImages] 
    ? realImages[destination.name as keyof typeof realImages]
    : destination.image;

  return (
    <div className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative bg-gray-100">
      <div className="relative h-80 overflow-hidden">
        <img
          src={imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Top left location badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#FF9800]/90 text-white text-xs px-3 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {destination.name === "Almaty" ? "Kazakhstan" : 
               destination.name === "Bishkek" ? "Kyrgyzstan" : "Uzbekistan"}
            </span>
          </div>
          
          {/* Top right corner badge */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full bg-white/90 ${isDestinationInWishlist(destination.id) ? 'text-red-500' : 'text-gray-500'}`} 
              onClick={toggleWishlist}
            >
              <HeartIcon className={`h-5 w-5 ${isDestinationInWishlist(destination.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          {/* Content at center */}
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 text-center">
            <h3 className="text-3xl font-bold text-white mb-2">{destination.name}</h3>
            <div className="flex items-center justify-center mb-1">
              <div className="flex text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-white/80 text-xs ml-2">Top Destination</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom section with description and explore button */}
      <div className="p-4">
        <p className="text-gray-700 line-clamp-2 mb-4 text-sm min-h-[40px]">{destination.description}</p>
        <div className="text-center">
          <a
            href={`/destinations/${destination.id}`}
            className="inline-flex items-center justify-center gap-2 bg-[#FF9800] text-white px-6 py-2 rounded-full font-medium hover:bg-[#FF9800]/90 transition-all duration-300 w-full"
          >
            Explore <MoveRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
