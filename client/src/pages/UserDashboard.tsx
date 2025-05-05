import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  CreditCardIcon, 
  HeartIcon, 
  LandmarkIcon, 
  MapPinIcon, 
  TicketIcon, 
  UserIcon,
  PlaneLandingIcon,
  MapIcon,
  TrendingUpIcon,
  CompassIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { Tour, Booking } from "@shared/schema";
import { TravelInsightCard, TravelInsight } from "@/components/dashboard/TravelInsightCard";
import { BookingCard } from "@/components/dashboard/BookingCard";
import { TourRecommendationCard } from "@/components/dashboard/TourRecommendationCard";

// Types for user dashboard data
interface UserStats {
  toursBooked: number;
  destinationsVisited: number;
  totalSpent: number;
  loyaltyPoints: number;
  upcomingTrips: number;
  completedTrips: number;
  wishlistItems: number;
}

// TravelInsight is already imported above

interface UserDashboardData {
  stats: UserStats;
  recentBookings: Booking[];
  recommendedTours: Tour[];
  travelInsights: TravelInsight[];
  preferredDestinations: string[];
  travelStyle: {
    adventure: number;
    cultural: number;
    relaxation: number;
    nature: number;
    urban: number;
  };
}

export default function UserDashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to auth page
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch this from an API
        const response = await apiRequest("GET", "/api/user/dashboard");
        
        if (!response.ok) {
          throw new Error("Failed to fetch user dashboard data");
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: t("userDashboard.fetchError"),
          description: t("userDashboard.fetchErrorDesc"),
          variant: "destructive",
        });
        
        // For now, use mock data for demonstration
        setDashboardData(getMockDashboardData());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate, toast, t]);

  // This function provides mock data for demonstration
  // In a real implementation, you would remove this and use actual API data
  const getMockDashboardData = (): UserDashboardData => {
    return {
      stats: {
        toursBooked: 5,
        destinationsVisited: 3,
        totalSpent: 2450,
        loyaltyPoints: 320,
        upcomingTrips: 2,
        completedTrips: 3,
        wishlistItems: 8
      },
      recentBookings: [
        {
          // Standard Booking fields
          id: 101,
          tourId: 1,
          fullName: user?.fullName || "Guest User",
          email: "user@example.com",
          phone: "+1 555-123-4567",
          numberOfPeople: 2,
          startDate: new Date("2025-06-15"),
          status: "confirmed",
          paymentStatus: "paid",
          createdAt: new Date("2025-04-01"),
          paymentMethod: "visa",
          depositPaid: true,
          specialRequests: null,
          assignedToId: null,
          completedAt: null,
          notes: null,
          updatedAt: null,
          // Extended fields for dashboard
          tourTitle: "Silk Road Expedition",
          price: 899,
        } as any,
        {
          // Standard Booking fields
          id: 102,
          tourId: 3,
          fullName: user?.fullName || "Guest User",
          email: "user@example.com",
          phone: "+1 555-123-4567",
          numberOfPeople: 1,
          startDate: new Date("2025-07-22"),
          status: "pending",
          paymentStatus: "deposit",
          createdAt: new Date("2025-03-15"),
          paymentMethod: "cash",
          depositPaid: true,
          specialRequests: "Vegetarian meals, please",
          assignedToId: null,
          completedAt: null,
          notes: null,
          updatedAt: null,
          // Extended fields for dashboard
          tourTitle: "Tashkent City Break",
          price: 599,
        } as any,
      ],
      recommendedTours: [
        {
          // Standard Tour fields
          id: 2,
          title: "Uzbekistan Highlights",
          description: "Experience the best of Uzbekistan in this guided tour of the country's major cultural and historical sites.",
          price: "$799",
          duration: "8 days",
          image: "/images/uzbekistan-highlights.jpg",
          featured: true,
          cities: "Tashkent, Samarkand, Bukhara",
          category: "Cultural",
          maxPeople: 15,
          rating: "4.8",
          // Extended fields for dashboard
          destinations: ["Tashkent", "Samarkand", "Bukhara"],
          difficulty: "Easy",
          languages: ["English", "Russian", "Uzbek"]
        } as any,
        {
          // Standard Tour fields
          id: 5,
          title: "Aral Sea Adventure",
          description: "Witness the environmental changes and natural beauty of the Aral Sea region in this unique expedition.",
          price: "$1299",
          duration: "6 days",
          image: "/images/aral-sea.jpg",
          featured: false,
          cities: "Nukus, Aral Sea, Muynak",
          category: "Adventure",
          maxPeople: 8,
          rating: "4.6",
          // Extended fields for dashboard
          destinations: ["Nukus", "Aral Sea", "Muynak"],
          difficulty: "Moderate",
          languages: ["English", "Russian"]
        } as any,
      ],
      travelInsights: [
        {
          id: 1,
          title: "Best time to visit Samarkand",
          description: "Spring (April-May) and autumn (September-October) offer the most pleasant weather for exploring Samarkand's historic sites.",
          type: 'tip',
          category: 'seasonal',
          relevanceScore: 95,
          imageUrl: "/images/samarkand.jpg"
        },
        {
          id: 2,
          title: "Trending: Chimgan Mountains",
          description: "More travelers are discovering the natural beauty and outdoor activities in the Chimgan Mountains, especially for winter sports.",
          type: 'destination',
          category: 'trending',
          relevanceScore: 88,
          imageUrl: "/images/chimgan.jpg"
        },
        {
          id: 3,
          title: "Cultural Festival Calendar",
          description: "Plan your trip around Uzbekistan's rich cultural festivals to experience traditional music, dance, and crafts.",
          type: 'tip',
          category: 'cultural',
          relevanceScore: 82,
          imageUrl: "/images/festival.jpg"
        }
      ],
      preferredDestinations: ["Samarkand", "Bukhara", "Tashkent", "Mountains", "Historical sites"],
      travelStyle: {
        adventure: 65,
        cultural: 90,
        relaxation: 40,
        nature: 75,
        urban: 60
      }
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{t("userDashboard.noData")}</h1>
        <p>{t("userDashboard.noDataDesc")}</p>
        <Button className="mt-6" asChild>
          <Link to="/">{t("userDashboard.backHome")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("userDashboard.welcome")}, {user?.fullName || user?.username}</h1>
          <p className="text-muted-foreground">{t("userDashboard.lastLogin")}: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {dashboardData.stats.destinationsVisited} {t("userDashboard.placesVisited")}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <TicketIcon className="h-4 w-4 mr-1" />
            {dashboardData.stats.loyaltyPoints} {t("userDashboard.loyaltyPoints")}
          </Badge>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("userDashboard.upcomingTrips")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardData.stats.upcomingTrips}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/my-bookings" className="text-sm text-blue-600 hover:underline">
              {t("userDashboard.viewAll")} →
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("userDashboard.completedTrips")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardData.stats.completedTrips}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/my-bookings?tab=completed" className="text-sm text-blue-600 hover:underline">
              {t("userDashboard.viewHistory")} →
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("userDashboard.wishlistItems")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardData.stats.wishlistItems}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/wishlist" className="text-sm text-blue-600 hover:underline">
              {t("userDashboard.manageWishlist")} →
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("userDashboard.totalSpent")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${dashboardData.stats.totalSpent}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <span className="text-sm text-muted-foreground">
              {t("userDashboard.acrossTours", { count: dashboardData.stats.toursBooked })}
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Travel insights and bookings */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("userDashboard.travelInsights")}</CardTitle>
              <CardDescription>
                {t("userDashboard.personalizedRecommendations")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData.travelInsights.map((insight) => (
                  <TravelInsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onClick={() => console.log("Learn more about", insight.title)}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button variant="outline">
                {t("userDashboard.viewMoreInsights")}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("userDashboard.yourBookings")}</CardTitle>
              <CardDescription>
                {t("userDashboard.recentAndUpcoming")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData.recentBookings.length > 0 ? dashboardData.recentBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                )) : (
                  <div className="text-center py-8">
                    <LandmarkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">{t("userDashboard.noBookings")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("userDashboard.startBooking")}
                    </p>
                    <Button asChild>
                      <Link to="/tours">
                        {t("userDashboard.exploreTours")}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            {dashboardData.recentBookings.length > 0 && (
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline" asChild>
                  <Link to="/my-bookings">
                    {t("userDashboard.viewAllBookings")}
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right side - Travel profile and recommendations */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("userDashboard.travelProfile")}</CardTitle>
              <CardDescription>
                {t("userDashboard.basedOnHistory")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Travel style */}
              <div>
                <h3 className="text-sm font-medium mb-4">{t("userDashboard.travelStyle")}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{t("userDashboard.adventure")}</span>
                      <span className="text-sm">{dashboardData.travelStyle.adventure}%</span>
                    </div>
                    <Progress value={dashboardData.travelStyle.adventure} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{t("userDashboard.cultural")}</span>
                      <span className="text-sm">{dashboardData.travelStyle.cultural}%</span>
                    </div>
                    <Progress value={dashboardData.travelStyle.cultural} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{t("userDashboard.relaxation")}</span>
                      <span className="text-sm">{dashboardData.travelStyle.relaxation}%</span>
                    </div>
                    <Progress value={dashboardData.travelStyle.relaxation} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{t("userDashboard.nature")}</span>
                      <span className="text-sm">{dashboardData.travelStyle.nature}%</span>
                    </div>
                    <Progress value={dashboardData.travelStyle.nature} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{t("userDashboard.urban")}</span>
                      <span className="text-sm">{dashboardData.travelStyle.urban}%</span>
                    </div>
                    <Progress value={dashboardData.travelStyle.urban} className="h-2" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Preferred destinations */}
              <div>
                <h3 className="text-sm font-medium mb-3">{t("userDashboard.preferredDestinations")}</h3>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.preferredDestinations.map((dest, i) => (
                    <Badge key={i} variant="secondary">
                      {dest}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" size="sm">
                {t("userDashboard.updatePreferences")}
              </Button>
              <Button variant="ghost" size="sm">
                {t("userDashboard.takeSurvey")}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("userDashboard.recommendations")}</CardTitle>
              <CardDescription>
                {t("userDashboard.basedOnProfile")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recommendedTours.map((tour) => (
                  <TourRecommendationCard key={tour.id} tour={tour} />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button variant="outline" asChild>
                <Link to="/tours">
                  {t("userDashboard.exploreMoreTours")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}