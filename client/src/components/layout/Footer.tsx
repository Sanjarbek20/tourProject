import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-neutral-800 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-heading font-bold text-white">
                Dildora<span className="text-[#FF9800]">Tours</span>
              </span>
            </Link>
            <p className="text-white/70 mb-6">{t("footer.description")}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                <i className="fab fa-tripadvisor"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-heading font-bold mb-6">{t("footer.links.title")}</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link 
                  href="/tours"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {t("nav.tours")}
                </Link>
              </li>
              <li>
                <Link 
                  href="/destinations"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {t("nav.destinations")}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#about"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#testimonials"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {t("nav.testimonials")}
                </Link>
              </li>
              <li>
                <Link 
                  href="/#contact"
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-heading font-bold mb-6">{t("footer.categories.title")}</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t("footer.categories.cultural")}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t("footer.categories.adventure")}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t("footer.categories.historical")}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t("footer.categories.culinary")}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t("footer.categories.photography")}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t("footer.categories.custom")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-heading font-bold mb-6">{t("footer.contact.title")}</h3>
            <ul className="space-y-4">
              <li className="flex">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-[#FF9800]"></i>
                <span className="text-white/70">{t("contact.office.address")}</span>
              </li>
              <li className="flex">
                <i className="fas fa-phone-alt mt-1 mr-3 text-[#FF9800]"></i>
                <span className="text-white/70">{t("contact.phone.number1")}</span>
              </li>
              <li className="flex">
                <i className="fas fa-envelope mt-1 mr-3 text-[#FF9800]"></i>
                <span className="text-white/70">{t("contact.email.address1")}</span>
              </li>
              <li className="flex">
                <i className="fas fa-clock mt-1 mr-3 text-[#FF9800]"></i>
                <span className="text-white/70">{t("contact.hours.weekdays")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 mb-4 md:mb-0">{t("footer.copyright")}</p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
              {t("footer.legal.privacy")}
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
              {t("footer.legal.terms")}
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors duration-200">
              {t("footer.legal.sitemap")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
