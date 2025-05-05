import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Loader2, Eye, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Booking {
  id: number;
  tourId: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  specialRequests?: string;
  startDate: string;
  status: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  assignedToId?: number;
  assignedTo?: User;
  tour?: {
    title: string;
  };
}

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export default function Bookings() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  // Get all bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bookings");
      return await res.json();
    },
  });
  
  // Get all staff members (workers)
  const { data: staffMembers, isLoading: isLoadingStaff } = useQuery<User[]>({
    queryKey: ["/api/users/staff"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/staff");
      return await res.json();
    },
  });
  
  // Assign booking to worker mutation
  const assignBookingMutation = useMutation({
    mutationFn: async ({ bookingId, workerId }: { bookingId: number; workerId: number }) => {
      const res = await apiRequest("POST", `/api/bookings/${bookingId}/assign`, { workerId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Buyurtma ishchiga biriktirildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsAssignDialogOpen(false);
      setSelectedBooking(null);
      setSelectedWorkerId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter bookings based on selected filters
  const filteredBookings = bookings?.filter((booking) => {
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesPaymentStatus = !paymentStatusFilter || booking.paymentStatus === paymentStatusFilter;
    return matchesStatus && matchesPaymentStatus;
  });

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get badge variant based on payment status
  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "unpaid":
        return "destructive";
      case "paid":
        return "success";
      case "refunded":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Kutilmoqda";
      case "confirmed":
        return "Tasdiqlangan";
      case "cancelled":
        return "Bekor qilingan";
      default:
        return status;
    }
  };

  // Format payment status text
  const formatPaymentStatus = (status: string) => {
    switch (status) {
      case "unpaid":
        return "To'lanmagan";
      case "paid":
        return "To'langan";
      case "refunded":
        return "Qaytarilgan";
      default:
        return status;
    }
  };

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyurtmalar boshqaruvi</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            <Select
              value={statusFilter || ""}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Barchasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Barchasi</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
                <SelectItem value="cancelled">Bekor qilingan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">To'lov:</span>
            <Select
              value={paymentStatusFilter || ""}
              onValueChange={(value) => setPaymentStatusFilter(value || null)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Barchasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Barchasi</SelectItem>
                <SelectItem value="unpaid">To'lanmagan</SelectItem>
                <SelectItem value="paid">To'langan</SelectItem>
                <SelectItem value="refunded">Qaytarilgan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyurtmalar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings && filteredBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Ism</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Boshlanish sanasi</TableHead>
                  <TableHead>Odamlar soni</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>To'lov holati</TableHead>
                  <TableHead>Ishchi</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>
                      {format(new Date(booking.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{booking.fullName}</TableCell>
                    <TableCell>
                      {booking.tour?.title || `Tour #${booking.tourId}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.startDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{booking.numberOfPeople}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {formatStatus(booking.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(booking.paymentStatus)}>
                        {formatPaymentStatus(booking.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.assignedTo ? (
                        <div className="flex items-center">
                          <span className="font-medium">{booking.assignedTo.fullName}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="ml-2"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setSelectedWorkerId(booking.assignedToId || null);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Ishchi biriktirish
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <Button size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          Ko'rish
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">
              {statusFilter || paymentStatusFilter
                ? "Tanlangan filtrlarga mos buyurtmalar topilmadi"
                : "Hech qanday buyurtma topilmadi"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assign Worker Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ishchi biriktirish</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <>
                  Buyurtma #{selectedBooking.id} - {selectedBooking.fullName} uchun 
                  {selectedBooking.tour?.title && ` "${selectedBooking.tour.title}" turi bo'yicha`} ishchi tanlang
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="worker" className="text-sm font-medium mb-2 block">
              Ishchi:
            </label>
            <Select
              value={selectedWorkerId?.toString() || ""}
              onValueChange={(value) => setSelectedWorkerId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ishchini tanlang" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStaff ? (
                  <div className="flex justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : staffMembers && staffMembers.length > 0 ? (
                  staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.fullName}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm">
                    Ishchilar topilmadi
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSelectedBooking(null);
                setSelectedWorkerId(null);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={() => {
                if (selectedBooking && selectedWorkerId) {
                  assignBookingMutation.mutate({
                    bookingId: selectedBooking.id,
                    workerId: selectedWorkerId,
                  });
                }
              }}
              disabled={!selectedWorkerId || assignBookingMutation.isPending}
            >
              {assignBookingMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}