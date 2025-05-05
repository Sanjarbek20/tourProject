import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';


interface GalleryImage {
  id: number;
  title: string;
  category: string;
  image: string;
  description?: string;
}

const Gallery = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');
  
  const { data: galleryImages = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['/api/gallery'],
  });

  const categories = ['all', 'Architecture', 'Nature', 'People', 'Food'];
  
  const filteredImages = filter === 'all' 
    ? galleryImages 
    : galleryImages.filter(image => image.category.toLowerCase() === filter.toLowerCase());

  return (
    <div>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Gallery</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Glimpses of the beauty and wonders awaiting you in Uzbekistan
          </p>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map(category => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                onClick={() => setFilter(category)}
                className="rounded-full px-6"
              >
                {category === 'all' ? 'All' : category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9800]"></div>
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && filteredImages.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-600">No images found in this category</h3>
            <p className="mt-2 text-gray-500">Try selecting a different category</p>
          </div>
        )}
        
        {/* Gallery grid */}
        {!isLoading && filteredImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredImages.map(image => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  <img 
                    src={image.image} 
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="font-bold text-lg text-white">{image.title}</h3>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-bold text-lg">{image.title}</h3>
                      <p className="text-sm text-gray-200">{image.description || ''}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;