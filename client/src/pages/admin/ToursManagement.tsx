import { FormEvent, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types from schema
import { Tour, InsertTour } from "@shared/schema";

const tourSchema = z.object({
  title: z.string().min(3, "Tur nomi kamida 3 ta belgidan iborat bo'lishi kerak"),
  description: z.string().min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak"),
  imageUrl: z.string().url("Yaroqli URL kiriting"),
  price: z.number().min(0, "Narx musbat son bo'lishi kerak"),
  duration: z.string().min(1, "Davomiylikni kiriting"),
  location: z.string().min(2, "Joylashuvni kiriting"),
  category: z.string().min(2, "Kategoriyani kiriting"),
  featured: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxGroupSize: z.number().min(1, "Guruh hajmi kamida 1 bo'lishi kerak").optional(),
  difficultyLevel: z.string().optional(),
  included: z.string().optional(),
  notIncluded: z.string().optional(),
  highlights: z.string().optional(),
});

type TourFormData = z.infer<typeof tourSchema>;

export default function ToursManagement() {
  const { toast } = useToast();
  const [isAddTourDialogOpen, setIsAddTourDialogOpen] = useState(false);
  const [isEditTourDialogOpen, setIsEditTourDialogOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TourFormData>({
    title: "",
    description: "",
    imageUrl: "",
    price: 0,
    duration: "",
    location: "",
    category: "",
    featured: false,
    maxGroupSize: 10,
    difficultyLevel: "Medium",
    included: "",
    notIncluded: "",
    highlights: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get all tours
  const { data: tours, isLoading: isLoadingTours } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tours");
      return await res.json();
    },
  });

  // Add tour mutation
  const addTourMutation = useMutation({
    mutationFn: async (tourData: TourFormData) => {
      const res = await apiRequest("POST", "/api/tours", tourData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Turni qo'shishda xatolik yuz berdi");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Yangi tur qo'shildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      resetForm();
      setIsAddTourDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update tour mutation
  const updateTourMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TourFormData }) => {
      const res = await apiRequest("PUT", `/api/tours/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Tur yangilandi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      resetForm();
      setIsEditTourDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete tour mutation
  const deleteTourMutation = useMutation({
    mutationFn: async (tourId: number) => {
      const res = await apiRequest("DELETE", `/api/tours/${tourId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Muvaffaqiyatli",
        description: "Tur o'chirildi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      setTourToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      price: 0,
      duration: "",
      location: "",
      category: "",
      featured: false,
      maxGroupSize: 10,
      difficultyLevel: "Medium",
      included: "",
      notIncluded: "",
      highlights: "",
    });
    setFormErrors({});
    setEditingTour(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
      return;
    }
    
    // Handle numeric fields
    if (name === 'price' || name === 'maxGroupSize') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : Number(value),
      });
      return;
    }
    
    // Handle other fields
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFormData({
      ...formData,
      featured: checked,
    });
  };

  const handleAddTour = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      tourSchema.parse(formData);
      
      // Submit data if validation passes
      addTourMutation.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to form errors
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      description: tour.description,
      imageUrl: tour.image || "",
      price: typeof tour.price === 'string' ? parseInt(tour.price) : tour.price,
      duration: tour.duration,
      category: tour.category,
      location: tour.cities || "",
      maxGroupSize: tour.maxPeople || 10,
      difficultyLevel: "Medium",
      featured: tour.featured ? true : false,
    });
    setIsEditTourDialogOpen(true);
  };

  const handleUpdateTour = (e: FormEvent) => {
    e.preventDefault();
    
    if (!editingTour) return;
    
    // Validate form data
    try {
      tourSchema.parse(formData);
      
      // Submit data if validation passes
      updateTourMutation.mutate({ id: editingTour.id, data: formData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to form errors
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  const handleDeleteTour = (tour: Tour) => {
    setTourToDelete(tour);
  };

  const confirmDeleteTour = () => {
    if (tourToDelete) {
      deleteTourMutation.mutate(tourToDelete.id);
    }
  };

  // Filter tours based on search query
  const filteredTours = tours?.filter(tour => 
    tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tour.cities && tour.cities.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (tour.category && tour.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Turlar boshqaruvi</h1>
        <Button onClick={() => setIsAddTourDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi tur qo'shish
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Turlarni qidirish..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Turlar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTours ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTours && filteredTours.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Narxi</TableHead>
                  <TableHead>Davomiyligi</TableHead>
                  <TableHead>Joylashuvi</TableHead>
                  <TableHead>Kategoriyasi</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>{tour.id}</TableCell>
                    <TableCell>{tour.title}</TableCell>
                    <TableCell>${tour.price}</TableCell>
                    <TableCell>{tour.duration}</TableCell>
                    <TableCell>{tour.cities}</TableCell>
                    <TableCell>{tour.category}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTour(tour)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTour(tour)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Turni o'chirish</AlertDialogTitle>
                            <AlertDialogDescription>
                              Haqiqatan ham bu turni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDeleteTour}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteTourMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              O'chirish
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">Hech qanday tur topilmadi</p>
          )}
        </CardContent>
      </Card>

      {/* Add Tour Dialog */}
      <Dialog open={isAddTourDialogOpen} onOpenChange={setIsAddTourDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi tur qo'shish</DialogTitle>
            <DialogDescription>
              Bu yerda yangi tur ma'lumotlarini kiriting.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTour} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title">Tur nomi</label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Tur nomini kiriting"
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="category">Kategoriya</label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Adventure, Cultural, etc."
                />
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="location">Joylashuv</label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Toshkent, Samarqand, etc."
                />
                {formErrors.location && (
                  <p className="text-sm text-red-500">{formErrors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="price">Narxi ($)</label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                {formErrors.price && (
                  <p className="text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="duration">Davomiyligi</label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="3 days, 2 nights"
                />
                {formErrors.duration && (
                  <p className="text-sm text-red-500">{formErrors.duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="maxGroupSize">Guruh hajmi</label>
                <Input
                  id="maxGroupSize"
                  name="maxGroupSize"
                  type="number"
                  value={formData.maxGroupSize}
                  onChange={handleInputChange}
                  placeholder="10"
                />
                {formErrors.maxGroupSize && (
                  <p className="text-sm text-red-500">{formErrors.maxGroupSize}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="startDate">Boshlanish sanasi</label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate">Tugash sanasi</label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="difficultyLevel">Qiyinchilik darajasi</label>
                <Select 
                  value={formData.difficultyLevel} 
                  onValueChange={(value) => handleSelectChange("difficultyLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qiyinchilik darajasini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Oson</SelectItem>
                    <SelectItem value="Medium">O'rta</SelectItem>
                    <SelectItem value="Hard">Qiyin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="imageUrl">Rasm URL</label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.imageUrl && (
                  <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description">Tavsif</label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tur haqida batafsil ma'lumot"
              />
              {formErrors.description && (
                <p className="text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="highlights">Asosiy jihatlar</label>
              <Textarea
                id="highlights"
                name="highlights"
                rows={3}
                value={formData.highlights}
                onChange={handleInputChange}
                placeholder="Tur davomida ko'rish, qilish mumkin bo'lgan eng yaxshi narsalar"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="included">Narxga kiritilgan</label>
                <Textarea
                  id="included"
                  name="included"
                  rows={3}
                  value={formData.included}
                  onChange={handleInputChange}
                  placeholder="Transport, yotoq, taom, etc."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notIncluded">Narxga kiritilmagan</label>
                <Textarea
                  id="notIncluded"
                  name="notIncluded"
                  rows={3}
                  value={formData.notIncluded}
                  onChange={handleInputChange}
                  placeholder="Aviachipta, sug'urta, etc."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={(e) => handleFeaturedChange(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="featured">Tanlangan (featured)</label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddTourDialogOpen(false);
                }}
              >
                Bekor qilish
              </Button>
              <Button 
                type="submit"
                disabled={addTourMutation.isPending}
              >
                {addTourMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tour Dialog */}
      <Dialog open={isEditTourDialogOpen} onOpenChange={setIsEditTourDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Turni tahrirlash</DialogTitle>
            <DialogDescription>
              Tur ma'lumotlarini yangilang.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTour} className="space-y-4">
            {/* Same form fields as Add Tour Dialog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-title">Tur nomi</label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Tur nomini kiriting"
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-category">Kategoriya</label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Adventure, Cultural, etc."
                />
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-location">Joylashuv</label>
                <Input
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Toshkent, Samarqand, etc."
                />
                {formErrors.location && (
                  <p className="text-sm text-red-500">{formErrors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-price">Narxi ($)</label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                {formErrors.price && (
                  <p className="text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-duration">Davomiyligi</label>
                <Input
                  id="edit-duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="3 days, 2 nights"
                />
                {formErrors.duration && (
                  <p className="text-sm text-red-500">{formErrors.duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-maxGroupSize">Guruh hajmi</label>
                <Input
                  id="edit-maxGroupSize"
                  name="maxGroupSize"
                  type="number"
                  value={formData.maxGroupSize}
                  onChange={handleInputChange}
                  placeholder="10"
                />
                {formErrors.maxGroupSize && (
                  <p className="text-sm text-red-500">{formErrors.maxGroupSize}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-startDate">Boshlanish sanasi</label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-endDate">Tugash sanasi</label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-difficultyLevel">Qiyinchilik darajasi</label>
                <Select 
                  value={formData.difficultyLevel} 
                  onValueChange={(value) => handleSelectChange("difficultyLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qiyinchilik darajasini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Oson</SelectItem>
                    <SelectItem value="Medium">O'rta</SelectItem>
                    <SelectItem value="Hard">Qiyin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-imageUrl">Rasm URL</label>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.imageUrl && (
                  <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-description">Tavsif</label>
              <Textarea
                id="edit-description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tur haqida batafsil ma'lumot"
              />
              {formErrors.description && (
                <p className="text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-highlights">Asosiy jihatlar</label>
              <Textarea
                id="edit-highlights"
                name="highlights"
                rows={3}
                value={formData.highlights}
                onChange={handleInputChange}
                placeholder="Tur davomida ko'rish, qilish mumkin bo'lgan eng yaxshi narsalar"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-included">Narxga kiritilgan</label>
                <Textarea
                  id="edit-included"
                  name="included"
                  rows={3}
                  value={formData.included}
                  onChange={handleInputChange}
                  placeholder="Transport, yotoq, taom, etc."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-notIncluded">Narxga kiritilmagan</label>
                <Textarea
                  id="edit-notIncluded"
                  name="notIncluded"
                  rows={3}
                  value={formData.notIncluded}
                  onChange={handleInputChange}
                  placeholder="Aviachipta, sug'urta, etc."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-featured"
                name="featured"
                checked={formData.featured}
                onChange={(e) => handleFeaturedChange(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="edit-featured">Tanlangan (featured)</label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditTourDialogOpen(false);
                }}
              >
                Bekor qilish
              </Button>
              <Button 
                type="submit"
                disabled={updateTourMutation.isPending}
              >
                {updateTourMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Yangilash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}