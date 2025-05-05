import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MapPin,
  MessageSquare,
  Settings,
  LogOut,
  Map,
  BarChart3,
  UserCog,
  Image,
} from "lucide-react";

export default function AdminSidebar() {
  const { logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const menuItems = [
    {
      title: "Asosiy",
      items: [
        {
          icon: <LayoutDashboard className="h-5 w-5" />,
          label: "Dashboard",
          href: "/admin/dashboard",
        },
        {
          icon: <Users className="h-5 w-5" />,
          label: "Ishchilar",
          href: "/admin/staff",
        },
        {
          icon: <Users className="h-5 w-5" />,
          label: "Foydalanuvchilar",
          href: "/admin/users",
        },
      ],
    },
    {
      title: "Kontent",
      items: [
        {
          icon: <Map className="h-5 w-5" />,
          label: "Turlar",
          href: "/admin/tours",
        },
        {
          icon: <MapPin className="h-5 w-5" />,
          label: "Manzillar",
          href: "/admin/destinations",
        },
        {
          icon: <Image className="h-5 w-5" />,
          label: "Galereya",
          href: "/admin/gallery",
        }
      ],
    },
    {
      title: "Biznes",
      items: [
        {
          icon: <BookOpen className="h-5 w-5" />,
          label: "Bronlar",
          href: "/admin/bookings",
        },
        {
          icon: <MessageSquare className="h-5 w-5" />,
          label: "So'rovlar",
          href: "/admin/inquiries",
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          label: "Statistika",
          href: "/admin/statistics",
        },
      ],
    },
    {
      title: "Sozlamalar",
      items: [
        {
          icon: <UserCog className="h-5 w-5" />,
          label: "Profil",
          href: "/admin/profile",
        },
        {
          icon: <Settings className="h-5 w-5" />,
          label: "Tizim",
          href: "/admin/settings",
        },
        {
          icon: <LogOut className="h-5 w-5" />,
          label: "Chiqish",
          onClick: () => logout(),
        },
      ],
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-muted/30 border-r w-64 py-4 px-2">
      <div className="px-4 py-2 mb-6">
        <h1 className="text-xl font-bold">Dildora Tour</h1>
        <p className="text-sm text-muted-foreground">Admin boshqaruvi</p>
      </div>
      
      <div className="space-y-6 flex-1 px-2 overflow-auto">
        {menuItems.map((section, i) => (
          <div key={i} className="space-y-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item, j) => (
                <div key={j}>
                  {item.href ? (
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          isActive(item.href) ? "bg-accent text-accent-foreground" : "transparent"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    </Link>
                  ) : (
                    <button
                      className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                      onClick={item.onClick}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}