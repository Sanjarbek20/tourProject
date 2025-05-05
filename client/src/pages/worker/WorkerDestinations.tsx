import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Users,
  CalendarCheck,
  Clock,
  Star,
  ExternalLink,
} from "lucide-react";
import type { Destination } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for destination with additional statistics
interface DestinationWithStats extends Destination {
  bookingsCount: number;
  activeBookings: number;
  rating: number;
  mainImage: string; // For compatibility with our schema
  country: string;   // For compatibility with our schema
}

// Interface for the worker destination statistics
interface WorkerDestinationStats {
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  destinations: DestinationWithStats[];
}

export default function WorkerDestinations() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("all");

  // Fetch destinations
  const { data: destinations, isLoading: destinationsLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
    queryFn: () => fetch("/api/destinations").then((res) => res.json()),
  });

  // In a real application, we would fetch the statistics from a worker-specific endpoint
  // For now, we'll simulate the stats for demonstration
  const { data: destinationStats, isLoading: statsLoading } = useQuery<WorkerDestinationStats>({
    queryKey: ["/api/worker/destination-stats"],
    queryFn: () => {
      // This is a mock implementation. In a real app, this would be replaced with an actual API call
      return new Promise<WorkerDestinationStats>((resolve) => {
        setTimeout(() => {
          if (!destinations) {
            resolve({
              totalBookings: 0,
              activeBookings: 0,
              pendingBookings: 0,
              destinations: [],
            });
            return;
          }
          
          const mockStats: WorkerDestinationStats = {
            totalBookings: 48,
            activeBookings: 12,
            pendingBookings: 8,
            destinations: destinations.map((dest: Destination) => ({
              ...dest,
              bookingsCount: Math.floor(Math.random() * 15), // Random number for demonstration
              activeBookings: Math.floor(Math.random() * 5),
              rating: 3.5 + Math.random() * 1.5, // Random rating between 3.5 and 5
              mainImage: dest.image, // Map image to mainImage for compatibility
              country: "Uzbekistan", // Default country
            })),
          };
          resolve(mockStats);
        }, 800); // Simulate network delay
      });
    },
    enabled: !!destinations, // Only run this query when destinations are loaded
  });

  const getFilteredDestinations = () => {
    if (!destinationStats) return [];
    
    switch (selectedTab) {
      case "active":
        return destinationStats.destinations.filter(dest => dest.activeBookings > 0);
      case "popular":
        return [...destinationStats.destinations].sort((a, b) => b.bookingsCount - a.bookingsCount).slice(0, 5);
      case "all":
      default:
        return destinationStats.destinations;
    }
  };

  const filteredDestinations = getFilteredDestinations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("worker.destinations.title")}</h1>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("worker.destinations.totalBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{destinationStats?.totalBookings || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("worker.destinations.activeBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-green-600">
                {destinationStats?.activeBookings || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("worker.destinations.pendingBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-amber-500">
                {destinationStats?.pendingBookings || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering destinations */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Destinations</TabsTrigger>
          <TabsTrigger value="active">Active Bookings</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsLoading || destinationsLoading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : filteredDestinations.length === 0 ? (
          <div className="col-span-full flex justify-center p-8">
            <p className="text-lg text-muted-foreground">No destinations match your filter criteria.</p>
          </div>
        ) : (
          filteredDestinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden flex flex-col">
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${destination.mainImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{destination.name}</CardTitle>
                  <Badge variant={destination.activeBookings > 0 ? "default" : "outline"}>
                    {destination.activeBookings > 0 ? "Active" : "No Active Bookings"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {destination.country || 'Uzbekistan'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" /> {t("worker.destinations.bookings")}
                    </span>
                    <span className="font-medium">{destination.bookingsCount}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-4 w-4" /> {t("worker.destinations.rating")}
                    </span>
                    <span className="font-medium">{destination.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/destinations/${destination.id}`}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {t("worker.destinations.viewDetails")}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}