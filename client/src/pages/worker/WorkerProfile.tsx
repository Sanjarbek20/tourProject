import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import WorkerHeader from "@/components/worker/WorkerHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

interface WorkerProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  assignedBookings?: number;
  completedBookings?: number;
  pendingBookings?: number;
  cancelledBookings?: number;
  totalBookings?: number;
}

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Current password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function WorkerProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  
  const { data: profile, isLoading } = useQuery<WorkerProfile>({
    queryKey: ["/api/worker/profile"],
  });
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Set form values when profile data is loaded
  if (profile && !profileForm.formState.isDirty) {
    profileForm.reset({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
    });
  }
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PATCH", "/api/worker/profile", data);
    },
    onSuccess: () => {
      toast({
        title: t('profile.updated'),
        description: t('profile.profile_updated_successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/worker/profile"] });
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: t('error.profile_update_failed'),
        variant: "destructive",
      });
    },
  });
  
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      return await apiRequest("POST", "/api/worker/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: t('profile.password_changed'),
        description: t('profile.password_changed_successfully'),
      });
      passwordForm.reset();
      setIsPasswordChanging(false);
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: t('error.password_change_failed'),
        variant: "destructive",
      });
    },
  });
  
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  function onPasswordSubmit(data: PasswordFormValues) {
    changePasswordMutation.mutate(data);
  }
  
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
  
  return (
    <div className="min-h-screen bg-background">
      <WorkerHeader />
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{t('profile.my_profile')}</h1>
        
        {/* Worker Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">{t('worker.stats.assigned_bookings')}</h3>
                <p className="text-3xl font-bold">{profile?.assignedBookings || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">{t('worker.stats.completed_bookings')}</h3>
                <p className="text-3xl font-bold">{profile?.completedBookings || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">{t('worker.stats.pending_bookings')}</h3>
                <p className="text-3xl font-bold">{profile?.pendingBookings || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.personal_information')}</CardTitle>
              <CardDescription>
                {t('profile.update_your_profile')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.full_name')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder={t('profile.enter_full_name')} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.email')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder={t('profile.enter_email')} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.phone')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder={t('profile.enter_phone')} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={!profileForm.formState.isDirty || updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('profile.save_changes')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.security')}</CardTitle>
              <CardDescription>
                {t('profile.manage_your_password')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isPasswordChanging ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">{t('profile.change_password')}</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {t('profile.change_password_desc')}
                  </p>
                  <Button onClick={() => setIsPasswordChanging(true)}>
                    {t('profile.change_password')}
                  </Button>
                </div>
              ) : (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.current_password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.new_password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('profile.password_requirements')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.confirm_password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        disabled={!passwordForm.formState.isDirty || changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t('profile.update_password')}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setIsPasswordChanging(false);
                          passwordForm.reset();
                        }}
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('profile.account_information')}</CardTitle>
            <CardDescription>
              {t('profile.account_details')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-1">{t('profile.username')}</h3>
                <p className="text-muted-foreground">{profile?.username || user?.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">{t('profile.role')}</h3>
                <p className="text-muted-foreground">{t('roles.staff')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">{t('profile.id')}</h3>
                <p className="text-muted-foreground">#{profile?.id || user?.id}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground border-t px-6 py-4">
            {t('profile.contact_admin')}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}