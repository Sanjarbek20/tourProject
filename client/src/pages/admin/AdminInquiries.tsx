import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

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

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  tour?: string;
  status: string;
  response?: string;
  responseDate?: string;
  createdAt: string;
}

export default function AdminInquiries() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Get all inquiries
  const { data: inquiries, isLoading } = useQuery<ContactInquiry[]>({
    queryKey: ["/api/contact-inquiries"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/contact-inquiries");
      return await res.json();
    },
  });

  // Filter inquiries based on status
  const filteredInquiries = statusFilter
    ? inquiries?.filter((inquiry) => inquiry.status === statusFilter)
    : inquiries;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "destructive";
      case "in-progress":
        return "warning";
      case "completed":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">So'rovlar boshqaruvi</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">Status bo'yicha filtrlash:</span>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Barcha so'rovlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Barchasi</SelectItem>
              <SelectItem value="new">Yangi</SelectItem>
              <SelectItem value="in-progress">Jarayonda</SelectItem>
              <SelectItem value="completed">Yakunlangan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>So'rovlar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInquiries && filteredInquiries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Ism</TableHead>
                  <TableHead>Mavzu</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>{inquiry.id}</TableCell>
                    <TableCell>
                      {format(new Date(inquiry.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{inquiry.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {inquiry.subject}
                    </TableCell>
                    <TableCell>
                      {inquiry.tour || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                        {inquiry.status === "new"
                          ? "Yangi"
                          : inquiry.status === "in-progress"
                          ? "Jarayonda"
                          : "Yakunlangan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/inquiry/${inquiry.id}`}>
                        <Button size="sm" className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
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
              {statusFilter
                ? `${statusFilter} statusidagi so'rovlar topilmadi`
                : "Hech qanday so'rov topilmadi"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}