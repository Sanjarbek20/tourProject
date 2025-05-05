import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

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

type Status = "new" | "in-progress" | "completed";

// Response schema
const responseSchema = z.object({
  response: z.string().min(10, "Javob kamida 10 ta belgidan iborat bo'lishi kerak"),
  status: z.enum(["new", "in-progress", "completed"]),
});

export default function InquiryDetail() {
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState<Status>("new");
  const [formError, setFormError] = useState<string | null>(null);

  // Get inquiry by ID
  const { data: inquiry, isLoading } = useQuery<ContactInquiry>({
    queryKey: ["/api/contact-inquiries", params.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/contact-inquiries/${params.id}`);
      return await res.json();
    },
  });

  // Update values when data is loaded
  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status as Status);
      setResponseText(inquiry.response || "");
    }
  }, [inquiry]);

  // Respond to inquiry mutation
  const respondMutation = useMutation({
    mutationFn: async (data: { response: string; status: string }) => {
      const res = await apiRequest(
        "POST", 
        `/api/contact-inquiries/${params.id}/respond`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "So'rovga javob berildi",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/contact-inquiries", params.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/contact-inquiries"] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submit
  const handleSubmit = () => {
    try {
      responseSchema.parse({ response: responseText, status });
      setFormError(null);
      
      respondMutation.mutate({
        response: responseText,
        status,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormError(error.errors[0].message);
      }
    }
  };

  // Get badge variant based on status
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

  // Format status text
  const formatStatus = (status: string) => {
    switch (status) {
      case "new":
        return "Yangi";
      case "in-progress":
        return "Jarayonda";
      case "completed":
        return "Yakunlangan";
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

  if (!inquiry) {
    return (
      <div className="container px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/inquiries")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center">So'rov topilmadi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/inquiries")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Orqaga
        </Button>
        <h1 className="text-2xl font-bold ml-4">So'rov #{inquiry.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>So'rov ma'lumotlari</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{inquiry.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(inquiry.createdAt), "dd/MM/yyyy HH:mm")} da yuborilgan
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                    {formatStatus(inquiry.status)}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Yuboruvchi</p>
                      <p>{inquiry.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{inquiry.email}</p>
                    </div>
                  </div>
                  
                  {inquiry.tour && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Tour</p>
                      <p>{inquiry.tour}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Xabar</p>
                    <div className="mt-2 p-4 bg-muted/50 rounded-md">
                      <p style={{ whiteSpace: "pre-wrap" }}>{inquiry.message}</p>
                    </div>
                  </div>
                </div>

                {inquiry.response && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">
                      Javob - {inquiry.responseDate && format(new Date(inquiry.responseDate), "dd/MM/yyyy HH:mm")}
                    </p>
                    <div className="mt-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <p style={{ whiteSpace: "pre-wrap" }}>{inquiry.response}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Javob berish</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Status</label>
                  <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statusni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Yangi</SelectItem>
                      <SelectItem value="in-progress">Jarayonda</SelectItem>
                      <SelectItem value="completed">Yakunlangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm mb-2">Javob matni</label>
                  <Textarea
                    placeholder="Javob yozing..."
                    className="min-h-[150px]"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  {formError && <p className="text-sm text-red-500 mt-1">{formError}</p>}
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={respondMutation.isPending}
                >
                  {respondMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Send className="h-4 w-4 mr-2" />
                  Javob yuborish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}