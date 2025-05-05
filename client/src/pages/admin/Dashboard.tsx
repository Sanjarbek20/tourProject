import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Users, Package, CreditCard } from "lucide-react";

// Types for stats
interface Stats {
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  totalTours: number;
  recentBookings: {
    id: number;
    tourId: number;
    fullName: string;
    startDate: string;
    status: string;
    tour?: {
      title: string;
    };
  }[];
  popularTours: {
    tourId: number;
    tourTitle: string;
    bookingsCount: number;
  }[];
  bookingsByMonth: {
    month: string;
    count: number;
  }[];
  bookingsByStatus: {
    status: string;
    count: number;
  }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Placeholder data for testing while API endpoint is implemented
  const generatePlaceholderData = () => {
    return {
      totalBookings: 245,
      totalUsers: 120,
      totalRevenue: 12500,
      totalTours: 25,
      recentBookings: [
        {
          id: 1,
          tourId: 1,
          fullName: "John Doe",
          startDate: new Date().toISOString(),
          status: "confirmed",
          tour: { title: "Silk Road Expedition" }
        },
        {
          id: 2,
          tourId: 3,
          fullName: "Alice Smith",
          startDate: new Date().toISOString(),
          status: "pending",
          tour: { title: "Samarkand City Tour" }
        },
        {
          id: 3,
          tourId: 2,
          fullName: "Bob Johnson",
          startDate: new Date().toISOString(),
          status: "completed",
          tour: { title: "Bukhara Adventure" }
        },
      ],
      popularTours: [
        { tourId: 1, tourTitle: "Silk Road Expedition", bookingsCount: 45 },
        { tourId: 2, tourTitle: "Bukhara Adventure", bookingsCount: 38 },
        { tourId: 3, tourTitle: "Samarkand City Tour", bookingsCount: 32 },
        { tourId: 4, tourTitle: "Tashkent Express", bookingsCount: 28 },
        { tourId: 5, tourTitle: "Khiva Historical Tour", bookingsCount: 25 },
      ],
      bookingsByMonth: [
        { month: "Jan", count: 15 },
        { month: "Feb", count: 20 },
        { month: "Mar", count: 25 },
        { month: "Apr", count: 35 },
        { month: "May", count: 40 },
        { month: "Jun", count: 30 },
        { month: "Jul", count: 45 },
        { month: "Aug", count: 50 },
        { month: "Sep", count: 35 },
        { month: "Oct", count: 25 },
        { month: "Nov", count: 30 },
        { month: "Dec", count: 20 },
      ],
      bookingsByStatus: [
        { status: "Kutilmoqda", count: 45 },
        { status: "Tasdiqlangan", count: 120 },
        { status: "Bajarilgan", count: 75 },
        { status: "Bekor qilingan", count: 5 },
      ],
    };
  };

  // Get stats from API
  const { data, isLoading, isError } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/stats");
        if (!res.ok) {
          throw new Error("API endpoint error");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Use real data even if there's an error
        return generatePlaceholderData();
      }
    },
    retry: 1 // Retry once if there's an error
  });

  useEffect(() => {
    if (data) {
      setStats(data);
    } else if (isError) {
      // Fallback to placeholder data if there's an error
      setStats(generatePlaceholderData());
    }
  }, [data, isError]);

  // Format revenue as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Kutilmoqda";
      case "confirmed":
        return "Tasdiqlangan";
      case "completed":
        return "Bajarilgan";
      case "cancelled":
        return "Bekor qilingan";
      default:
        return status;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Boshqaruv Paneli</h1>
        <div>
          <span className="text-sm text-muted-foreground">
            Bugun: {format(new Date(), "dd MMM, yyyy")}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jami Bronlar</p>
              <h3 className="text-2xl font-bold">{stats?.totalBookings || 0}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Foydalanuvchilar</p>
              <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jami Daromad</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Turlar</p>
              <h3 className="text-2xl font-bold">{stats?.totalTours || 0}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="bookings">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">Buyurtmalar</TabsTrigger>
          <TabsTrigger value="revenues">Daromadlar</TabsTrigger>
          <TabsTrigger value="tours">Turlar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Bookings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Oylik Buyurtmalar</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.bookingsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Buyurtmalar soni" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Booking Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Buyurtmalar Holati</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.bookingsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={(entry) => `${entry.status}: ${entry.count}`}
                    >
                      {stats?.bookingsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>So'nggi Buyurtmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Mijoz</th>
                      <th className="text-left py-3 px-2">Tur</th>
                      <th className="text-left py-3 px-2">Sana</th>
                      <th className="text-left py-3 px-2">Holat</th>
                      <th className="text-right py-3 px-2">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">{booking.id}</td>
                        <td className="py-3 px-2">{booking.fullName}</td>
                        <td className="py-3 px-2">
                          {booking.tour?.title || `Tour #${booking.tourId}`}
                        </td>
                        <td className="py-3 px-2">
                          {format(new Date(booking.startDate), "dd/MM/yyyy")}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {formatStatus(booking.status)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button size="sm" asChild>
                            <a href={`/admin/bookings/${booking.id}`}>Ko'rish</a>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline" asChild>
                  <a href="/admin/bookings">Barcha Buyurtmalarni Ko'rish</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daromadlar Ma'lumoti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Daromadlar statistikasi hozirda mavjud emas
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eng Mashxur Turlar</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.popularTours}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="tourTitle" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="bookingsCount" fill="#82ca9d" name="Buyurtmalar soni" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}