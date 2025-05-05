import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TourCard from "@/components/tour/TourCard";
import DestinationCard from "@/components/destination/DestinationCard";
import { useWishlist } from "@/context/WishlistContext";
import { Bookmark, MapPin } from "lucide-react";

const WishlistPage = () => {
  const { t } = useTranslation();
  const { tourWishlist, destinationWishlist } = useWishlist();

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8">
          {t("wishlist.yourWishlist")}
        </h1>
        
        <Tabs defaultValue="tours" className="w-full mb-12">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="tours" className="flex items-center">
              <Bookmark className="mr-2 h-4 w-4" />
              {t("wishlist.savedTours")}
            </TabsTrigger>
            <TabsTrigger value="destinations" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {t("wishlist.savedDestinations")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours">
            {tourWishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tourWishlist.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">{t("wishlist.noToursYet")}</h3>
                <p className="text-neutral-600">
                  {t("wishlist.browseToursAndSave")}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="destinations">
            {destinationWishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {destinationWishlist.map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">{t("wishlist.noDestinationsYet")}</h3>
                <p className="text-neutral-600">
                  {t("wishlist.browseDestinationsAndSave")}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WishlistPage;