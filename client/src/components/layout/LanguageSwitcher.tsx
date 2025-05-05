import { useLanguage } from "@/context/LanguageContext";
import { MouseEvent } from "react";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const handleLanguageChange = (e: MouseEvent<HTMLButtonElement>, lang: "en" | "ru" | "uz") => {
    e.preventDefault();
    e.stopPropagation();
    changeLanguage(lang);
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className={`px-2 py-1 text-sm hover:bg-gray-100 rounded ${
            currentLanguage === "en" ? "font-semibold text-primary" : "text-gray-700"
          }`}
          onClick={(e) => handleLanguageChange(e, "en")}
        >
          EN
        </button>
        <button
          type="button"
          className={`px-2 py-1 text-sm hover:bg-gray-100 rounded ${
            currentLanguage === "ru" ? "font-semibold text-primary" : "text-gray-700"
          }`}
          onClick={(e) => handleLanguageChange(e, "ru")}
        >
          RU
        </button>
        <button
          type="button"
          className={`px-2 py-1 text-sm hover:bg-gray-100 rounded ${
            currentLanguage === "uz" ? "font-semibold text-primary" : "text-gray-700"
          }`}
          onClick={(e) => handleLanguageChange(e, "uz")}
        >
          UZ
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
