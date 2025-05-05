import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Tour } from '@shared/schema';
import { Destination } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface WishlistContextType {
  tourWishlist: Tour[];
  destinationWishlist: Destination[];
  addTourToWishlist: (tour: Tour) => void;
  removeTourFromWishlist: (tourId: number) => void;
  addDestinationToWishlist: (destination: Destination) => void;
  removeDestinationFromWishlist: (destinationId: number) => void;
  isTourInWishlist: (tourId: number) => boolean;
  isDestinationInWishlist: (destinationId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tourWishlist, setTourWishlist] = useState<Tour[]>([]);
  const [destinationWishlist, setDestinationWishlist] = useState<Destination[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedTourWishlist = localStorage.getItem('tourWishlist');
      const savedDestinationWishlist = localStorage.getItem('destinationWishlist');
      
      if (savedTourWishlist) {
        setTourWishlist(JSON.parse(savedTourWishlist));
      }
      
      if (savedDestinationWishlist) {
        setDestinationWishlist(JSON.parse(savedDestinationWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('tourWishlist', JSON.stringify(tourWishlist));
    } catch (error) {
      console.error('Error saving tour wishlist to localStorage:', error);
    }
  }, [tourWishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('destinationWishlist', JSON.stringify(destinationWishlist));
    } catch (error) {
      console.error('Error saving destination wishlist to localStorage:', error);
    }
  }, [destinationWishlist]);

  const addTourToWishlist = (tour: Tour) => {
    if (!isTourInWishlist(tour.id)) {
      setTourWishlist(prev => [...prev, tour]);
      toast({
        title: t('wishlist.added'),
        description: t('wishlist.tourAdded', { name: tour.title }),
      });
    }
  };

  const removeTourFromWishlist = (tourId: number) => {
    const tour = tourWishlist.find(item => item.id === tourId);
    if (tour) {
      setTourWishlist(prev => prev.filter(item => item.id !== tourId));
      toast({
        title: t('wishlist.removed'),
        description: t('wishlist.tourRemoved', { name: tour.title }),
      });
    }
  };

  const addDestinationToWishlist = (destination: Destination) => {
    if (!isDestinationInWishlist(destination.id)) {
      setDestinationWishlist(prev => [...prev, destination]);
      toast({
        title: t('wishlist.added'),
        description: t('wishlist.destinationAdded', { name: destination.name }),
      });
    }
  };

  const removeDestinationFromWishlist = (destinationId: number) => {
    const destination = destinationWishlist.find(item => item.id === destinationId);
    if (destination) {
      setDestinationWishlist(prev => prev.filter(item => item.id !== destinationId));
      toast({
        title: t('wishlist.removed'),
        description: t('wishlist.destinationRemoved', { name: destination.name }),
      });
    }
  };

  const isTourInWishlist = (tourId: number) => {
    return tourWishlist.some(tour => tour.id === tourId);
  };

  const isDestinationInWishlist = (destinationId: number) => {
    return destinationWishlist.some(destination => destination.id === destinationId);
  };

  return (
    <WishlistContext.Provider
      value={{
        tourWishlist,
        destinationWishlist,
        addTourToWishlist,
        removeTourFromWishlist,
        addDestinationToWishlist,
        removeDestinationFromWishlist,
        isTourInWishlist,
        isDestinationInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};