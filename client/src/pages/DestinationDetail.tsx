import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Destination, Tour } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Modified version of apiRequest that doesn't throw errors
async function safeApiRequest(
  method: string,
  url: string,
  data?: any
): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = JSON.stringify(data);
    }

    const res = await fetch(url, fetchOptions);
    
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: { error: `API returned status ${res.status}` }
      };
    }
    
    const responseData = await res.json();
    return {
      ok: true,
      status: res.status,
      data: responseData
    };
  } catch (error) {
    console.error("Error in safeApiRequest:", error);
    return {
      ok: false,
      status: 0,
      data: { error: "Request failed" }
    };
  }
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HeartIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon, 
  CircleDollarSignIcon,
  ArrowRightIcon,
  CheckIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const videos = {
  "Samarkand": "https://www.youtube.com/embed/5MU0qj6IQ_M",
  "Bukhara": "https://www.youtube.com/embed/WakHxPBNLk4",
  "Khiva": "https://www.youtube.com/embed/u-S_IZWbcB0",
  "Tashkent": "https://www.youtube.com/embed/UJj4ST7SRzw",
  "Fergana Valley": "https://www.youtube.com/embed/Ww1y21n3RQI",
  "Nukus": "https://www.youtube.com/embed/gJGW7YZA1BA",
  "Navoi": "https://www.youtube.com/embed/jqYOk9RJDw0",
  "Termez": "https://www.youtube.com/embed/X7EgnLZgAY0",
  "Almaty": "https://www.youtube.com/embed/BXe_R5GfUcQ",
  "Aral Sea": "https://www.youtube.com/embed/0J8C4H4sydI",
  "Bishkek": "https://www.youtube.com/embed/9ppLPWwBV68",
  "Chimgan Mountains": "https://www.youtube.com/embed/0qEgGFCCCnE",
  "Shakhrisabz": "https://www.youtube.com/embed/avFNnMUjJlM"
};

// Hotel information for each destination
const hotels = {
  "Samarkand": [
    {
      name: "Registan Plaza Hotel",
      stars: 4,
      pricePerNight: 89,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/292394202.jpg?k=1553a5d983ff3c34cb4ab1e4c6e91cce9cef4dc87a354fac9ecfb0f68e86f913",
      description: "Centrally located luxury hotel with views of the historical sites, featuring an on-site restaurant, spa facilities, and traditional Uzbek decor.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Swimming pool", "Restaurant", "Spa services", "Airport shuttle"]
    },
    {
      name: "Emir Hotel Samarkand",
      stars: 3,
      pricePerNight: 65,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/402240146.jpg?k=d11c84edd8fddcb0a63d89f44a6bb2634065302ade2c63569a0f97e3e21fe56c",
      description: "Comfortable mid-range hotel within walking distance of major attractions, offering clean rooms and friendly service.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "24-hour front desk", "Room service"]
    },
    {
      name: "Bibi-Khanym Hotel",
      stars: 4,
      pricePerNight: 95,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/346352375.jpg?k=c976ec20dbf008e8252ddcb485cb3276907ab4a6473738f053fc7ba8c60a6890",
      description: "Elegant hotel combining traditional architecture with modern amenities, located near the Bibi-Khanym Mosque with stunning courtyard views.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Swimming pool", "Restaurant", "Bar", "Fitness center", "Room service"]
    }
  ],
  "Bukhara": [
    {
      name: "Hovli Poyon Boutique Hotel",
      stars: 4,
      pricePerNight: 78,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/263369199.jpg?k=b7b46e52f9a1d2e8f607bd28ac2d1f3ce67dbafd69c5ae25983de8e76eebcae9",
      description: "Beautiful boutique hotel in a restored merchant's house with traditional Uzbek design and a central courtyard, located in the heart of the old city.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "Terrace", "Airport shuttle", "Traditional breakfast"]
    },
    {
      name: "Omar Khayyam Hotel",
      stars: 3,
      pricePerNight: 55,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/322693419.jpg?k=9ee7477c79ae1286da9921c9c3d970ef60a4c27bf9d976848c1ae2990d4facfd",
      description: "Charming mid-range hotel with traditional architecture and comfortable rooms, conveniently located near main historical sites.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "24-hour front desk", "Tour desk"]
    },
    {
      name: "Minzifa Boutique Hotel",
      stars: 4,
      pricePerNight: 85,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/283467456.jpg?k=7303232ed5d0cf425fcf09e6cbbc013dfd4d67ca7f7060d3bc917f1ef48e4ac1",
      description: "Authentic boutique hotel in a restored 19th-century house with unique rooms featuring traditional Bukharian textiles and crafts.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "Terrace", "Rooftop dining", "Tour services"]
    }
  ],
  "Khiva": [
    {
      name: "Asia Khiva Hotel",
      stars: 4,
      pricePerNight: 75,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/223958129.jpg?k=fd3e9a33c7a13f92fcddd68c5a7d825a47e5d40e00b2fe0df2c4d9eaa0c80d25",
      description: "Modern hotel with traditional elements, located just outside the Itchan Kala walls, offering easy access to all main attractions.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "Bar", "Swimming pool", "Fitness center"]
    },
    {
      name: "Malika Kheivak Hotel",
      stars: 3,
      pricePerNight: 60,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/182023618.jpg?k=29fe6c47c24e1336e2a3b478edb1b6a9b0e0fd8f5d0c2ddef5cdd2a69a2da360",
      description: "Cozy hotel inside the old city walls, featuring traditional architecture and offering a true local experience.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "Courtyard", "24-hour front desk"]
    },
    {
      name: "Arkanchi Hotel",
      stars: 3,
      pricePerNight: 55,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/337602844.jpg?k=0aeb3ad12a6a15bed22d5b71c3dac3950a0a3a73f9a56fb0801f38d6561d8cc8",
      description: "Charming small hotel with a rooftop terrace offering panoramic views of Khiva's ancient skyline.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "Rooftop terrace", "Tour desk"]
    }
  ],
  "Tashkent": [
    {
      name: "Hyatt Regency Tashkent",
      stars: 5,
      pricePerNight: 120,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/176261871.jpg?k=e13ab59a81ffce3e323ae463808e2540eb6e5ed0683dffa4da3b58c34dcea2c5",
      description: "Luxury international hotel in the city center, offering world-class amenities and sophisticated dining options.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Swimming pool", "Multiple restaurants", "Spa", "Fitness center", "Business center"]
    },
    {
      name: "Wyndham Tashkent",
      stars: 4,
      pricePerNight: 95,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/188005883.jpg?k=ae1cd6daa2e14950db2ef7cadc9f48df84a76ab1db9b7be7f7f68f5ab18d5b19",
      description: "Modern hotel with excellent facilities, convenient for both business and leisure travelers.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "Bar", "Fitness center", "Business services"]
    },
    {
      name: "City Palace Hotel",
      stars: 4,
      pricePerNight: 85,
      image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/55722027.jpg?k=ab78c35de2a74705e707278d23c463cdd04d4ce1e8e88cb4c8a5a1848bfa2a75",
      description: "Comfortable city hotel with a central location, offering good value and easy access to main attractions and shopping areas.",
      amenities: ["Free Wi-Fi", "Air conditioning", "Restaurant", "Bar", "Conference facilities", "Airport shuttle"]
    }
  ]
};

