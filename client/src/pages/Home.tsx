import HeroSection from "@/components/home/HeroSection";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import TourPackages from "@/components/home/TourPackages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ImageGallery from "@/components/home/ImageGallery";
import AboutUs from "@/components/home/AboutUs";
import Testimonials from "@/components/home/Testimonials";
import Contact from "@/components/home/Contact";
import Newsletter from "@/components/home/Newsletter";
import { useEffect } from "react";
import { useLocation } from "wouter";

const Home = () => {
  const [location] = useLocation();

  // Scroll to section if hash is present in URL
  useEffect(() => {
    if (location === "/") {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            window.scrollTo({
              top: element.getBoundingClientRect().top + window.scrollY - 80,
              behavior: "smooth",
            });
          }, 100);
        }
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location]);
// shuni joy 6 qatorga joylashtirsa gallery ko'rinadi <ImageGallery />
  return (
    <>
      <HeroSection />
      <FeaturedDestinations />
      <TourPackages />
      <WhyChooseUs />
      
      <AboutUs />
      <Testimonials />
      <Contact />
      <Newsletter />
    </>
  );
};

export default Home;
