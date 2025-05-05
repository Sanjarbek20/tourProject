import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, CheckCircle2, ClipboardList } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: number;
  fullName: string;
  tourId: number;
  email: string;
  phone: string;
  numberOfPeople: number;
  startDate: string;
  status: string;
  createdAt: string;
  tourName?: string; // Added to store tour title when mapping data
}

interface WorkerStats {
  workerName?: string;
  todayBookingsCount: number;
  completedBookingsCount: number;
  recentBookings: Booking[];
}

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const { data: stats, isLoading, error } = useQuery<WorkerStats>({
    queryKey: ["/api/worker/stats"],
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error('Worker stats error:', error);
    }
  }, [error]);
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerHeader />
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[70vh] flex-col">
          <div className="text-red-500 mb-4">Error loading worker data</div>
          <div className="text-sm text-gray-500">Please try refreshing the page</div>
        </div>
      </div>
    );
  }
  
  // Show loading state
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
  
  // If no stats but no error either, show empty state
  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <WorkerHeader />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">
            {t('worker.welcome_message', { name: user?.fullName || t('worker.staff') })}
          </h1>
          <div className="text-center py-8">
            {t('worker.no_data_available')}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <WorkerHeader />
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">
          {t('worker.welcome_message', { name: user?.fullName || t('worker.staff') })}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('worker.today_bookings')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayBookingsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('worker.for_today')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('worker.completed_services')}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedBookingsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('worker.total_completed')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('worker.assigned_bookings')}
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentBookings?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('worker.recent_bookings')}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('worker.recent_bookings')}</CardTitle>
            <CardDescription>
              {t('worker.last_bookings_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('booking.id')}</TableHead>
                    <TableHead>{t('booking.customer')}</TableHead>
                    <TableHead>{t('booking.tour')}</TableHead>
                    <TableHead>{t('booking.date')}</TableHead>
                    <TableHead>{t('booking.status')}</TableHead>
                    <TableHead>{t('booking.persons')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>{booking.fullName}</TableCell>
                      <TableCell>{booking.tourName || `Tour #${booking.tourId}`}</TableCell>
                      <TableCell>
                        {format(new Date(booking.startDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            booking.status === 'completed' 
                              ? 'bg-green-500 hover:bg-green-600'
                              : booking.status === 'pending' 
                                ? '' 
                                : ''
                          }
                          variant={
                            booking.status === 'completed' ? 'default' :
                            booking.status === 'pending' ? 'outline' : 'destructive'
                          }
                        >
                          {t(`booking.status.${booking.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.numberOfPeople}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {t('worker.no_recent_bookings')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}