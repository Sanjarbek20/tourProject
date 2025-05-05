import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { type Tour } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/context/WishlistContext";
import Contact from "@/components/home/Contact";
import Newsletter from "@/components/home/Newsletter";
import BookingForm from "@/components/tour/BookingForm";

const TourDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const tourId = id ? parseInt(id) : NaN;
  const { 
    isTourInWishlist, 
    addTourToWishlist, 
    removeTourFromWishlist 
  } = useWishlist();

  const { data: tour, isLoading, error } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
    enabled: !isNaN(tourId)
  });
  
  const toggleWishlist = () => {
    if (!tour) return;
    
    if (isTourInWishlist(tour.id)) {
      removeTourFromWishlist(tour.id);
    } else {
      addTourToWishlist(tour);
    }
  };

  if (isNaN(tourId)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-heading font-bold text-neutral-800 mb-6">
          Invalid Tour ID
        </h1>
        <p className="mb-8">The tour ID provided is not valid.</p>
        <Link 
          href="/tours"
          className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
        >
          Back to Tours
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-heading font-bold text-neutral-800 mb-6">
          Error Loading Tour
        </h1>
        <p className="mb-8">There was an error loading the tour details.</p>
        <Link 
          href="/tours"
          className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
        >
          Back to Tours
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="pt-20 pb-16">
        {isLoading ? (
          <div className="container mx-auto px-4">
            <Skeleton className="h-96 w-full rounded-lg mb-8" />
            <Skeleton className="h-12 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-8" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : tour ? (
          <>
            <div className="relative h-96 bg-cover bg-center mb-8" style={{ backgroundImage: `url('${tour.image}')` }}>
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
                <div className="bg-[#FF9800] text-white py-1 px-4 rounded-full text-sm font-bold inline-block mb-4 w-fit">
                  {tour.duration}
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-white">
                  <span className="flex items-center">
                    <i className="fas fa-map-marker-alt mr-2"></i> {tour.cities}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-users mr-2"></i> {t("tours.details.maxPeople", { count: tour.maxPeople })}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-star mr-2"></i> {tour.rating}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-tag mr-2"></i> {tour.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-heading font-bold mb-6">Tour Overview</h2>
                  <p className="text-neutral-800/70 mb-8">{tour.description}</p>
                  
                  <h2 className="text-2xl font-heading font-bold mb-6">Tour Highlights</h2>
                  <ul className="list-disc pl-6 mb-8 space-y-2 text-neutral-800/70">
                    <li>Visit UNESCO World Heritage Sites including Registan Square and ancient cities</li>
                    <li>Experience authentic Uzbek cuisine - plov, shashlik, samsa, and lagman</li>
                    <li>Meet local craftsmen and artisans specializing in ceramics, silk, and carpet making</li>
                    <li>Stay in comfortable accommodations including traditional boutique hotels</li>
                    <li>Travel with professional English/Russian/Uzbek-speaking guides</li>
                    <li>Experience traditional Uzbek hospitality in local homes</li>
                  </ul>
                  
                  <h2 className="text-2xl font-heading font-bold mb-6">Itinerary</h2>
                  <div className="space-y-6 mb-8">
                    {tour.category === "Historical" && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1: Arrival in Tashkent</h3>
                          <p className="text-neutral-800/70">Airport pickup and transfer to your hotel. Welcome dinner at a traditional Uzbek restaurant and tour briefing.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 2-3: Samarkand</h3>
                          <p className="text-neutral-800/70">High-speed train to Samarkand. Visit Registan Square, Bibi-Khanym Mosque, Shah-i-Zinda necropolis, and Gur-e-Amir mausoleum.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 4-5: Bukhara</h3>
                          <p className="text-neutral-800/70">Travel to Bukhara. Explore Poi Kalyan complex, Ark Fortress, Lyabi-Hauz ensemble, and trading domes.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 6: Khiva</h3>
                          <p className="text-neutral-800/70">Flight to Khiva. Discover the walled inner city of Itchan Kala with its minarets, madrasas, and palaces.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 7: Return to Tashkent</h3>
                          <p className="text-neutral-800/70">Flight back to Tashkent. Free time for last-minute shopping at Chorsu Bazaar. Farewell dinner and airport transfer.</p>
                        </div>
                      </>
                    )}

                    {tour.category === "Cultural" && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1: Tashkent Introduction</h3>
                          <p className="text-neutral-800/70">Welcome to Uzbekistan. City tour of Tashkent including Khast Imam complex, Chorsu Bazaar, and Applied Arts Museum.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 2-3: Cultural Workshops</h3>
                          <p className="text-neutral-800/70">Visit master ceramicists in Rishtan, silk weavers in Margilan, and participate in traditional bread baking.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 4-5: Cultural Performances</h3>
                          <p className="text-neutral-800/70">Enjoy traditional music and dance performances. Visit local families and learn about Uzbek customs and traditions.</p>
                        </div>
                      </>
                    )}

                    {tour.category === "Adventure" && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1: Arrival & Preparation</h3>
                          <p className="text-neutral-800/70">Meet your adventure guides and prepare for the upcoming journey. Equipment check and briefing.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 2-3: Desert Expedition</h3>
                          <p className="text-neutral-800/70">Camel trekking in the Kyzylkum Desert. Overnight stay in a traditional yurt camp under the stars.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 4: Mountain Hiking</h3>
                          <p className="text-neutral-800/70">Explore Uzbekistan's mountains with guided hiking through stunning landscapes and remote villages.</p>
                        </div>
                      </>
                    )}

                    {tour.category === "Culinary" && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1: Tashkent Food Tour</h3>
                          <p className="text-neutral-800/70">Explore Chorsu Bazaar and sample local dishes. Evening cooking class to learn making Uzbek plov with a local chef.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 2-3: Samarkand Cuisine</h3>
                          <p className="text-neutral-800/70">Travel to Samarkand. Learn bread-making traditions, taste local wines, and experience different regional variations of Uzbek dishes.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 4-5: Bukhara Gastronomy</h3>
                          <p className="text-neutral-800/70">Discover Bukhara's unique culinary heritage. Visit local homes for authentic meals and learn traditional cooking techniques.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 6: Return to Tashkent</h3>
                          <p className="text-neutral-800/70">Final cooking masterclass and farewell dinner featuring the dishes you've learned to prepare.</p>
                        </div>
                      </>
                    )}

                    {tour.category === "Eco" && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1: Tashkent Orientation</h3>
                          <p className="text-neutral-800/70">Introduction to Uzbekistan's natural diversity and ecological challenges. Visit to Botanical Gardens.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 2-3: Nuratau Mountains</h3>
                          <p className="text-neutral-800/70">Travel to Nuratau Nature Reserve. Stay in eco-friendly guesthouses, hiking in pristine mountain environments.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 4-5: Aral Sea Expedition</h3>
                          <p className="text-neutral-800/70">Visit the former fishing port of Muynak. Learn about the Aral Sea disaster and ongoing restoration efforts.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 6-7: Return Journey</h3>
                          <p className="text-neutral-800/70">Visit sustainable development projects. Participate in a tree planting initiative before returning to Tashkent.</p>
                        </div>
                      </>
                    )}

                    {tour.category === "Photography" && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1: Tashkent Photography Introduction</h3>
                          <p className="text-neutral-800/70">Photography workshop and orientation. Capture Tashkent's mix of Soviet and modern architecture at golden hour.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 2-3: Samarkand Photo Expedition</h3>
                          <p className="text-neutral-800/70">Dawn shoot at Registan Square. Photography of local artisans and markets. Night photography of illuminated monuments.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 4-5: Bukhara Visual Storytelling</h3>
                          <p className="text-neutral-800/70">Capture ancient architecture, daily life in the old city, and intimate portraits with locals (with permission).</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 6-7: Khiva & Desert Landscapes</h3>
                          <p className="text-neutral-800/70">Photograph the walled city of Khiva. Sunset desert shoot with traditional yurts and camels.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 8-9: Final Portfolio</h3>
                          <p className="text-neutral-800/70">Return to Tashkent. Photo editing workshop and group exhibition of your best images.</p>
                        </div>
                      </>
                    )}

                    {tour.category === "Multi-Country" && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1-3: Uzbekistan</h3>
                          <p className="text-neutral-800/70">Begin in Tashkent and visit the UNESCO treasures of Samarkand, experiencing Uzbek culture and cuisine.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 4-6: Kazakhstan</h3>
                          <p className="text-neutral-800/70">Travel to Almaty. Explore the modern city, visit Charyn Canyon, and experience Kazakh nomadic traditions.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 7-9: Kyrgyzstan</h3>
                          <p className="text-neutral-800/70">Discover Bishkek and the stunning landscapes of Lake Issyk-Kul. Stay in traditional yurts and meet eagle hunters.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 10-12: Tajikistan</h3>
                          <p className="text-neutral-800/70">Visit Dushanbe and the dramatic Fann Mountains. Experience Tajik hospitality and cultural performances.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 13-14: Return to Uzbekistan</h3>
                          <p className="text-neutral-800/70">Complete your Central Asian journey back in Uzbekistan, comparing cultures and traditions before departure.</p>
                        </div>
                      </>
                    )}

                    {!["Historical", "Cultural", "Adventure", "Culinary", "Eco", "Photography", "Multi-Country"].includes(tour.category) && (
                      <>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 1: Arrival in Uzbekistan</h3>
                          <p className="text-neutral-800/70">Airport pickup and transfer to your hotel. Welcome dinner at a traditional Uzbek restaurant and tour briefing.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Day 2-3: Main Activities</h3>
                          <p className="text-neutral-800/70">Participate in tour-specific activities based on your selected package and destinations in Uzbekistan.</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">Final Day: Return</h3>
                          <p className="text-neutral-800/70">Free time for shopping at local bazaars. Farewell dinner with traditional Uzbek music and airport transfer.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="sticky top-24">
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                      <div className="text-3xl font-bold text-[#FF9800] mb-4 text-center">
                        {tour.price}
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-800">Tour Type:</span>
                          <span className="font-medium">{tour.category}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-800">Duration:</span>
                          <span className="font-medium">{tour.duration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-800">Group Size:</span>
                          <span className="font-medium">Max {tour.maxPeople} people</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-800">Languages:</span>
                          <span className="font-medium">English, Russian, Uzbek</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={toggleWishlist} 
                        variant="outline" 
                        className={`w-full ${isTourInWishlist(tour.id) ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600' : 'hover:bg-neutral-200'} px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center`}
                      >
                        <HeartIcon className={`mr-2 h-5 w-5 ${isTourInWishlist(tour.id) ? 'fill-current' : ''}`} />
                        {isTourInWishlist(tour.id) ? t("wishlist.removeFromWishlist") : t("wishlist.addToWishlist")}
                      </Button>
                    </div>
                    
                    <BookingForm 
                      tourId={tour.id} 
                      maxPeople={tour.maxPeople} 
                      price={tour.price}
                      duration={tour.duration}
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-16 mt-24">
                <Link 
                  href="/tours"
                  className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
                >
                  Browse More Tours
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <Contact />
      <Newsletter />
    </>
  );
};

export default TourDetail;
