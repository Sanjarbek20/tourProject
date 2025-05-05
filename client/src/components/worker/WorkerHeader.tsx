import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Routes } from "@/routes";
import { 
  LayoutDashboard, 
  CalendarClock, 
  User, 
  LogOut,
  MapPin
} from "lucide-react";

const WorkerHeader = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-primary-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">{t('worker.dashboard')}</span>
            {user?.fullName && (
              <span className="hidden md:inline-block ml-2 text-primary-200">
                {t('worker.welcome')}, {user.fullName}
              </span>
            )}
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href={Routes.WORKER_DASHBOARD}>
              <div className="flex items-center hover:text-primary-200 transition-colors cursor-pointer">
                <LayoutDashboard className="w-4 h-4 mr-1" />
                {t('worker.dashboard')}
              </div>
            </Link>
            <Link href={Routes.WORKER_BOOKINGS}>
              <div className="flex items-center hover:text-primary-200 transition-colors cursor-pointer">
                <CalendarClock className="w-4 h-4 mr-1" />
                {t('worker.bookings')}
              </div>
            </Link>
            <Link href={Routes.WORKER_DESTINATIONS}>
              <div className="flex items-center hover:text-primary-200 transition-colors cursor-pointer">
                <MapPin className="w-4 h-4 mr-1" />
                {t('worker.destinations')}
              </div>
            </Link>
            <Link href={Routes.WORKER_PROFILE}>
              <div className="flex items-center hover:text-primary-200 transition-colors cursor-pointer">
                <User className="w-4 h-4 mr-1" />
                {t('worker.profile')}
              </div>
            </Link>
            <Button 
              variant="ghost" 
              className="text-white hover:text-primary-200"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              {t('auth.logout')}
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {/* Hamburger menu can be added here if needed */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkerHeader;