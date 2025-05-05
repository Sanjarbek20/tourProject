import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { CalendarIcon, UserIcon, CreditCardIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Booking } from "@shared/schema";

// Extended Booking interface for dashboard display
interface DashboardBooking extends Booking {
  tourTitle?: string;
  price?: number;
}

interface BookingCardProps {
  booking: DashboardBooking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0">
      <div className="flex-1">
        <h3 className="font-medium">{booking.tourTitle || `Tour #${booking.tourId}`}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center mt-2 gap-2 sm:gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {new Date(booking.startDate).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4 mr-1" />
            {booking.numberOfPeople} {t("userDashboard.people")}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <CreditCardIcon className="h-4 w-4 mr-1" />
            {(booking.paymentMethod || "card").toUpperCase()}
          </div>
        </div>
      </div>
      <div className="mt-3 sm:mt-0 flex flex-col sm:items-end gap-2">
        <Badge 
          variant={booking.status === 'confirmed' ? 'default' : 'outline'}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
        <span className="text-sm font-medium">${booking.price || '--'}</span>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/my-bookings/${booking.id}`}>
            {t("userDashboard.details")}
          </Link>
        </Button>
      </div>
    </div>
  );
}