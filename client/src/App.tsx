import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Home from "@/pages/Home";
import TourDetail from "@/pages/TourDetail";
import AllTours from "@/pages/AllTours";
import AllDestinations from "@/pages/AllDestinations";
import DestinationDetail from "@/pages/DestinationDetail";
import WishlistPage from "@/pages/WishlistPage";
import UserDashboard from "@/pages/UserDashboard";
import Gallery from "@/pages/Gallery";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Admin pages
import AdminLogin from "@/pages/admin/Login";
import AdminSetup from "@/pages/admin/Setup";
import AdminInquiries from "@/pages/admin/Inquiries";
import InquiryDetail from "@/pages/admin/InquiryDetail";
import Bookings from "@/pages/admin/Bookings";
import BookingDetail from "@/pages/admin/BookingDetail";
import StaffManagement from "@/pages/admin/StaffManagement";
import ToursManagement from "@/pages/admin/ToursManagement";
import Dashboard from "@/pages/admin/Dashboard"; 
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import { Routes } from "./routes";

// Worker pages
import WorkerLogin from "@/pages/worker/Login";
import WorkerDashboard from "@/pages/worker/WorkerDashboard";
import WorkerBookings from "@/pages/worker/WorkerBookings";
import WorkerBookingDetail from "@/pages/worker/WorkerBookingDetail";
import WorkerProfile from "@/pages/worker/WorkerProfile";
import WorkerDestinations from "@/pages/worker/WorkerDestinations"; 
import WorkerHeader from "@/components/worker/WorkerHeader";

function MainRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/tours/:id">
            {(params) => {
              // Make sure id is a number
              const id = parseInt(params.id);
              return isNaN(id) ? <NotFound /> : <TourDetail />;
            }}
          </Route>
          <Route path="/destinations/:id">
            {(params) => <DestinationDetail />}
          </Route>
          <Route path="/tours" component={AllTours} />
          <Route path="/destinations" component={AllDestinations} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/dashboard" component={UserDashboard} />
          <Route path="/gallery" component={Gallery} />
          
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function AdminRouter() {
  return (
    <Switch>
      <Route path={Routes.ADMIN}>
        {() => <AdminLogin />}
      </Route>
      <Route path={Routes.ADMIN_LOGIN}>
        {() => <AdminLogin />}
      </Route>
      <Route path={Routes.ADMIN_SETUP}>
        {() => <AdminSetup />}
      </Route>
      <Route path={Routes.ADMIN_STAFF}>
        {() => (
          <ProtectedRoute>
            <StaffManagement />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={Routes.ADMIN_INQUIRIES}>
        {() => (
          <ProtectedRoute>
            <AdminInquiries />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/inquiry/:id">
        {(params) => (
          <ProtectedRoute>
            <InquiryDetail />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={Routes.ADMIN_BOOKINGS}>
        {() => (
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/bookings/:id">
        {(params) => (
          <ProtectedRoute>
            <BookingDetail />
          </ProtectedRoute>
        )}
      </Route>
      

    </Switch>
  );
}

// Worker (staff) router
function WorkerRouter() {
  return (
    <Switch>
      <Route path="/worker">
        <WorkerLogin />
      </Route>
      <Route path="/worker/dashboard">
        <ProtectedRoute>
          <WorkerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/worker/bookings">
        <ProtectedRoute>
          <WorkerBookings />
        </ProtectedRoute>
      </Route>
      <Route path="/worker/bookings/:id">
        <ProtectedRoute>
          <WorkerBookingDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/worker/profile">
        <ProtectedRoute>
          <WorkerProfile />
        </ProtectedRoute>
      </Route>
      <Route>
        <WorkerLogin />
      </Route>
    </Switch>
  );
}

function Router() {
  // Import useLocation hook to get current path
  const [location] = useLocation();
  
  // Order is important! First check special paths to avoid conflicts with dynamic routes
  
  // Handle worker routes first
  if (location === "/worker" || location.startsWith("/worker/")) {
    // Handle worker login separately
    if (location === "/worker") {
      console.log("Rendering worker login page");
      return <WorkerLogin />;
    }
    
    // All other worker pages require authentication
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <WorkerHeader />
          <div className="container mx-auto p-4">
            <Switch>
              <Route path={Routes.WORKER_DASHBOARD} component={WorkerDashboard} />
              <Route path={Routes.WORKER_BOOKINGS} component={WorkerBookings} />
              <Route path={Routes.WORKER_BOOKING_DETAIL(":id")} component={WorkerBookingDetail} />
              <Route path={Routes.WORKER_PROFILE} component={WorkerProfile} />
              <Route path="/worker/destinations" component={WorkerDestinations} />
              <Route>
                <div className="p-8 bg-white rounded-lg shadow">
                  <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                  <p>The page you are looking for does not exist.</p>
                </div>
              </Route>
            </Switch>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  
  // Then handle admin routes
  if (location === "/admin" || location.startsWith("/admin/")) {
    if (location === "/admin" || location === "/admin/login") {
      return <AdminLogin />;
    } else {
      return (
        <ProtectedRoute>
          <AdminLayout>
            <Switch>
              <Route path="/admin/dashboard" component={Dashboard} />
              <Route path="/admin/setup" component={AdminSetup} />
              <Route path="/admin/staff" component={StaffManagement} />
              <Route path="/admin/tours" component={ToursManagement} />
              <Route path="/admin/inquiries" component={AdminInquiries} />
              <Route path="/admin/inquiry/:id" component={InquiryDetail} />
              <Route path="/admin/bookings" component={Bookings} />
              <Route path="/admin/bookings/:id" component={BookingDetail} />
              <Route>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Sahifa topilmadi</h1>
                  <p>Siz qidirayotgan sahifa mavjud emas.</p>
                </div>
              </Route>
            </Switch>
          </AdminLayout>
        </ProtectedRoute>
      );
    }
  }
  
  // Main routes for everything else
  return <MainRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <Router />
            <Toaster />
          </WishlistProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
