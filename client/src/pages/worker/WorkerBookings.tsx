import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { Routes } from "@/routes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Search, Eye, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: number;
  tourId: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  startDate: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  specialRequests?: string | null;
  notes?: string | null;
  tourName?: string;
}

export default function WorkerBookings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: bookings, isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ["/api/worker/bookings"],
  });
  
  // Mutation for completing a booking
  const completeBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PATCH", `/api/worker/bookings/${bookingId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('booking.completed_success'),
        description: t('booking.status_updated'),
        variant: "default",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/stats"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: t('booking.update_failed'),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for canceling a booking
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("PATCH", `/api/worker/bookings/${bookingId}/cancel`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('booking.cancelled_success'),
        description: t('booking.status_updated'),
        variant: "default",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/stats"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: t('booking.update_failed'),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Define tour interface
  interface Tour {
    id: number;
    title: string;
    description: string;
    price: string;
    duration: string;
    image: string;
    rating: string;
    category: string;
    featured: boolean;
  }
  
  // Fetch tour data to display tour names
  const { data: tours } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });
  
  // Process bookings to include tour names
  const processedBookings = bookings?.map(booking => {
    const tour = tours?.find((t: Tour) => t.id === booking.tourId);
    return {
      ...booking,
      tourName: tour?.title || `Tour #${booking.tourId}`
    };
  }) || [];
  
  // Filter processed bookings
  const filteredBookings = processedBookings?.filter(booking => 
    booking.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.tourName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.id.toString().includes(searchQuery)
  ) || [];
  
  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerHeader />
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <WorkerHeader />
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{t('worker.assigned_bookings')}</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('worker.manage_bookings')}</CardTitle>
            <CardDescription>
              {t('worker.view_manage_bookings')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('worker.search_bookings')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {filteredBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('booking.id')}</TableHead>
                    <TableHead>{t('booking.customer')}</TableHead>
                    <TableHead>{t('booking.tour')}</TableHead>
                    <TableHead>{t('booking.date')}</TableHead>
                    <TableHead>{t('booking.status')}</TableHead>
                    <TableHead>{t('booking.persons')}</TableHead>
                    <TableHead>{t('booking.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>{booking.fullName}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={booking.tourName}>
                        {booking.tourName}
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.startDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(booking.status)}>
                          {t(`booking.status.${booking.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.numberOfPeople}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={Routes.WORKER_BOOKING_DETAIL(booking.id)}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {t('booking.view')}
                            </Button>
                          </Link>
                          
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                onClick={() => completeBookingMutation.mutate(booking.id)}
                                disabled={completeBookingMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                                {t('booking.complete')}
                              </Button>
                              
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="flex items-center gap-1"
                                onClick={() => cancelBookingMutation.mutate(booking.id)}
                                disabled={cancelBookingMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                                {t('booking.cancel')}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-1">
                  {t('worker.no_bookings_found')}
                </h3>
                <p>{t('worker.try_different_search')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}