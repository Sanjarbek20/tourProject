import { 
  users, type User, type InsertUser,
  tours, type Tour, type InsertTour,
  destinations, type Destination, type InsertDestination,
  teamMembers, type TeamMember, type InsertTeamMember,
  testimonials, type Testimonial, type InsertTestimonial,
  galleryImages, type GalleryImage, type InsertGalleryImage,
  contactInquiries, type ContactInquiry, type InsertContactInquiry,
  newsletterSubscriptions, type NewsletterSubscription, type InsertNewsletterSubscription,
  bookings, type Booking, type InsertBooking
} from "@shared/schema";
import * as bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  updateUser(id: number, userData: Partial<User>): Promise<User>; // For profile updates
  updateUserPassword(id: number, newPassword: string): Promise<void>; // For password changes
  
  // Tour methods
  getTour(id: number): Promise<Tour | undefined>;
  getTours(): Promise<Tour[]>;
  getFeaturedTours(): Promise<Tour[]>;
  getToursByCategory(category: string): Promise<Tour[]>;
  createTour(tour: InsertTour): Promise<Tour>;
  
  // Destination methods
  getDestination(id: number): Promise<Destination | undefined>;
  getDestinations(): Promise<Destination[]>;
  getFeaturedDestinations(): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  
  // Team member methods
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  getTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  
  // Testimonial methods
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Gallery image methods
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  getGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImagesByCategory(category: string): Promise<GalleryImage[]>;
  createGalleryImage(galleryImage: InsertGalleryImage): Promise<GalleryImage>;
  
  // Contact inquiry methods
  getContactInquiries(): Promise<ContactInquiry[]>;
  getContactInquiry(id: number): Promise<ContactInquiry | undefined>;
  createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry>;
  updateContactInquiryStatus(id: number, status: string): Promise<ContactInquiry>;
  updateContactInquiryResponse(id: number, response: string): Promise<ContactInquiry>;
  
  // Newsletter subscription methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  
  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updateBookingPaymentStatus(id: number, paymentStatus: string): Promise<Booking>;
  updateBookingNotes(id: number, notes: string): Promise<Booking>;
  getBookingsByWorkerId(workerId: number): Promise<Booking[]>;
  assignBookingToWorker(bookingId: number, workerId: number): Promise<Booking>;
  completeBooking(bookingId: number): Promise<Booking>;
  getTodayBookingsCountByWorkerId(workerId: number): Promise<number>;
  getCompletedBookingsCountByWorkerId(workerId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tours: Map<number, Tour>;
  private destinations: Map<number, Destination>;
  private teamMembers: Map<number, TeamMember>;
  private testimonials: Map<number, Testimonial>;
  private galleryImages: Map<number, GalleryImage>;
  private contactInquiries: Map<number, ContactInquiry>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  private bookings: Map<number, Booking>;
  
  currentUserId: number;
  currentTourId: number;
  currentDestinationId: number;
  currentTeamMemberId: number;
  currentTestimonialId: number;
  currentGalleryImageId: number;
  currentContactInquiryId: number;
  currentNewsletterSubscriptionId: number;
  currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.destinations = new Map();
    this.teamMembers = new Map();
    this.testimonials = new Map();
    this.galleryImages = new Map();
    this.contactInquiries = new Map();
    this.newsletterSubscriptions = new Map();
    this.bookings = new Map();
    
    this.currentUserId = 1;
    this.currentTourId = 1;
    this.currentDestinationId = 1;
    this.currentTeamMemberId = 1;
    this.currentTestimonialId = 1;
    this.currentGalleryImageId = 1;
    this.currentContactInquiryId = 1;
    this.currentNewsletterSubscriptionId = 1;
    this.currentBookingId = 1;
    
    // Initialize with sample data
    Promise.resolve().then(() => this.initializeSampleData());
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      role: insertUser.role || "staff" 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Tour methods
  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }
  
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }
  
  async getFeaturedTours(): Promise<Tour[]> {
    return Array.from(this.tours.values()).filter(tour => tour.featured);
  }
  
  async getToursByCategory(category: string): Promise<Tour[]> {
    return Array.from(this.tours.values()).filter(tour => tour.category === category);
  }
  
  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = this.currentTourId++;
    const tour: Tour = { 
      ...insertTour, 
      id,
      featured: insertTour.featured ?? null 
    };
    this.tours.set(id, tour);
    return tour;
  }
  
  // Destination methods
  async getDestination(id: number): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }
  
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }
  
  async getFeaturedDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values()).filter(destination => destination.featured);
  }
  
  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = this.currentDestinationId++;
    const destination: Destination = { 
      ...insertDestination, 
      id,
      featured: insertDestination.featured ?? null
    };
    this.destinations.set(id, destination);
    return destination;
  }
  
  // Team member methods
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }
  
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }
  
  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.currentTeamMemberId++;
    const teamMember: TeamMember = { ...insertTeamMember, id };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }
  
  // Testimonial methods
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }
  
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialId++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
  
  // Gallery image methods
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    return this.galleryImages.get(id);
  }
  
  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values());
  }
  
  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values()).filter(image => image.category === category);
  }
  
  async createGalleryImage(insertGalleryImage: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.currentGalleryImageId++;
    const galleryImage: GalleryImage = { ...insertGalleryImage, id };
    this.galleryImages.set(id, galleryImage);
    return galleryImage;
  }
  
  // Contact inquiry methods
  async getContactInquiries(): Promise<ContactInquiry[]> {
    return Array.from(this.contactInquiries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getContactInquiry(id: number): Promise<ContactInquiry | undefined> {
    return this.contactInquiries.get(id);
  }
  
  async updateContactInquiryStatus(id: number, status: string): Promise<ContactInquiry> {
    const inquiry = this.contactInquiries.get(id);
    if (!inquiry) {
      throw new Error(`Contact inquiry with id ${id} not found`);
    }
    
    const updatedInquiry = { ...inquiry, status };
    this.contactInquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  async updateContactInquiryResponse(id: number, response: string): Promise<ContactInquiry> {
    const inquiry = this.contactInquiries.get(id);
    if (!inquiry) {
      throw new Error(`Contact inquiry with id ${id} not found`);
    }
    
    const responseDate = new Date();
    const updatedInquiry = { 
      ...inquiry, 
      response, 
      responseDate,
      status: "resolved" 
    };
    this.contactInquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async deleteUser(id: number): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users.delete(id);
  }
  
  // Update user profile data
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    // Update user data while preserving password and id
    const updatedUser = { 
      ...user, 
      ...userData,
      id: user.id, // Ensure ID doesn't change
      password: user.password // Ensure password doesn't get overwritten
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Update user password
  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      password: newPassword
    };
    
    this.users.set(id, updatedUser);
  }
  
  async createContactInquiry(insertInquiry: InsertContactInquiry): Promise<ContactInquiry> {
    const id = this.currentContactInquiryId++;
    const createdAt = new Date();
    const inquiry: ContactInquiry = { 
      ...insertInquiry, 
      id, 
      createdAt,
      status: "pending",
      response: null,
      responseDate: null,
      tour: insertInquiry.tour ?? null
    };
    this.contactInquiries.set(id, inquiry);
    return inquiry;
  }
  
  // Newsletter subscription methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check if email already exists
    const existing = Array.from(this.newsletterSubscriptions.values()).find(
      sub => sub.email === insertSubscription.email
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.currentNewsletterSubscriptionId++;
    const createdAt = new Date();
    const subscription: NewsletterSubscription = { ...insertSubscription, id, createdAt };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }
  
  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const createdAt = new Date();
    
    // Set payment status based on payment method
    let initialPaymentStatus = "unpaid";
    let depositPaid = false;
    
    if (insertBooking.paymentMethod === "cash" && insertBooking.paymentDetails?.includes("deposit")) {
      initialPaymentStatus = "partially_paid";
      depositPaid = true;
    } else if (insertBooking.paymentMethod !== "cash") {
      // For card payments, we assume it's paid immediately for this demo
      initialPaymentStatus = "paid";
    }
    
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt,
      status: "pending",
      paymentStatus: initialPaymentStatus,
      depositPaid: depositPaid,
      notes: null,
      assignedToId: null,
      completedAt: null,
      updatedAt: null,
      specialRequests: insertBooking.specialRequests || null,
      paymentDetails: insertBooking.paymentDetails || null
    };
    
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }
    
    const updatedBooking = {
      ...booking,
      status,
      updatedAt: new Date()
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async updateBookingPaymentStatus(id: number, paymentStatus: string, depositStatus?: boolean): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }
    
    const updatedBooking = {
      ...booking,
      paymentStatus,
      depositPaid: depositStatus !== undefined ? depositStatus : booking.depositPaid,
      updatedAt: new Date()
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async updateDepositStatus(id: number, depositPaid: boolean): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }
    
    // If deposit is being marked as paid and payment was unpaid, update to partially paid
    let paymentStatus = booking.paymentStatus;
    if (depositPaid && booking.paymentStatus === "unpaid") {
      paymentStatus = "partially_paid";
    }
    
    const updatedBooking = {
      ...booking,
      depositPaid,
      paymentStatus,
      updatedAt: new Date()
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async updateBookingNotes(id: number, notes: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }
    
    const updatedBooking = {
      ...booking,
      notes,
      updatedAt: new Date()
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async getBookingsByWorkerId(workerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.assignedToId === workerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async assignBookingToWorker(bookingId: number, workerId: number): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${bookingId} not found`);
    }
    
    // Verify that worker exists
    const worker = this.users.get(workerId);
    if (!worker) {
      throw new Error(`Worker with id ${workerId} not found`);
    }
    
    const updatedBooking = {
      ...booking,
      assignedToId: workerId,
      updatedAt: new Date()
    };
    
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }
  
  async completeBooking(bookingId: number): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${bookingId} not found`);
    }
    
    const now = new Date();
    const updatedBooking = {
      ...booking,
      status: "completed",
      completedAt: now,
      updatedAt: now
    };
    
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }
  
  async getTodayBookingsCountByWorkerId(workerId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.bookings.values())
      .filter(booking => {
        const bookingDate = new Date(booking.startDate);
        bookingDate.setHours(0, 0, 0, 0);
        
        return booking.assignedToId === workerId && 
               bookingDate.getTime() === today.getTime();
      })
      .length;
  }
  
  async getCompletedBookingsCountByWorkerId(workerId: number): Promise<number> {
    return Array.from(this.bookings.values())
      .filter(booking => 
        booking.assignedToId === workerId && 
        booking.status === "completed"
      )
      .length;
  }
  
  // Initialize with sample data
  private async initializeSampleData() {
    // Add default admin user with credentials admin/admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await this.createUser({
      username: 'admin',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'admin'
    });
    
    // Add sample destinations
    this.createDestination({
      name: "Samarkand",
      description: "Discover the jewel of the Silk Road with its magnificent Registan Square and ancient architecture.",
      image: "/images/samarkand.jpg",
      featured: true
    });
    
    this.createDestination({
      name: "Bukhara",
      description: "Explore the holy city with hundreds of monuments, mosques, and madrasas spanning centuries of history.",
      image: "/images/bukhara.jpg",
      featured: true
    });
    
    this.createDestination({
      name: "Khiva",
      description: "Step back in time in this perfectly preserved medieval city with its stunning Itchan Kala fortress.",
      image: "/images/khiva.jpg",
      featured: true
    });
    
    this.createDestination({
      name: "Tashkent",
      description: "Uzbekistan's modern capital, where traditional architecture meets contemporary urbanization.",
      image: "/images/tashkent.jpg",
      featured: false
    });
    
    // More Uzbekistan destinations (80%)
    this.createDestination({
      name: "Fergana Valley",
      description: "The fertile heart of Central Asia, known for its exceptional craftsmanship, silk production, and cultural heritage.",
      image: "/images/fergana.jpg",
      featured: true
    });
    
    this.createDestination({
      name: "Nukus",
      description: "Home to the renowned Savitsky Museum, housing one of the world's largest collections of Russian avant-garde art.",
      image: "/images/nukus.jpg",
      featured: false
    });
    
    this.createDestination({
      name: "Termez",
      description: "Uzbekistan's southernmost city with 2,500 years of history, showcasing influences from Buddhism, Zoroastrianism, and Islam.",
      image: "/images/termez.jpg",
      featured: false
    });
    
    this.createDestination({
      name: "Chimgan Mountains",
      description: "A stunning mountain range near Tashkent offering hiking, skiing, and breathtaking natural scenery.",
      image: "/images/chimgan.jpg",
      featured: true
    });
    
    this.createDestination({
      name: "Aral Sea",
      description: "Witness environmental history at this shrinking sea, once the fourth-largest lake in the world.",
      image: "/images/aral-sea.jpg",
      featured: false
    });
    
    this.createDestination({
      name: "Shakhrisabz",
      description: "Birthplace of Tamerlane with impressive ruins of his summer palace and beautiful historic monuments.",
      image: "/images/shakhrisabz.jpg",
      featured: true
    });
    
    // Other Central Asian destinations (20%)
    this.createDestination({
      name: "Bishkek",
      description: "The capital of Kyrgyzstan, a gateway to the country's stunning mountains and nomadic traditions.",
      image: "/images/bishkek.jpg",
      featured: false
    });
    
    this.createDestination({
      name: "Almaty",
      description: "Kazakhstan's largest city, surrounded by majestic mountains and filled with cultural attractions.",
      image: "/images/almaty.jpg",
      featured: false
    });
    
    // Add sample tours
    this.createTour({
      title: "Silk Road Expedition",
      description: "Follow the ancient trade routes through Samarkand, Bukhara, and Khiva. Experience the history and culture of the legendary Silk Road.",
      price: "$1,299",
      duration: "7 Days",
      image: "https://images.unsplash.com/photo-1519074131066-bf5ec9b53b7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "3 Cities",
      maxPeople: 12,
      rating: "4.9/5",
      category: "Historical",
      featured: true
    });
    
    this.createTour({
      title: "Cultural Immersion",
      description: "Discover traditional crafts, participate in cultural workshops, and enjoy authentic cuisine in Uzbekistan's cultural centers.",
      price: "$899",
      duration: "5 Days",
      image: "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "2 Cities",
      maxPeople: 10,
      rating: "4.8/5",
      category: "Cultural",
      featured: true
    });
    
    this.createTour({
      title: "Desert Adventure",
      description: "Experience the Kyzylkum Desert with camel trekking, overnight in a yurt camp, and witness stunning desert landscapes.",
      price: "$749",
      duration: "4 Days",
      image: "https://images.unsplash.com/photo-1623953669874-2b464c79b8fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Desert",
      maxPeople: 8,
      rating: "4.7/5",
      category: "Adventure",
      featured: true
    });
    
    this.createTour({
      title: "Culinary Journey",
      description: "Explore Uzbekistan's rich gastronomic heritage, learn to cook traditional dishes, and visit local markets.",
      price: "$999",
      duration: "6 Days",
      image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "3 Cities",
      maxPeople: 8,
      rating: "4.9/5",
      category: "Culinary",
      featured: false
    });
    
    // Uzbekistan Focused Tours
    this.createTour({
      title: "Sufi Heritage Tour",
      description: "Follow the path of ancient Sufi traditions in Bukhara and Samarkand, visiting mystical shrines and experiencing spiritual ceremonies.",
      price: "$1,199",
      duration: "8 Days",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Bukhara, Samarkand",
      maxPeople: 10,
      rating: "4.8/5",
      category: "Cultural",
      featured: true
    });
    
    this.createTour({
      title: "Tashkent to Termez Expedition",
      description: "Discover southern Uzbekistan's hidden treasures, from ancient Buddhist monuments to natural reserves with breathtaking landscapes.",
      price: "$1,350",
      duration: "9 Days",
      image: "https://images.unsplash.com/photo-1618977347782-818f68d57efe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Tashkent, Termez, Boysun",
      maxPeople: 8,
      rating: "4.7/5",
      category: "Adventure",
      featured: false
    });
    
    this.createTour({
      title: "Aral Sea Expedition",
      description: "Witness the environmental changes and unique landscapes of the Aral Sea basin, staying in local communities and exploring ancient fortresses.",
      price: "$1,250",
      duration: "7 Days",
      image: "https://images.unsplash.com/photo-1620558135339-94d84b357312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Nukus, Muynak, Khiva",
      maxPeople: 10,
      rating: "4.6/5",
      category: "Eco",
      featured: true
    });
    
    this.createTour({
      title: "Fergana Valley Cultural Tour",
      description: "Explore the cradle of Uzbek craftsmanship in the Fergana Valley, famous for silk, ceramics, and traditional crafts passed down for generations.",
      price: "$899",
      duration: "5 Days",
      image: "https://images.unsplash.com/photo-1547636780-e41778614c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Fergana, Margilan, Rishtan",
      maxPeople: 12,
      rating: "4.9/5",
      category: "Cultural",
      featured: false
    });
    
    this.createTour({
      title: "Uzbekistan Architectural Wonders",
      description: "Immerse yourself in Uzbekistan's architectural masterpieces with special access to restoration projects and meetings with local historians.",
      price: "$1,499",
      duration: "10 Days",
      image: "https://images.unsplash.com/photo-1619229667147-d3230dcec80a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Tashkent, Samarkand, Bukhara, Khiva",
      maxPeople: 10,
      rating: "5.0/5",
      category: "Historical",
      featured: true
    });
    
    this.createTour({
      title: "Mountains of Uzbekistan",
      description: "Discover the untouched beauty of Uzbekistan's mountains, with hiking, village stays, and breathtaking panoramic views of the Tien Shan range.",
      price: "$1,150",
      duration: "8 Days",
      image: "https://images.unsplash.com/photo-1544735716-ea9ef790f105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Chimgan, Beldersay, Pskem Valley",
      maxPeople: 8,
      rating: "4.8/5",
      category: "Adventure",
      featured: false
    });
    
    this.createTour({
      title: "Photography Tour of Uzbekistan",
      description: "Capture the vibrant colors and rich textures of Uzbekistan with professional photography guidance at iconic sites and hidden local spots.",
      price: "$1,299",
      duration: "9 Days",
      image: "https://images.unsplash.com/photo-1596306499317-8490982fd4d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Tashkent, Samarkand, Bukhara, Khiva",
      maxPeople: 6,
      rating: "4.9/5",
      category: "Photography",
      featured: true
    });
    
    // Central Asia regional tours
    this.createTour({
      title: "Central Asian Odyssey",
      description: "Experience the diverse cultures and landscapes of Central Asia with this comprehensive tour through Uzbekistan, Kazakhstan, and Kyrgyzstan.",
      price: "$2,399",
      duration: "14 Days",
      image: "https://images.unsplash.com/photo-1629454549074-d6174532bdab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Multiple Cities",
      maxPeople: 10,
      rating: "4.8/5",
      category: "Multi-Country",
      featured: true
    });
    
    this.createTour({
      title: "Silk Road: Uzbekistan & Turkmenistan",
      description: "Follow the ancient Silk Road across two countries, witnessing spectacular monuments, desert landscapes, and living traditions.",
      price: "$1,899",
      duration: "12 Days",
      image: "https://images.unsplash.com/photo-1645964429113-c17353a0c93d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      cities: "Multiple Cities",
      maxPeople: 8,
      rating: "4.7/5",
      category: "Multi-Country",
      featured: false
    });
    
    // Add sample team members
    this.createTeamMember({
      name: "Dildora Khamidova",
      position: "Founder & CEO",
      description: "With over 1 year in tourism, Dildora's passion is showcasing Uzbekistan's rich heritage to the world.",
      image: "/images/team/team-member.jpg"
    });
    
    this.createTeamMember({
      name: "Aziz Rustamov",
      position: "Lead Tour Guide",
      description: "An expert in Uzbekistan's history and culture, Aziz brings stories of the Silk Road to life.",
      image: "/images/team/team-member.jpg"
    });
    
    this.createTeamMember({
      name: "Nigora Karimova",
      position: "Tour Operations Manager",
      description: "Nigora ensures seamless experiences with meticulous attention to every detail of your journey.",
      image: "/images/team/team-member.jpg"
    });
    
    this.createTeamMember({
      name: "Bobur Alimov",
      position: "Adventure Specialist",
      description: "An outdoor enthusiast, Bobur specializes in adventure tours to Uzbekistan's natural wonders.",
      image: "/images/team/team-member.jpg"
    });
    
    // Add sample testimonials
    this.createTestimonial({
      name: "Michael Stevens",
      location: "United Kingdom",
      text: "Our tour with Dildora Tours exceeded all expectations. The guides were knowledgeable and passionate, the accommodations were comfortable, and the cultural experiences were authentic and memorable. Highly recommended!",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      rating: 5
    });
    
    this.createTestimonial({
      name: "Emily Rodriguez",
      location: "Canada",
      text: "The Silk Road tour was an incredible journey through time. Our guide was passionate about sharing Uzbekistan's rich history and culture. The small group size made it personal, and we felt like family by the end.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      rating: 5
    });
    
    this.createTestimonial({
      name: "Toshiro Yamamoto",
      location: "Japan",
      text: "The Desert Adventure was unlike anything I've experienced. From camel trekking to sleeping under the stars in a yurt, every moment was magical. Dildora Tours' attention to detail and authentic experiences made this trip unforgettable.",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      rating: 5
    });
    
    // Add sample gallery images
    // Architecture category
    this.createGalleryImage({
      title: "Registan Square",
      category: "Architecture",
      image: "/images/gallery/registan-evening.jpg",
      description: "The heart of ancient Samarkand, featuring three majestic madrasas illuminated at twilight"
    });
    
    this.createGalleryImage({
      title: "Bibi-Khanym Mosque",
      category: "Architecture",
      image: "https://images.pexels.com/photos/13426641/pexels-photo-13426641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Shah-i-Zinda",
      category: "Architecture",
      image: "https://images.pexels.com/photos/15229493/pexels-photo-15229493.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Gur-e-Amir Mausoleum",
      category: "Architecture",
      image: "https://images.pexels.com/photos/13426739/pexels-photo-13426739.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Chor Minor",
      category: "Architecture",
      image: "https://images.pexels.com/photos/13426692/pexels-photo-13426692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    // Nature category
    this.createGalleryImage({
      title: "Nuratau Mountains",
      category: "Nature",
      image: "https://images.pexels.com/photos/15270554/pexels-photo-15270554.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Lake Charvak",
      category: "Nature",
      image: "https://images.pexels.com/photos/17898997/pexels-photo-17898997/free-photo-of-uzbekistan-charvak-lake-landscape.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Aydarkul Lake Sunset",
      category: "Nature",
      image: "https://images.pexels.com/photos/7177224/pexels-photo-7177224.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    // People category
    this.createGalleryImage({
      title: "Uzbek Craftsman",
      category: "People",
      image: "https://images.pexels.com/photos/6493756/pexels-photo-6493756.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Traditional Ceramics Maker",
      category: "People",
      image: "https://images.pexels.com/photos/2086193/pexels-photo-2086193.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Silk Road Merchant",
      category: "People",
      image: "https://images.pexels.com/photos/5945767/pexels-photo-5945767.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    // Food category
    this.createGalleryImage({
      title: "Uzbek Plov",
      category: "Food",
      image: "https://images.pexels.com/photos/6646336/pexels-photo-6646336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Uzbek Bread (Non)",
      category: "Food",
      image: "https://images.pexels.com/photos/5835359/pexels-photo-5835359.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    this.createGalleryImage({
      title: "Traditional Tea Service",
      category: "Food",
      image: "https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    });
    
    // Add sample staff members
    const hashedStaffPassword = await bcrypt.hash('worker123', 10);
    await this.createUser({
      username: 'worker1',
      password: hashedStaffPassword,
      fullName: 'Anvar Rahimov',
      role: 'staff'
    });
    
    await this.createUser({
      username: 'worker2',
      password: hashedStaffPassword,
      fullName: 'Malika Tashpulatova',
      role: 'staff'
    });
    
    // Add sample bookings
    const booking1 = await this.createBooking({
      tourId: 1,
      fullName: "John Smith",
      email: "john@example.com",
      phone: "+1 234 567 8901",
      numberOfPeople: 2,
      specialRequests: "Vegetarian meals preferred",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      paymentMethod: "visa",
      totalAmount: "$2,598", // $1,299 × 2 people
      paymentDetails: "Visa card ending in 4242"
    });
    
    const booking2 = await this.createBooking({
      tourId: 2,
      fullName: "Maria Garcia",
      email: "maria@example.com",
      phone: "+1 987 654 3210",
      numberOfPeople: 4,
      specialRequests: "Need airport pickup",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      paymentMethod: "plastic",
      totalAmount: "$3,596", // $899 × 4 people
      paymentDetails: "Humo card payment successful"
    });
    
    const booking3 = await this.createBooking({
      tourId: 3,
      fullName: "Akmal Yusupov",
      email: "akmal@example.com",
      phone: "+998 90 123 4567",
      numberOfPeople: 2,
      specialRequests: "Early check-in requested",
      startDate: new Date(), // Today
      paymentMethod: "cash",
      totalAmount: "$1,498", // $749 × 2 people
      paymentDetails: "30% deposit paid ($449.40)"
    });
    
    // Assign bookings to workers
    await this.assignBookingToWorker(booking1.id, 2); // Assign to worker1
    await this.assignBookingToWorker(booking2.id, 3); // Assign to worker2
    await this.assignBookingToWorker(booking3.id, 2); // Assign to worker1
    
    // Complete one booking
    await this.completeBooking(booking3.id);
    
    this.createGalleryImage({
      title: "Desert Landscape",
      category: "Nature",
      image: "https://images.unsplash.com/photo-1591120583691-91a4290087b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    });
    
    this.createGalleryImage({
      title: "Traditional Crafts",
      category: "People",
      image: "https://images.unsplash.com/photo-1523486968571-45439e131e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    });
    
    this.createGalleryImage({
      title: "Local Cuisine",
      category: "Food",
      image: "https://images.unsplash.com/photo-1527064539745-5264d796128b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    });
    
    this.createGalleryImage({
      title: "Historic Mosque",
      category: "Architecture",
      image: "https://images.unsplash.com/photo-1616128618694-96e9e896ecf7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    });
    
    this.createGalleryImage({
      title: "Mountain Scenery",
      category: "Nature",
      image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    });
    
    this.createGalleryImage({
      title: "Local Traditions",
      category: "People",
      image: "https://images.unsplash.com/photo-1504387432042-8aca549e4729?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    });
    
    this.createGalleryImage({
      title: "Ancient City",
      category: "Architecture",
      image: "https://images.unsplash.com/photo-1644329843931-09c25de6ec3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
    });
  }
}

export const storage = new MemStorage();
