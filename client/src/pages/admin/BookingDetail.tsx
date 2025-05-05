import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Save, Calendar, Users, Phone, Mail, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

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
    price: string;
    duration: string;
    image: string;
  };
}

type BookingStatus = "pending" | "confirmed" | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "refunded";

export default function BookingDetail() {
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  // State for form
  const [status, setStatus] = useState<BookingStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [notes, setNotes] = useState("");
  const [assignedToId, setAssignedToId] = useState<number | null>(null);
  
  // Get staff members
  const { data: staffMembers, isLoading: isLoadingStaff } = useQuery<User[]>({
    queryKey: ["/api/users/staff"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/staff");
      return await res.json();
    },
  });

  // Get booking by ID
  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ["/api/bookings", params.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/bookings/${params.id}`);
      return await res.json();
    },
  });

  // Update state when data is loaded
  useEffect(() => {
    if (booking) {
      setStatus(booking.status as BookingStatus);
      setPaymentStatus(booking.paymentStatus as PaymentStatus);
      setNotes(booking.notes || "");
      setAssignedToId(booking.assignedToId || null);
    }
  }, [booking]);
  
  // Assign to worker mutation
  const assignToWorkerMutation = useMutation({
    mutationFn: async (data: { workerId: number | null }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/bookings/${params.id}/assign`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Buyurtma ishchiga biriktirildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/bookings/${params.id}/status`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Buyurtma statusi yangilandi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (data: { paymentStatus: string }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/bookings/${params.id}/payment-status`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "To'lov statusi yangilandi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (data: { notes: string }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/bookings/${params.id}/notes`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Eslatmalar yangilandi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", params.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle status update
  const handleStatusUpdate = () => {
    if (booking && booking.status !== status) {
      updateStatusMutation.mutate({ status });
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = () => {
    if (booking && booking.paymentStatus !== paymentStatus) {
      updatePaymentStatusMutation.mutate({ paymentStatus });
    }
  };

  // Handle notes update
  const handleNotesUpdate = () => {
    updateNotesMutation.mutate({ notes });
  };
  
  // Handle assign worker
  const handleAssignWorker = () => {
    assignToWorkerMutation.mutate({ workerId: assignedToId });
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/bookings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Buyurtma topilmadi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/bookings")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Orqaga
        </Button>
        <h1 className="text-2xl font-bold ml-4">Buyurtma #{booking.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Buyurtma ma'lumotlari</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")} da qabul qilingan
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {formatStatus(booking.status)}
                  </Badge>
                  <Badge variant={getPaymentStatusBadgeVariant(booking.paymentStatus)}>
                    {formatPaymentStatus(booking.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Mijoz ismi</p>
                    <p className="font-medium">{booking.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Boshlanish sanasi</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(booking.startDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.phone}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Tour</p>
                    <p className="font-medium">
                      {booking.tour?.title || `Tour #${booking.tourId}`}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Odamlar soni</p>
                    <p className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.numberOfPeople} kishi
                    </p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Maxsus so'rovlar</p>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                      <p style={{ whiteSpace: "pre-wrap" }}>{booking.specialRequests}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buyurtma statusini yangilash</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Status</label>
                  <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statusni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="confirmed">Tasdiqlangan</SelectItem>
                      <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleStatusUpdate}
                  disabled={updateStatusMutation.isPending || booking.status === status}
                >
                  {updateStatusMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>To'lov statusini yangilash</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">To'lov statusi</label>
                  <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="To'lov statusini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">To'lanmagan</SelectItem>
                      <SelectItem value="paid">To'langan</SelectItem>
                      <SelectItem value="refunded">Qaytarilgan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handlePaymentStatusUpdate}
                  disabled={updatePaymentStatusMutation.isPending || booking.paymentStatus === paymentStatus}
                >
                  {updatePaymentStatusMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ishchiga biriktirish</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Ishchi</label>
                  <Select 
                    value={assignedToId?.toString() || ""} 
                    onValueChange={(value) => setAssignedToId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ishchini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Ishchi tanlanmagan --</SelectItem>
                      {staffMembers?.filter(user => user.role === 'staff').map((staff) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {booking.assignedTo && (
                    <div className="mt-2 p-2 bg-secondary/20 rounded flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">
                        Hozirda <span className="font-medium">{booking.assignedTo.fullName}</span> ga biriktirilgan
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleAssignWorker}
                  disabled={assignToWorkerMutation.isPending || 
                    (booking.assignedToId === assignedToId)}
                >
                  {assignToWorkerMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <UserCheck className="h-4 w-4 mr-2" />
                  Ishchiga biriktirish
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eslatmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Bu mijoz haqida eslatmalar yozing..."
                  className="min-h-[120px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <Button
                  className="w-full"
                  onClick={handleNotesUpdate}
                  disabled={updateNotesMutation.isPending}
                >
                  {updateNotesMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}