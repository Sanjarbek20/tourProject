import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import { useEffect } from "react";

// Type for inquiry
interface Inquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  tour: string | null;
  createdAt: string;
  response: string | null;
  responseDate: string | null;
}

export default function AdminInquiries() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch inquiries
  const fetchInquiries = getQueryFn<Inquiry[]>({ on401: "throw" });
  const { data: inquiries, isLoading, error } = useQuery({
    queryKey: ["/api/inquiries"],
    queryFn: () => fetchInquiries("/api/inquiries"),
    enabled: isAuthenticated
  });

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-200 text-yellow-800 hover:bg-yellow-200";
      case "in_progress":
        return "bg-blue-200 text-blue-800 hover:bg-blue-200";
      case "resolved":
        return "bg-green-200 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-200 text-gray-800 hover:bg-gray-200";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tour Inquiries</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-500 mb-4">Failed to load inquiries</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : inquiries && inquiries.length > 0 ? (
          <div className="grid gap-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{inquiry.subject}</CardTitle>
                    <div className="text-sm text-gray-500">
                      By: {inquiry.name} &bull; {formatDate(inquiry.createdAt)}
                    </div>
                    {inquiry.tour && (
                      <div className="text-sm text-gray-500 mt-1">
                        Tour: {inquiry.tour}
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusColor(inquiry.status)}>
                    {inquiry.status === "in_progress" ? "In Progress" : 
                     inquiry.status === "pending" ? "Pending" : "Resolved"}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{inquiry.message}</p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setLocation(`/admin/inquiry/${inquiry.id}`)}
                      size="sm"
                    >
                      View & Respond
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No inquiries found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}