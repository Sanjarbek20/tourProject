import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { Routes } from "@/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ArrowLeft,
  User,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: number;
  tourId: number;
  tourName?: string; // Will be populated on client side
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
  paymentStatus?: string;
  totalAmount?: string;
  paymentMethod?: 'plastic' | 'visa' | 'cash';
  paymentDetails?: string | null;
  depositPaid?: boolean;
}

export default function WorkerBookingDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [_, params] = useRoute("/worker/bookings/:id");
  const bookingId = params?.id ? parseInt(params.id) : 0;
  
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
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
    destination?: string;
  }
  
  // Fetch booking data
  const { data: booking, isLoading: bookingLoading } = useQuery<Booking>({
    queryKey: ["/api/worker/bookings", bookingId],
  });
  
  // Fetch tour data if booking exists
  const { data: tour, isLoading: tourLoading } = useQuery<Tour>({
    queryKey: ["/api/tours", booking?.tourId],
    enabled: !!booking?.tourId,
  });
  
  // Combined loading state
  const isLoading = bookingLoading || tourLoading;
  
  // Set initial values when booking data is loaded
  if (booking && !status) {
    setStatus(booking.status);
    setNotes(booking.notes || "");
  }
  
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest("PATCH", `/api/worker/bookings/${bookingId}/status`, {
        status: newStatus,
      });
    },
    onSuccess: () => {
      toast({
        title: t('booking.status_updated'),
        description: t('booking.status_updated_desc'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/stats"] });
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: t('error.status_update_failed'),
        variant: "destructive",
      });
    },
  });
  
  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      return await apiRequest("PATCH", `/api/worker/bookings/${bookingId}/notes`, {
        notes: newNotes,
      });
    },
    onSuccess: () => {
      toast({
        title: t('booking.notes_updated'),
        description: t('booking.notes_updated_desc'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings", bookingId] });
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: t('error.notes_update_failed'),
        variant: "destructive",
      });
    },
  });
  
  const updateDepositStatusMutation = useMutation({
    mutationFn: async (depositPaid: boolean) => {
      return await apiRequest("PATCH", `/api/worker/bookings/${bookingId}/deposit`, {
        depositPaid,
      });
    },
    onSuccess: () => {
      toast({
        title: "Deposit status updated",
        description: "The deposit status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings"] });
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: "Failed to update deposit status.",
        variant: "destructive",
      });
    },
  });
  
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (paymentStatus: string) => {
      return await apiRequest("PATCH", `/api/worker/bookings/${bookingId}/payment-status`, {
        paymentStatus,
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment status updated",
        description: "The payment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/bookings"] });
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });
  
  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await updateStatusMutation.mutateAsync(newStatus);
  };
  
  const handleSaveNotes = async () => {
    await updateNotesMutation.mutateAsync(notes);
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
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
  
  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerHeader />
        <div className="container mx-auto p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">{t('booking.not_found')}</h1>
          <p className="mb-6 text-muted-foreground">{t('booking.not_found_desc')}</p>
          <Link href={Routes.WORKER_BOOKINGS}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('booking.back_to_bookings')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <WorkerHeader />
      
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href={Routes.WORKER_BOOKINGS}>
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('booking.back')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{t('booking.booking_details')} #{booking.id}</h1>
          </div>
          <Badge variant={getStatusVariant(booking.status)} className="text-sm px-3 py-1">
            {getStatusIcon(booking.status)}
            <span className="ml-1">{t(`booking.status.${booking.status}`)}</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('booking.tour_information')}</CardTitle>
                <CardDescription>
                  {t('booking.tour_details')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">{t('booking.tour')}</h3>
                    <p className="text-lg">{tour?.title || `Tour #${booking.tourId}`}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{t('booking.destination')}</h3>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{tour?.destination || t('booking.not_specified')}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{t('booking.booking_date')}</h3>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{format(new Date(booking.startDate), 'PPP')}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{t('booking.persons')}</h3>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{booking.numberOfPeople} {t('booking.people')}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{t('booking.price')}</h3>
                    <p className="text-lg font-bold">
                      {booking.totalAmount || 
                        (tour?.price ? `${tour.price} × ${booking.numberOfPeople}` : t('booking.price_not_set'))
                      }
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{t('booking.payment_method')}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {booking.paymentMethod || 'Unknown'}
                    </Badge>
                    {booking.paymentMethod === 'cash' && (
                      <Badge variant={booking.depositPaid ? "success" : "outline"} className="ml-2">
                        {booking.depositPaid ? "Deposit paid" : "Deposit pending"}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{t('booking.payment_status')}</h3>
                    <Badge 
                      variant={
                        booking.paymentStatus === 'paid' ? 'success' : 
                        booking.paymentStatus === 'partially_paid' ? 'secondary' :
                        'outline'
                      }
                    >
                      {booking.paymentStatus === 'paid' ? 'Paid' : 
                       booking.paymentStatus === 'partially_paid' ? 'Partially paid' :
                       'Unpaid'}
                    </Badge>
                  </div>
                </div>
                
                {booking.specialRequests && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">{t('booking.special_requests')}</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-1" />
                        <p>{booking.specialRequests}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.booking_status')}</CardTitle>
                <CardDescription>{t('booking.update_booking_status')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="font-medium mb-3">{t('booking.change_status')}</h3>
                  <Select 
                    value={status} 
                    onValueChange={handleStatusChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('booking.select_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('booking.status.pending')}</SelectItem>
                      <SelectItem value="completed">{t('booking.status.completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('booking.status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {updateStatusMutation.isPending && (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">{t('booking.updating_status')}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">{t('booking.notes')}</h3>
                  <Textarea
                    placeholder={t('booking.add_notes')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <Button 
                    className="mt-3"
                    onClick={handleSaveNotes}
                    disabled={updateNotesMutation.isPending}
                  >
                    {updateNotesMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('booking.save_notes')}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                {t('booking.last_updated')} {format(new Date(), 'PPp')}
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('booking.customer_information')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{t('booking.name')}</h3>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{booking.fullName}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">{t('booking.contact')}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p>{booking.phone}</p>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p>{booking.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">{t('booking.booking_created')}</h3>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{format(new Date(booking.createdAt), 'PPp')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.quick_actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleStatusChange('completed')}
                  disabled={status === 'completed' || updateStatusMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('booking.mark_completed')}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={status === 'cancelled' || updateStatusMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {t('booking.mark_cancelled')}
                </Button>
                
                {/* Payment status actions */}
                <Separator className="my-3" />
                <h3 className="text-sm font-medium mb-2">Payment Actions</h3>
                
                {booking.paymentMethod === 'cash' && !booking.depositPaid && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => updateDepositStatusMutation.mutateAsync(true)}
                    disabled={updateDepositStatusMutation.isPending}
                  >
                    {updateDepositStatusMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    )}
                    Confirm 30% Deposit
                  </Button>
                )}
                
                {booking.paymentStatus !== 'paid' && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => updatePaymentStatusMutation.mutateAsync('paid')}
                    disabled={updatePaymentStatusMutation.isPending}
                  >
                    {updatePaymentStatusMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg 
                        className="mr-2 h-4 w-4 text-green-500"
                        width="15" 
                        height="15" 
                        viewBox="0 0 15 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M7.5 0C3.36 0 0 3.36 0 7.5C0 11.64 3.36 15 7.5 15C11.64 15 15 11.64 15 7.5C15 3.36 11.64 0 7.5 0ZM8.1 10.8H6.9V9.6H8.1V10.8ZM7.5 3C9.3 3 10.8 4.5 10.8 6.3H9.6C9.6 5.175 8.625 4.2 7.5 4.2C6.375 4.2 5.4 5.175 5.4 6.3C5.4 6.825 5.625 7.2 6.075 7.575L7.2 8.4C7.8 8.85 8.1 9.45 8.1 10.2H6.9C6.9 9.75 6.75 9.375 6.3 9.075L5.325 8.325C4.65 7.875 4.2 7.125 4.2 6.3C4.2 4.5 5.7 3 7.5 3Z" 
                          fill="currentColor" 
                        />
                      </svg>
                    )}
                    Mark as Fully Paid
                  </Button>
                )}
                
                {booking.paymentStatus === 'paid' && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => updatePaymentStatusMutation.mutateAsync('unpaid')}
                    disabled={updatePaymentStatusMutation.isPending}
                  >
                    {updatePaymentStatusMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                    )}
                    Mark as Unpaid
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}