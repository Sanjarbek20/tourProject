import { mysqlTable, varchar, int, boolean, timestamp, date, text, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema for authentication
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  role: mysqlEnum("role", ['admin', 'staff']).default('staff').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedBookings: many(bookings),
}));

// Tour packages schema
export const tours = mysqlTable("tours", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  cities: varchar("cities", { length: 255 }).notNull(),
  maxPeople: int("max_people").notNull(),
  rating: varchar("rating", { length: 10 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  featured: boolean("featured").default(false),
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

// Destinations schema
export const destinations = mysqlTable("destinations", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  featured: boolean("featured").default(false),
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
});

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

// Team members schema
export const teamMembers = mysqlTable("team_members", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 255 }).notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Testimonials schema
export const testimonials = mysqlTable("testimonials", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  text: text("text").notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Gallery images schema
export const galleryImages = mysqlTable("gallery_images", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  description: text("description"),
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
});

export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;

// Contact form schema
export const contactInquiries = mysqlTable("contact_inquiries", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  tour: varchar("tour", { length: 100 }),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  response: text("response"),
  responseDate: timestamp("response_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactInquirySchema = createInsertSchema(contactInquiries).omit({
  id: true,
  status: true,
  response: true,
  responseDate: true,
  createdAt: true,
});

export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
export type ContactInquiry = typeof contactInquiries.$inferSelect;

// Newsletter subscriptions schema
export const newsletterSubscriptions = mysqlTable("newsletter_subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

// Tour bookings schema
export const bookings = mysqlTable("bookings", {
  id: int("id").primaryKey().autoincrement(),
  tourId: int("tour_id").notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  numberOfPeople: int("number_of_people").notNull(),
  specialRequests: text("special_requests"),
  startDate: date("start_date").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, confirmed, cancelled
  paymentMethod: mysqlEnum("payment_method", ['plastic', 'visa', 'cash', 'later']).notNull(),
  depositPaid: boolean("deposit_paid").default(false), // For cash payments to track 30% deposit
  paymentStatus: varchar("payment_status", { length: 20 }).default("unpaid").notNull(), // unpaid, partially_paid, paid, refunded
  paymentDetails: text("payment_details"), // To store any payment reference or receipt information
  totalAmount: varchar("total_amount", { length: 50 }).notNull(), // The total cost of the booking
  notes: text("admin_notes"),
  assignedToId: int("assigned_to_id"), // Worker ID who is assigned to this booking
  completedAt: timestamp("completed_at"), // When the booking was marked as completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  notes: true,
  assignedToId: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Relations
export const bookingsRelations = relations(bookings, ({ one }) => ({
  tour: one(tours, {
    fields: [bookings.tourId],
    references: [tours.id],
  }),
  assignedTo: one(users, {
    fields: [bookings.assignedToId],
    references: [users.id],
  }),
}));