import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { type GalleryImage } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const ImageGallery = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { data: galleryImages, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery'],
  });

  const filteredImages = activeCategory === "all"
    ? galleryImages
    : galleryImages?.filter(image => image.category.toLowerCase() === activeCategory.toLowerCase());

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const openImageDialog = (image: string) => {
    setSelectedImage(image);
  };

  // Create placeholder items for loading state
  const placeholders = Array(8).fill(0).map((_, index) => (
    <div key={index} className="relative overflow-hidden rounded-lg h-48 md:h-64">
      <Skeleton className="h-full w-full" />
    </div>
  ));

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-neutral-800 mb-4">
            {t("gallery.title")}
          </h2>
          <p className="text-lg text-neutral-800/70 max-w-2xl mx-auto">
            {t("gallery.subtitle")}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            className={`px-5 py-2 rounded-full font-medium ${
              activeCategory === "all"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200"
            }`}
            onClick={() => handleCategoryChange("all")}
          >
            {t("gallery.filters.all")}
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium ${
              activeCategory === "architecture"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200"
            }`}
            onClick={() => handleCategoryChange("architecture")}
          >
            {t("gallery.filters.architecture")}
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium ${
              activeCategory === "nature"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200"
            }`}
            onClick={() => handleCategoryChange("nature")}
          >
            {t("gallery.filters.nature")}
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium ${
              activeCategory === "people"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200"
            }`}
            onClick={() => handleCategoryChange("people")}
          >
            {t("gallery.filters.people")}
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium ${
              activeCategory === "food"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200"
            }`}
            onClick={() => handleCategoryChange("food")}
          >
            {t("gallery.filters.food")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? placeholders
            : filteredImages?.map((image) => (
                <Dialog key={image.id}>
                  <DialogTrigger asChild>
                    <div 
                      className="relative overflow-hidden rounded-lg group h-48 md:h-64 cursor-pointer"
                      onClick={() => openImageDialog(image.image)}
                    >
                      <img
                        src={image.image}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="bg-white text-primary p-3 rounded-full">
                          <i className="fas fa-search-plus"></i>
                        </button>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl p-0 bg-transparent border-0">
                    <img
                      src={image.image}
                      alt={image.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setActiveCategory("all")}
            className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-heading font-medium transition-colors duration-200"
          >
            {t("gallery.viewFull")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ImageGallery;
