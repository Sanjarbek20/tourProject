import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "react-i18next";

interface BookingFormProps {
  tourId: number;
  maxPeople: number;
  price: string;
  duration: string;
}

// Form schema
const formSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  numberOfPeople: z.coerce.number().min(1).max(20),
  startDate: z.date({
    required_error: "Please select a tour date",
  }).refine((date) => date > new Date(), {
    message: "Tour date must be in the future",
  }),
  paymentMethod: z.enum(["plastic", "visa", "cash", "later"], {
    required_error: "Please select a payment method",
  }),
  paymentDetails: z.string().optional(),
  depositConfirmation: z.boolean().optional(),
  specialRequests: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BookingForm({ tourId, maxPeople, price, duration }: BookingFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isBookingSubmitted, setIsBookingSubmitted] = useState(false);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      numberOfPeople: 1,
      paymentMethod: undefined,
      paymentDetails: "",
      depositConfirmation: false,
      specialRequests: "",
    },
  });
  
  const bookingMutation = useMutation({
    mutationFn: async (data: FormValues & { 
      tourId: number; 
      totalAmount: string;
      paymentDetails?: string;
      depositPaid?: boolean;
      paymentStatus?: string;
    }) => {
      return apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: t("bookingForm.success.title"),
        description: t("bookingForm.success.description"),
      });
      form.reset();
      setIsBookingSubmitted(true);
      setSelectedPaymentMethod(null);
    },
    onError: (error) => {
      toast({
        title: t("bookingForm.error.title"),
        description: t("bookingForm.error.description"),
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: FormValues) {
    // Calculate the total price based on number of people
    const totalPricePerPerson = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    const totalAmount = totalPricePerPerson * data.numberOfPeople;
    const formattedTotalAmount = `$${totalAmount.toLocaleString()}`;
    
    // For cash payment, confirm they've checked the deposit confirmation
    if (data.paymentMethod === "cash" && !data.depositConfirmation) {
      toast({
        title: "Deposit confirmation required",
        description: "Please confirm that you will pay the 30% deposit for cash payments.",
        variant: "destructive"
      });
      return;
    }
    
    // Add depositPaid status based on payment method
    // Only cash payments require separate deposit, and "later" means payment pending
    const depositPaid = data.paymentMethod !== "cash" && data.paymentMethod !== "later"; 
    
    // Format payment details for different payment methods
    let paymentDetails = data.paymentDetails;
    let paymentStatus = "unpaid";
    
    if (data.paymentMethod === "cash") {
      const depositAmount = (totalAmount * 0.3).toLocaleString();
      paymentDetails = `30% deposit ($${depositAmount}) required`;
    } else if (data.paymentMethod === "later") {
      paymentDetails = "Customer will pay later";
    } else {
      // For card payments (plastic/visa), mark as paid
      paymentStatus = "paid";
    }
    
    // Convert the Date object to proper ISO format for the API
    const formattedDate = data.startDate ? 
      new Date(data.startDate.getTime() - (data.startDate.getTimezoneOffset() * 60000))
        .toISOString().split('T')[0] : null;
    
    bookingMutation.mutate({
      ...data,
      tourId,
      startDate: formattedDate as any, // Type casting needed to satisfy TypeScript
      totalAmount: formattedTotalAmount,
      paymentDetails: paymentDetails || undefined,
      depositPaid,
      paymentStatus
    });
  }
  
  if (isBookingSubmitted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">{t("bookingForm.submitted.title")}</h3>
          <p className="text-gray-600 mb-4">{t("bookingForm.submitted.description")}</p>
          <Button 
            variant="outline" 
            onClick={() => setIsBookingSubmitted(false)}
          >
            {t("bookingForm.submitted.newBooking")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-6">{t("bookingForm.title")}</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("bookingForm.fullName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("bookingForm.fullNamePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookingForm.email")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("bookingForm.emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookingForm.phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("bookingForm.phonePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bookingForm.numberOfPeople")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={maxPeople}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("bookingForm.maxPeople", { max: maxPeople })}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("bookingForm.tourDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("bookingForm.selectDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Payment Methods */}
          <div className="border p-4 rounded-md bg-gray-50">
            <h4 className="font-semibold mb-3">Payment Method</h4>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div 
                      className={`border rounded-md p-3 cursor-pointer transition-colors hover:bg-gray-100 flex flex-col items-center ${field.value === "plastic" ? "bg-blue-50 border-blue-500" : ""}`}
                      onClick={() => {
                        field.onChange("plastic");
                        setSelectedPaymentMethod("plastic");
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#E6F0FF"/>
                        <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="#2563EB"/>
                      </svg>
                      <span className="mt-2 font-medium">Plastic Card</span>
                      <span className="text-xs text-gray-500">(Humo, UzCard)</span>
                    </div>
                    <div 
                      className={`border rounded-md p-3 cursor-pointer transition-colors hover:bg-gray-100 flex flex-col items-center ${field.value === "visa" ? "bg-blue-50 border-blue-500" : ""}`}
                      onClick={() => {
                        field.onChange("visa");
                        setSelectedPaymentMethod("visa");
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#EDF2FF"/>
                        <path d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5Z" stroke="#1A56DB" strokeWidth="1.5" strokeMiterlimit="10"/>
                        <path d="M10 13L11 15L14 10" stroke="#1A56DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="mt-2 font-medium">Visa</span>
                      <span className="text-xs text-gray-500">(International cards)</span>
                    </div>
                    <div 
                      className={`border rounded-md p-3 cursor-pointer transition-colors hover:bg-gray-100 flex flex-col items-center ${field.value === "cash" ? "bg-blue-50 border-blue-500" : ""}`}
                      onClick={() => {
                        field.onChange("cash");
                        setSelectedPaymentMethod("cash");
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#ECFDF5"/>
                        <path d="M17 9V7C17 5.9 16.1 5 15 5H5C3.9 5 3 5.9 3 7V13C3 14.1 3.9 15 5 15H7M9 19H19C20.1 19 21 18.1 21 17V11C21 9.9 20.1 9 19 9H9C7.9 9 7 9.9 7 11V17C7 18.1 7.9 19 9 19ZM14 14C14 15.1 13.1 16 12 16C10.9 16 10 15.1 10 14C10 12.9 10.9 12 12 12C13.1 12 14 12.9 14 14Z" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="mt-2 font-medium">Cash</span>
                      <span className="text-xs text-gray-500">(30% deposit required)</span>
                    </div>
                    <div 
                      className={`border rounded-md p-3 cursor-pointer transition-colors hover:bg-gray-100 flex flex-col items-center ${field.value === "later" ? "bg-blue-50 border-blue-500" : ""}`}
                      onClick={() => {
                        field.onChange("later");
                        setSelectedPaymentMethod("later");
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#FEF3F2"/>
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#B42318" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="mt-2 font-medium">Pay Later</span>
                      <span className="text-xs text-gray-500">(Book now, pay later)</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cash payment specific fields */}
            {selectedPaymentMethod === "cash" && (
              <div className="mt-4 p-3 border rounded-md bg-amber-50">
                <div className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1 flex-shrink-0">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <p className="text-sm text-amber-800">For cash payments, a 30% deposit is required to confirm your booking.</p>
                    <p className="text-sm text-amber-800 mt-1">Total price: <span className="font-bold">{price} × {form.getValues("numberOfPeople") || 1} = ${(parseFloat(price.replace(/[^0-9.-]+/g, "")) * (form.getValues("numberOfPeople") || 1)).toLocaleString()}</span></p>
                    <p className="text-sm text-amber-800">Required deposit (30%): <span className="font-bold">${(parseFloat(price.replace(/[^0-9.-]+/g, "")) * (form.getValues("numberOfPeople") || 1) * 0.3).toLocaleString()}</span></p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="depositConfirmation"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 mt-1"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I confirm that I will pay the 30% deposit within 24 hours of booking</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Card payment fields */}
            {(selectedPaymentMethod === "plastic" || selectedPaymentMethod === "visa") && (
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="paymentDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Details</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={selectedPaymentMethod === "plastic" ? "Enter your Humo/UzCard number" : "Enter your Visa card number"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This information will be securely processed for your payment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("bookingForm.specialRequests")}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t("bookingForm.specialRequestsPlaceholder")}
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("bookingForm.processing")}
                </>
              ) : (
                <>
                  {t("bookingForm.bookNow")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}