// Additional package details for each destination
const packageDetails = {
  "Samarkand": {
    title: "Samarkand Heritage Tour",
    days: 5,
    nights: 4,
    price: 199,
    minPeople: 2,
    tourType: "Cultural tour",
    included: [
      "Hotel accommodation",
      "Airport transfers",
      "English speaking guide",
      "Entrance fees to museums and historical sites",
      "Breakfast daily"
    ],
    notIncluded: [
      "International flights",
      "Visa fees",
      "Personal expenses",
      "Travel insurance",
      "Lunch and dinner"
    ],
    itinerary: [
      {
        day: 1,
        title: "ARRIVAL IN SAMARKAND",
        description: "Arrival at Samarkand International Airport. Transfer to the hotel for check-in and rest. City tour with visits to Registan Square and Gur-Emir Mausoleum. Welcome dinner at a local restaurant.",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "SAMARKAND CITY TOUR",
        description: "Full day exploring Samarkand's main attractions: Bibi-Khanum Mosque, Shah-i-Zinda Necropolis, and Ulugbek Observatory. Lunch at a local restaurant. Visit to Siab Bazaar and free time in the afternoon.",
        meals: "Breakfast, Lunch"
      },
      {
        day: 3,
        title: "SAMARKAND - SHAKHRISABZ - SAMARKAND",
        description: "Day trip to Shakhrisabz, birthplace of Tamerlane. Visit Ak-Saray Palace, Kok-Gumbaz Mosque, and Dorut Tilovat complex. Return to Samarkand in the evening.",
        meals: "Breakfast, Lunch"
      },
      {
        day: 4,
        title: "PAPER MILL AND WINE TASTING",
        description: "Visit to the ancient paper mill in Konigil village to learn about traditional paper making. Afternoon visit to Hovrenko Wine Factory for wine tasting. Free evening for shopping and relaxation.",
        meals: "Breakfast"
      },
      {
        day: 5,
        title: "DEPARTURE",
        description: "Breakfast at the hotel. Check-out and transfer to Samarkand International Airport for departure.",
        meals: "Breakfast"
      }
    ]
  },
  "Bukhara": {
    title: "Bukhara Ancient City Tour",
    days: 4,
    nights: 3,
    price: 179,
    minPeople: 2,
    tourType: "Historical tour",
    included: [
      "Hotel accommodation",
      "Airport transfers",
      "English speaking guide",
      "Entrance fees to museums and historical sites",
      "Daily breakfast"
    ],
    notIncluded: [
      "International flights",
      "Visa fees",
      "Personal expenses",
      "Travel insurance",
      "Lunch and dinner"
    ],
    itinerary: [
      {
        day: 1,
        title: "ARRIVAL IN BUKHARA",
        description: "Arrival in Bukhara. Transfer to the hotel for check-in. Afternoon orientation walk around the old town including Lyabi-Hauz ensemble. Welcome dinner with folk show.",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "BUKHARA CITY TOUR",
        description: "Full day exploring Bukhara: Ark Fortress, Bolo Hauz Mosque, Poi Kalyan Complex with Kalyan Minaret, and Trading Domes. Free time in the afternoon for shopping in the bazaars.",
        meals: "Breakfast"
      },
      {
        day: 3,
        title: "BUKHARA SURROUNDINGS",
        description: "Visit to Sitorai Mokhi-Khosa (Summer Palace), Bakhautdin Naqshbandi Complex, and Chor-Bakr Necropolis. Evening master class on Bukharian cuisine.",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "DEPARTURE",
        description: "Breakfast at the hotel. Check-out and transfer to Bukhara Airport for departure.",
        meals: "Breakfast"
      }
    ]
  },
  // Package details for other destinations would be added similarly
};

