import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const [location] = useLocation();
  const { tourWishlist, destinationWishlist } = useWishlist();
  
  const totalWishlistItems = tourWishlist.length + destinationWishlist.length;

  const navItems = [
    { title: t("nav.home"), href: "/" },
    { title: t("nav.tours"), href: "/tours" },
    { title: t("nav.destinations"), href: "/destinations" },
    { title: t("nav.gallery"), href: "/gallery" },
    { title: t("nav.about"), href: "/#about" },
    { title: t("nav.testimonials"), href: "/#testimonials" },
    { title: t("nav.contact"), href: "/#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = (href: string) => {
    closeMobileMenu();
    
    // Handle anchor links
    if (href.startsWith("/#") && location === "/") {
      const element = document.querySelector(href.substring(1));
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 80,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <header 
      className={`fixed w-full top-0 z-40 bg-white shadow-md transition-all duration-300 ${
        isScrolled ? "py-2" : "py-3"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-heading font-bold text-primary">
            Dildora<span className="text-[#FF9800]">Tours</span>
          </span>
        </Link>
        
        <div className="flex items-center ml-auto">
          {/* Wishlist Link */}
          <Link 
            href="/wishlist" 
            className="flex items-center relative mx-2 md:mx-4 text-neutral-700 hover:text-primary transition-colors duration-200"
            onClick={() => closeMobileMenu()}
          >
            <Heart className={`h-5 w-5 ${totalWishlistItems > 0 ? 'fill-red-500 stroke-red-500' : ''}`} />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {totalWishlistItems}
              </span>
            )}
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher className="mr-2 lg:mr-6" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className={`font-heading font-medium ${
                  location === item.href ? "text-primary" : "hover:text-primary"
                } transition-colors duration-200`}
                onClick={() => handleNavLinkClick(item.href)}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Contact Button */}
          <div className="hidden lg:block ml-4">
            <Link 
              href="/#contact"
              className="bg-[#FF9800] hover:bg-[#FF9800]/90 text-white px-5 py-2 rounded-full font-heading font-medium transition-colors duration-200"
              onClick={() => handleNavLinkClick("/#contact")}
            >
              {t("nav.bookNow")}
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-neutral-800 focus:outline-none ml-2"
            onClick={toggleMobileMenu}
          >
            <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="container mx-auto px-4 py-3 bg-white">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className="font-heading font-medium hover:text-primary transition-colors duration-200 py-2 border-b border-neutral-100"
                onClick={() => handleNavLinkClick(item.href)}
              >
                {item.title}
              </Link>
            ))}
            <Link 
              href="/wishlist"
              className="flex items-center font-heading font-medium py-2 border-b border-neutral-100"
              onClick={() => closeMobileMenu()}
            >
              <Heart className="mr-2 h-5 w-5" /> {t("wishlist.yourWishlist")}
              {totalWishlistItems > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </Link>
            
            <Link 
              href="/#contact"
              className="bg-[#FF9800] hover:bg-[#FF9800]/90 text-white px-5 py-2 rounded-full font-heading font-medium transition-colors duration-200 text-center"
              onClick={() => handleNavLinkClick("/#contact")}
            >
              {t("nav.bookNow")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;