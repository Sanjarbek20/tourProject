import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { MoveRight } from "lucide-react";

const HeroSection = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState({
    destination: "",
    date: "",
    travelers: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search params:", searchParams);
    // Implement search functionality
  };

  return (
    <section
      id="home"
      className="relative h-screen min-h-[600px] bg-cover bg-center"
      style={{
        backgroundImage: "url('https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0a/c3/f0/1c.jpg')"
      }}
    >

      <div className="absolute inset-0 bg-gray-700/90"></div>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center relative z-10">
        <div className="w-full max-w-4xl">
          <Link href="/destinations" className="inline-block">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight hover:opacity-90 transition-opacity">
              {t("hero.title", { interpolation: { escapeValue: false } })
                .split(/<span>|<\/span>/)
                .map((text, i) => {
                  // Check if this is the last part and it's "together"
                  if (i === 2 && (text.toLowerCase().includes("together") || text.toLowerCase().includes("birga") || text.toLowerCase().includes("вместе"))) {
                    return <span key={i} className="text-[#FF9800] block">{text}</span>;
                  }
                  return i % 2 === 0 ? text : <span key={i} className="text-[#FF9800]">{text}</span>;
                })}
            </h2>
          </Link>
          <Link href="/destinations" className="inline-block">
            <p className="text-lg md:text-xl text-white/90 mb-12 mx-auto leading-relaxed max-w-2xl hover:opacity-90 transition-opacity">
              {t("hero.subtitle")}
            </p>
          </Link>
        </div>

        <div className="absolute bottom-10 left-0 right-0 mx-auto max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral-800 mb-2">
                  {t("hero.search.destination")}
                </label>
                <select
                  name="destination"
                  value={searchParams.destination}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#FF9800] focus:border-[#FF9800]"
                >
                  <option value="">{t("hero.search.anyDestination")}</option>
                  <option value="samarkand">Samarkand</option>
                  <option value="bukhara">Bukhara</option>
                  <option value="khiva">Khiva</option>
                  <option value="tashkent">Tashkent</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral-800 mb-2">
                  {t("hero.search.date")}
                </label>
                <input
                  type="date"
                  name="date"
                  value={searchParams.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#FF9800] focus:border-[#FF9800]"
                  placeholder="mm/dd/yyyy"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral-800 mb-2">
                  {t("hero.search.travelers")}
                </label>
                <select
                  name="travelers"
                  value={searchParams.travelers}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#FF9800] focus:border-[#FF9800]"
                >
                  <option value="1">{t("hero.search.person")}</option>
                  <option value="2">{t("hero.search.people", { count: 2 })}</option>
                  <option value="3">{t("hero.search.people", { count: 3 })}</option>
                  <option value="4+">{t("hero.search.morePeople")}</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/tours"
                className="px-6 py-3 bg-[#FF9800] text-white font-medium rounded-md hover:bg-[#FF9800]/90 transition-all duration-300 flex items-center gap-2"
              >
                {t("hero.search.button")} <MoveRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