const detailedInfo = {
  "Samarkand": {
    history: "Founded in the 7th century BC, Samarkand is one of the oldest continuously inhabited cities in Central Asia. It was a key center of the Silk Road and became the capital of Tamerlane's empire in the 14th century. The city flourished as a hub for Islamic scholarship, architecture, and culture.",
    attractions: "Registan Square (three magnificent madrasahs), Gur-e-Amir Complex (Tamerlane's mausoleum), Bibi-Khanym Mosque, Shah-i-Zinda Necropolis, Ulugh Beg Observatory, Afrasiyab Museum, Siab Bazaar.",
    culture: "Samarkand is known for its rich cultural heritage, including traditional crafts like silk carpet weaving, embroidery, and paper making. The city's cuisine features dishes like plov (pilaf), shashlik (kebabs), and various breads and sweets."
  },
  "Bukhara": {
    history: "One of Central Asia's oldest cities, Bukhara was a major center of Islamic culture and scholarship for centuries. It was an important stop on the Silk Road and served as the capital of the Samanid Empire and later the Bukhara Khanate.",
    attractions: "Ark Fortress, Poi Kalyan Complex (including Kalyan Minaret and Mosque), Lyab-i Hauz, Ismail Samani Mausoleum, Chor Minor, Trading Domes (bazaars), Bolo Hauz Mosque, numerous madrasahs.",
    culture: "Bukhara is renowned for its gold embroidery, blacksmithing, wood carving, and carpet making. Cultural performances include puppet shows, folk music, and traditional dances. Local cuisine features dishes such as shurpa (soup), plov, and various meat dishes."
  },
  "Khiva": {
    history: "Legend has it that Khiva was founded by Shem, the son of Noah. It became an important Silk Road city in the 10th century and later the capital of the Khiva Khanate. The city was known for its slave market and as a center of Islamic learning.",
    attractions: "Itchan Kala (walled inner city, UNESCO site), Kunya-Ark Fortress, Juma Mosque with its 213 carved wooden columns, Islam Khoja Minaret, Tash-Hauli Palace, Muhammad Amin-khan Madrasah, Pahlavon Mahmud Mausoleum.",
    culture: "Khiva is famous for traditional crafts including woodcarving, carpet weaving, and silk production. The city hosts cultural events featuring traditional music performed on instruments like the dutar and tambur. Local cuisine includes specialties like shivit oshi (green noodles)."
  },
  "Fergana Valley": {
    history: "The fertile Fergana Valley has been an important agricultural and cultural center for over 2,300 years. It was a key region along the Silk Road and has been ruled by various empires including Persian, Greek, Chinese, Arab, and Russian.",
    attractions: "Margilan's Yodgorlik Silk Factory, Said Akhmad-Khoja Madrasah in Margilan, Khan's Palace in Kokand, Kambar-Ota mountains, Shakhimardan resort area, Central Park of Fergana, local bazaars and handicraft centers.",
    culture: "The valley is known for traditional silk production using ancient ikat techniques, ceramics, and knife making. Cultural traditions include the distinctive Fergana style of dance, local folk music, and traditional ceremonies. The region is known for its fruits, especially melons and grapes."
  },
  "Tashkent": {
    history: "Tashkent has a history spanning over 2,200 years. It was an important crossroads on the Silk Road. After a devastating earthquake in 1966, the city was rebuilt with wide avenues and Soviet-style architecture, giving it a unique blend of ancient and modern elements.",
    attractions: "Khast Imam Complex, Chorsu Bazaar, Independence Square, Amir Timur Museum, Tashkent TV Tower, State Museum of History, Minor Mosque, Broadway Street, Alisher Navoi Opera and Ballet Theater.",
    culture: "As Uzbekistan's capital, Tashkent blends traditional Uzbek culture with modern influences. The city hosts numerous cultural festivals, performances, and exhibitions. Its cuisine includes Tashkent plov (considered distinct from other regional variations), lagman, and diverse international options."
  },
  "Nukus": {
    history: "Nukus is a relatively young city, established in 1932 as the capital of Karakalpakstan Autonomous Republic. It gained worldwide fame after the discovery of the Savitsky Collection, one of the world's largest collections of Russian avant-garde art, hidden here during Soviet times.",
    attractions: "Savitsky Karakalpakstan Art Museum (often called 'the Louvre of the Steppe'), Regional Studies Museum, Mizdakhan Necropolis, ancient ruins of Gyaur-Kala, nearby Aral Sea sites, Monument of Berdakh.",
    culture: "Nukus preserves the unique culture of the Karakalpak people, with distinct traditions, language, and yurt-dwelling heritage. Traditional crafts include jewelry making, embroidery, and carpet weaving with geometric patterns. The region's cuisine features fish dishes reflecting its proximity to the Aral Sea."
  },
  "Navoi": {
    history: "Named after the great poet Alisher Navoi, the city of Navoi was established in 1958 as an industrial center. The wider Navoi region, however, has a rich history dating back thousands of years, with evidence of ancient settlements and historical sites throughout the area.",
    attractions: "Sarmyshsay Gorge with prehistoric rock carvings, Nurata Mountains, Lake Aydarkul, Sentob village, ruins of ancient Karmana, Rabati Malik Caravanserai, regional museum, and local bazaars.",
    culture: "The region blends traditional Uzbek culture with influences from the Soviet industrial era. Traditional crafts include carpet weaving and jewelry making. The local cuisine features traditional Uzbek dishes with regional variations specific to the steppe regions."
  },
  "Termez": {
    history: "Termez is one of the most ancient cities in Central Asia, with a history spanning over 2,500 years. Located on the Amu Darya river at the border with Afghanistan, it was an important Buddhist center before becoming a significant Islamic cultural hub.",
    attractions: "Archaeological Museum, Sultan Saodat Complex, Hakkim at-Termizi Mausoleum, Buddhist Kara-Tepe and Fayaz-Tepe monasteries, Al-Hakim at-Termizi Mausoleum, Kirk-Kiz Fortress, Zurmala Tower (ancient Buddhist stupa).",
    culture: "Due to its border location, Termez's culture reflects influences from Afghanistan, Tajikistan, and various historical empires. The city maintains several cultural institutions including theaters and museums showcasing the region's rich archaeological heritage and history of cultural exchange."
  },
  "Almaty": {
    history: "Originally known as Verniy, Almaty was founded in 1854 as a Russian frontier fort. It served as Kazakhstan's capital until 1997 when the capital was moved to Astana (now Nur-Sultan). With a history influenced by Silk Road trade, Russian Empire expansion, and Soviet rule, Almaty has emerged as Kazakhstan's cultural and commercial hub.",
    attractions: "Kok-Tobe Hill, Panfilov Park and Zenkov Cathedral, Central State Museum, Medeu ice skating rink, Shymbulak Ski Resort, Almaty Central Mosque, Green Bazaar (Zelyony Bazar), Almaty Metro, Charyn Canyon (day trip).",
    culture: "Almaty blends Kazakh traditions with Russian and Soviet influences. The city is Kazakhstan's cultural capital with numerous theaters, museums, and art galleries. Kazakh cuisine features horse meat and milk products, while the city's cafes offer international dining options."
  },
  "Aral Sea": {
    history: "Once the fourth-largest lake in the world, the Aral Sea began shrinking dramatically in the 1960s when Soviet projects diverted its source rivers for cotton irrigation. By the 1990s, it had lost over 60% of its area and 80% of its volume, creating one of the world's worst environmental disasters.",
    attractions: "Ship Cemetery near Muynak (abandoned fishing vessels stranded in sand), former seabed landscapes, Regional History Museum in Muynak, villages of former fishermen, conservation projects, documentary photography opportunities.",
    culture: "The area once supported thriving fishing communities with their own cultural traditions. Today, local culture reflects both the traditional Karakalpak heritage and the dramatic adaptations people have made to survive ecological disaster. Efforts to preserve local cultural history are evident in regional museums."
  },
  "Bishkek": {
    history: "Originally a caravan rest stop on the Silk Road, Bishkek was established as a Russian fortress named Pishpek in 1825. During Soviet times, it was renamed Frunze before becoming Bishkek in 1991 when Kyrgyzstan gained independence. The city has a distinctly Soviet layout with wide boulevards and plentiful parks.",
    attractions: "Ala-Too Square, State Historical Museum, Osh Bazaar, Panfilov Park, Victory Square, Kyrgyz National Opera and Ballet Theater, Oak Park, Bishkek Park shopping mall, Museum of Fine Arts, Dordoi Market.",
    culture: "Bishkek serves as the cultural heart of Kyrgyzstan, blending nomadic Kyrgyz traditions with Soviet and Russian influences. The city hosts numerous cultural events celebrating traditional music, dance, and crafts. Kyrgyz cuisine features beshbarmak (noodles with meat), various dumplings, and kumis (fermented mare's milk)."
  },
  "Chimgan Mountains": {
    history: "Part of the western Tian Shan mountain range, the Chimgan Mountains have been a natural landmark for civilizations throughout history. They gained popularity as a recreational area during the Soviet era when resorts and sanatoriums were developed in the region, making it a favorite destination for mountaineers and nature lovers.",
    attractions: "Beldersay Ski Resort, Gulkam Canyon, Charvak Reservoir, hiking trails, paragliding spots, Kumyshkan village, various waterfalls, panoramic viewpoints, mountain streams and meadows.",
    culture: "The mountain region preserves elements of traditional rural Uzbek culture, with small villages maintaining traditional lifestyles and crafts. The area has also developed its own mountain tourism culture, with distinctive resorts blending Soviet-era architecture with modern amenities."
  },
  "Shakhrisabz": {
    history: "Known as 'Kesh' in ancient times, Shakhrisabz is over 2,700 years old and is famous as the birthplace of Amir Timur (Tamerlane) in the 14th century. Under Timur's rule, the city flourished as an important cultural center with magnificent buildings and monuments, many of which still stand today.",
    attractions: "Ak-Saray Palace ruins (Timur's White Palace), Dorut Tilovat complex (Kok Gumbaz Mosque and Dorut Saodat), Jahongir Mausoleum, Dorus-Siadat Mausoleum, Chor-su trading dome, Statue of Amir Timur, local bazaars.",
    culture: "Shakhrisabz maintains traditional Uzbek culture with specialties in embroidery (particularly suzani), carpet weaving, and woodcarving. The city celebrates its connection to Timur with cultural events and festivals. Local cuisine features traditional Uzbek dishes with regional variations specific to the southern regions."
  }
};

// Function to get similar tours based on destination
const getSimilarTours = (destinationName: string): any[] => {
  // This would be replaced with actual API call in a real implementation
  const mockTours = [
    {
      id: 1,
      title: `Last minute tour to ${destinationName}`,
      duration: "4 Days",
      price: "$189",
      image: `/images/${destinationName.toLowerCase().replace(/\s+/g, '-')}.jpg`
    },
    {
      id: 2,
      title: `${destinationName} Weekend Special`,
      duration: "3 Days",
      price: "$159",
      image: `/images/${destinationName.toLowerCase().replace(/\s+/g, '-')}.jpg`
    },
    {
      id: 3,
      title: `Explore ${destinationName} with Family`,
      duration: "5 Days",
      price: "$219",
      image: `/images/${destinationName.toLowerCase().replace(/\s+/g, '-')}.jpg`
    }
  ];
  
  return mockTours;
};

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [toursLoading, setToursLoading] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    isDestinationInWishlist, 
    addDestinationToWishlist, 
    removeDestinationFromWishlist 
  } = useWishlist();
  
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make sure we have an ID
        if (!id) {
          setError('No destination ID provided');
          setLoading(false);
          return;
        }
        
        // Make sure id is a valid number
        const destId = parseInt(id);
        
        if (isNaN(destId)) {
          console.error('Invalid destination ID:', id);
          setError(`Invalid destination ID: ${id}`);
          setLoading(false);
          return;
        }
        
        console.log(`Fetching destination with ID: ${destId}`);
        
        // Use our safer API request function that properly handles errors
        const response = await safeApiRequest('GET', `/api/destinations/${destId}`);
        
        if (!response.ok) {
          console.error('Error with API request:', response.status);
          
          // Create a more specific error message based on HTTP status
          if (response.status === 404) {
            setError(`Destination with ID ${destId} was not found`);
          } else {
            setError(`API returned error status: ${response.status}`);
          }
          return;
        }
        
        const data = response.data;
        
        // Verify we received valid data
        if (!data || !data.name) {
          setError('Invalid destination data returned from API');
          return;
        }
        
        setDestination(data);
        
        // After successfully setting destination data, fetch related tours
        fetchRelatedTours();
      } catch (error: any) {
        console.error('Error in overall fetch process:', error);
        setError(error.message || 'Could not load destination details');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRelatedTours = async () => {
      try {
        setToursLoading(true);
        
        // Use our safer API request function
        const response = await safeApiRequest('GET', '/api/tours');
        
        if (!response.ok) {
          console.error('Error fetching related tours:', response.status);
          return;
        }
        
        // Filter tours featuring this destination (simplified approach)
        const allTours = response.data;
        setTours(allTours.slice(0, 3)); // Take first 3 tours as an example
      } catch (error) {
        console.error('Error fetching related tours:', error);
      } finally {
        setToursLoading(false);
      }
    };

    if (id) {
      fetchDestination();
    }
  }, [id]);

  const toggleWishlist = () => {
    if (!destination) return;
    
    // Use the destination.id directly instead of parsing from URL parameter
    const destId = destination.id;
    
    if (isDestinationInWishlist(destId)) {
      removeDestinationFromWishlist(destId);
    } else {
      addDestinationToWishlist(destination);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg mb-8"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded-lg w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded-lg mb-3"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded-lg mb-3"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded-lg mb-3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4 text-red-700">{t("destinations.notFound")}</h1>
          <p className="text-red-600 mb-2">{t("destinations.notFoundDesc")}</p>
          <p className="text-gray-600">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/destinations'}
          className="mt-4"
        >
          Go Back to All Destinations
        </Button>
      </div>
    );
  }
  
  if (!destination) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">{t("destinations.notFound")}</h1>
        <p>{t("destinations.notFoundDesc")}</p>
        <Button 
          onClick={() => window.location.href = '/destinations'}
          className="mt-4"
        >
          Go Back to All Destinations
        </Button>
      </div>
    );
  }

  // Make sure destination.name exists and safely look for detailedInfo
  const destinationName = destination.name || "";
  let info = {
    history: "Historical information for this destination is coming soon.",
    attractions: "Attractions information for this destination is coming soon.",
    culture: "Cultural information for this destination is coming soon."
  };
  
  // Safely check if detailed info exists for this destination
  if (Object.keys(detailedInfo).includes(destinationName)) {
    info = detailedInfo[destinationName as keyof typeof detailedInfo];
  }

  // Safely check if video exists for this destination
  let videoSrc = "";
  if (Object.keys(videos).includes(destinationName)) {
    videoSrc = videos[destinationName as keyof typeof videos];
  }
  
  // Safely check if package details exist for this destination
  let packageInfo = null;
  if (Object.keys(packageDetails).includes(destinationName)) {
    packageInfo = packageDetails[destinationName as keyof typeof packageDetails];
  }
    
  // Get similar tours for this destination
  let similarTours = [];
  try {
    if (destination.name) {
      similarTours = getSimilarTours(destination.name);
    }
  } catch (error) {
    console.error("Error getting similar tours:", error);
    similarTours = [];
  }

  // Check if the logged-in user is a staff member
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  // Get proper image URL based on destination name
  const getDestinationImageUrl = (name: string) => {
    // Same image mapping as in DestinationCard component
    const realImages: Record<string, string> = {
      // Uzbekistan destinations
      "Samarkand": "https://images.unsplash.com/photo-1605138227395-4ef54c2adc51?w=1200&auto=format&fit=crop&q=80", // Registan Square
      "Bukhara": "https://images.unsplash.com/photo-1500394256170-63c53471c487?w=1200&auto=format&fit=crop&q=80", // Bukhara similar to Petra
      "Khiva": "https://images.unsplash.com/photo-1518730518541-d0843268c287?w=1200&auto=format&fit=crop&q=80", // Khiva fortress
      "Tashkent": "https://images.unsplash.com/photo-1578168629524-536ecdbd8ba0?w=1200&auto=format&fit=crop&q=80", // Architecture view
      "Nukus": "https://images.unsplash.com/photo-1525760238086-081429961c55?w=1200&auto=format&fit=crop&q=80", // Desert vista
      "Fergana Valley": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80", // Mountain valley
      "Shakhrisabz": "https://images.unsplash.com/photo-1504877210572-a45079144323?w=1200&auto=format&fit=crop&q=80", // Historical ruin
      "Termez": "https://images.unsplash.com/photo-1479293281180-2dcf2dcd0358?w=1200&auto=format&fit=crop&q=80", // Archaeological ruins
      "Chimgan Mountains": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80", // Mountain landscape
      "Aral Sea": "https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?w=1200&auto=format&fit=crop&q=80", // Dried landscape
      "Navoi": "https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=1200&auto=format&fit=crop&q=80", // Desert canyon
      
      // Kazakhstan destination
      "Almaty": "https://images.unsplash.com/photo-1504551399598-6c24a317a084?w=1200&auto=format&fit=crop&q=80", // Mountain landscape
      
      // Kyrgyzstan destination
      "Bishkek": "https://images.unsplash.com/photo-1484921897084-987b39f9fd7e?w=1200&auto=format&fit=crop&q=80" // Mountain vista
    };
    
    return name && realImages[name] ? realImages[name] : destination.image;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero section with destination image and title */}
      <div className="w-full h-[50vh] relative rounded-lg overflow-hidden mb-10">
        <img 
          src={getDestinationImageUrl(destination.name)} 
          alt={destination.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{destination.name}</h1>
            <p className="text-lg md:text-xl max-w-4xl text-gray-100">{destination.description}</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className={`absolute top-4 right-4 rounded-full bg-white/90 ${isDestinationInWishlist(destination.id) ? 'text-red-500' : 'text-gray-500'}`} 
            onClick={toggleWishlist}
          >
            <HeartIcon className={`h-5 w-5 ${isDestinationInWishlist(destination.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Main content with package details */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="lg:w-2/3">
          {packageInfo && (
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-3xl font-bold mb-4 md:mb-0">{t("destinations.tourPackage")}: {packageInfo.title}</h2>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-primary text-lg py-1.5 px-4">{t("destinations.from")} ${packageInfo.price}</Badge>
                  <Badge variant="outline" className="text-lg py-1.5 px-4">{t("destinations.perPerson")}</Badge>
                </div>
              </div>
              
              {/* Package highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 flex flex-col items-center text-center">
                  <CalendarIcon className="h-8 w-8 mb-2 text-primary" />
                  <p className="font-medium">{packageInfo.days} {t("destinations.days")}</p>
                  <p className="text-sm text-gray-500">{packageInfo.nights} {t("destinations.nights")}</p>
                </Card>
                <Card className="p-4 flex flex-col items-center text-center">
                  <MapPinIcon className="h-8 w-8 mb-2 text-primary" />
                  <p className="font-medium">{t("destinations.tourType")}</p>
                  <p className="text-sm text-gray-500">{packageInfo.tourType}</p>
                </Card>
                <Card className="p-4 flex flex-col items-center text-center">
                  <UserIcon className="h-8 w-8 mb-2 text-primary" />
                  <p className="font-medium">{t("destinations.minParticipants")}</p>
                  <p className="text-sm text-gray-500">{t("destinations.min")} {packageInfo.minPeople} {t("destinations.people")}</p>
                </Card>
                <Card className="p-4 flex flex-col items-center text-center">
                  <CircleDollarSignIcon className="h-8 w-8 mb-2 text-primary" />
                  <p className="font-medium">{t("destinations.price")}</p>
                  <p className="text-sm text-gray-500">${packageInfo.price} {t("destinations.perPerson")}</p>
                </Card>
              </div>
              
              {/* Book now button */}
              <div className="flex justify-center mb-10">
                <Link to={`/book-tour/${destination.id}`}>
                  <Button size="lg" className="px-8 py-6 text-lg">
                    {t("destinations.bookNow")}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              {/* Included/Not included */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">{t("destinations.included")}</h3>
                  <ul className="space-y-2">
                    {packageInfo.included.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">{t("destinations.notIncluded")}</h3>
                  <ul className="space-y-2">
                    {packageInfo.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-0.5 font-bold flex-shrink-0">×</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
              
              {/* Itinerary */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold mb-6">{t("destinations.itinerary")}</h3>
                <div className="space-y-6">
                  {packageInfo.itinerary.map((day, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <Badge className="md:py-2 md:px-4 text-base">
                          {t("destinations.day")} {day.day}
                        </Badge>
                        <h4 className="text-xl font-bold">{day.title}</h4>
                        {day.meals && (
                          <Badge variant="outline" className="md:ml-auto">
                            {t("destinations.meals")}: {day.meals}
                          </Badge>
                        )}
                      </div>
                      <p>{day.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Destination details tabs */}
          <Tabs defaultValue="info" className="mb-12">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="info">{t("destinations.detail.information")}</TabsTrigger>
              <TabsTrigger value="video">{t("destinations.detail.videos")}</TabsTrigger>
              <TabsTrigger value="gallery">{t("destinations.detail.gallery")}</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3">{t("destinations.detail.history")}</h3>
                  <p>{info.history}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3">{t("destinations.detail.attractions")}</h3>
                  <p>{info.attractions}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3">{t("destinations.detail.culture")}</h3>
                  <p>{info.culture}</p>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="video" className="mt-4">
              {videoSrc ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe 
                    src={videoSrc} 
                    title={`${destination.name} video`} 
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <p>{t("destinations.detail.noVideos")}</p>
              )}
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Generate multiple gallery images */}
                {Array.from({ length: 6 }).map((_, index) => {
                  // For first image use the main destination image
                  if (index === 0) {
                    return (
                      <img 
                        key={index}
                        src={getDestinationImageUrl(destination.name)} 
                        alt={`${destination.name} gallery ${index+1}`} 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    );
                  }
                  
                  // For other images, use alternate images based on destination name and index
                  const getDestinationGalleryImage = (name: string, index: number) => {
                    const galleryImages: Record<string, string[]> = {
                      "Samarkand": [
                        "https://images.unsplash.com/photo-1649188576833-e7623cb28990?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1636790230684-1d42b13a918f?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1604145559206-e3137bf35b6d?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1582831439779-a2626b1f3247?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1582739314791-68d7173c06ea?w=1200&auto=format&fit=crop&q=80"
                      ],
                      "Bukhara": [
                        "https://images.unsplash.com/photo-1564507446867-9d67fb929e5f?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1591854916063-d0f521d04bbb?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1614099863487-22e8e3f3e645?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1663403825751-1cfbd2dff31b?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1625241190260-507495913e7c?w=1200&auto=format&fit=crop&q=80"
                      ],
                      "Khiva": [
                        "https://images.unsplash.com/photo-1656431070037-00c881128bd5?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1665920253210-4eea19938ca2?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1665920253526-25b5e1b15345?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1602652321200-ac0632ct9d43?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1597419903847-b3ee1a3b2800?w=1200&auto=format&fit=crop&q=80"
                      ],
                      "Tashkent": [
                        "https://images.unsplash.com/photo-1665920321486-25b968aa0e2d?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1665920321351-a04b31f67bd9?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1665920341920-21312e559e2c?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1590611936239-2a5f997820f8?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1596306499197-ded1ad8f5887?w=1200&auto=format&fit=crop&q=80"
                      ],
                      "Fergana Valley": [
                        "https://images.unsplash.com/photo-1590322338250-07f43e72cbc3?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1590322174693-6083aa59c8cd?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1649782255186-681c321b65e7?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1663353662855-af23801b0d5d?w=1200&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1533577644878-9d5c5c7c1cb0?w=1200&auto=format&fit=crop&q=80"
                      ]
                    };
                    
                    // Return default image if we don't have specific gallery images
                    if (!galleryImages[name] || index >= galleryImages[name].length) {
                      return getDestinationImageUrl(name);
                    }
                    
                    return galleryImages[name][index];
                  };
                  
                  return (
                    <img 
                      key={index}
                      src={getDestinationGalleryImage(destination.name, index-1)} 
                      alt={`${destination.name} gallery ${index+1}`} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="hotels" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                {destinationName && Object.keys(hotels).includes(destinationName) ? (
                  hotels[destinationName as keyof typeof hotels].map((hotel, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="grid md:grid-cols-3 gap-4 p-0">
                        <div className="relative h-64 md:h-full">
                          <img 
                            src={hotel.image || getDestinationImageUrl(destination.name)} 
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if hotel image doesn't exist
                              (e.target as HTMLImageElement).src = getDestinationImageUrl(destination.name);
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-[#FF9800] text-white px-3 py-1 rounded-full font-bold text-sm">
                            ${hotel.pricePerNight} / night
                          </div>
                        </div>
                        <div className="p-6 md:col-span-2">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold">{hotel.name}</h3>
                            <div className="flex">
                              {Array.from({ length: hotel.stars }).map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{hotel.description}</p>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Amenities:</h4>
                            <div className="flex flex-wrap gap-2">
                              {hotel.amenities.map((amenity, i) => (
                                <Badge key={i} variant="outline" className="bg-gray-100">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-2">
                              <CircleDollarSignIcon className="text-[#FF9800] h-5 w-5" />
                              <span className="font-bold">${hotel.pricePerNight} per night</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline">
                                View Details
                              </Button>
                              <Button className="bg-[#FF9800] hover:bg-[#FF9800]/90">
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500 mb-4">No hotels available for this destination yet.</p>
                    <p className="text-sm text-gray-400">Please check back later for updates.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-1/3">
          {/* Last minute tours */}
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">{t("destinations.lastMinuteTours")}</h3>
            <div className="space-y-4">
              {similarTours.map((tour) => (
                <div key={tour.id} className="flex gap-4">
                  <img 
                    src={tour.image || getDestinationImageUrl(destination.name)} 
                    alt={tour.title} 
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      (e.target as HTMLImageElement).src = getDestinationImageUrl(destination.name);
                    }}
                  />
                  <div>
                    <h4 className="font-medium">{tour.title}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">{tour.price}</span>
                      <Button variant="outline" size="sm">
                        {t("destinations.details")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Worker actions section - only visible to staff */}
          {isStaff && (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">{t("destinations.staffActions")}</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  {t("destinations.viewBookings")}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {t("destinations.scheduleService")}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t("destinations.contactCustomers")}
                </Button>
                <Separator className="my-4" />
                <div className="text-sm">
                  <p className="text-gray-500 mb-2">{t("destinations.upcomingTours")}: 3</p>
                  <p className="text-gray-500">{t("destinations.pendingRequests")}: 2</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Similar destinations */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Similar Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {tours.slice(0, 4).map((tour) => (
            <Card key={tour.id} className="overflow-hidden group">
              <div className="relative h-56">
                <img 
                  src={tour.image || getDestinationImageUrl(destination.name)} 
                  alt={tour.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    (e.target as HTMLImageElement).src = getDestinationImageUrl(destination.name);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold">{tour.title}</h3>
                  <p className="text-sm">{tour.duration}</p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="font-bold">{tour.price}</span>
                <Link to={`/tours/${tour.id}`}>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}