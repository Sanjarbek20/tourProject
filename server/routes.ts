import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactInquirySchema, insertNewsletterSubscriptionSchema, insertBookingSchema, users, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { compare, hash } from "bcrypt";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Extended express Request type with user property for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    isAuthenticated: boolean;
  }
}

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Create admin dashboard stats endpoint
  app.get('/api/admin/stats', isAuthenticated, async (req, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUser(req.session.userId as number);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      // Get all bookings for stats
      const bookings = await storage.getBookings();
      
      // Get all users
      const users = await storage.getUsers();
      
      // Get all tours
      const tours = await storage.getTours();
      
      // Calculate total revenue (mock total since we might not have price in bookings)
      const totalRevenue = bookings.reduce((sum, booking) => {
        // Assume each booking has a standard value of $100 if no price
        return sum + 100;
      }, 0);
      
      // Get booking counts by month (simplified mock data)
      const bookingsByMonth = [
        { month: "Jan", count: 15 },
        { month: "Feb", count: 20 },
        { month: "Mar", count: 25 },
        { month: "Apr", count: 35 },
        { month: "May", count: 40 },
        { month: "Jun", count: 30 },
        { month: "Jul", count: 45 },
        { month: "Aug", count: 50 },
        { month: "Sep", count: 35 },
        { month: "Oct", count: 25 },
        { month: "Nov", count: 30 },
        { month: "Dec", count: 20 },
      ];
      
      // Get booking counts by status
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const bookingsByStatus = statuses.map(status => {
        const count = bookings.filter(booking => booking.status === status).length;
        return {
          status: status === 'pending' ? 'Kutilmoqda' : 
                 status === 'confirmed' ? 'Tasdiqlangan' : 
                 status === 'completed' ? 'Bajarilgan' : 'Bekor qilingan',
          count
        };
      });
      
      // Get popular tours
      const popularTours = tours.slice(0, 5).map((tour, index) => ({
        tourId: tour.id,
        tourTitle: tour.title,
        bookingsCount: 50 - index * 5  // Simple decreasing count for now
      }));
      
      // Get recent bookings (most recent 5)
      const recentBookings = bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(booking => {
          // Find tour title if available
          const tour = tours.find(t => t.id === booking.tourId);
          return {
            id: booking.id,
            tourId: booking.tourId,
            fullName: booking.fullName,
            startDate: booking.startDate || new Date().toISOString(),
            status: booking.status || 'pending',
            tour: tour ? { title: tour.title } : undefined
          };
        });
      
      // Construct and return stats object
      const stats = {
        totalBookings: bookings.length,
        totalUsers: users.length,
        totalRevenue: totalRevenue,
        totalTours: tours.length,
        recentBookings,
        popularTours,
        bookingsByMonth,
        bookingsByStatus
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error generating admin stats:', error);
      res.status(500).json({ message: 'Failed to retrieve admin statistics' });
    }
  });
  
  // User management API endpoints
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });
  
  // Get only staff users
  app.get('/api/users/staff', isAuthenticated, async (req, res) => {
    try {
      // Check if the current user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if the user is an admin
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      const allUsers = await storage.getUsers();
      const staffUsers = allUsers.filter(user => user.role === 'staff');
      res.json(staffUsers);
    } catch (error) {
      console.error('Error fetching staff users:', error);
      res.status(500).json({ message: 'Failed to fetch staff users' });
    }
  });
  
  app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username is already taken' });
      }
      
      // Hash the password
      const hashedPassword = await hash(validatedData.password, 10);
      
      // Create the new user with hashed password
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
  app.delete('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prevent deleting the current logged-in user
      if (req.session.userId === id) {
        return res.status(403).json({ message: 'Cannot delete your own account' });
      }
      
      await storage.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });
  
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("Login attempt:", username);
      
      if (!username || !password) {
        console.log("Login failed: Missing username or password");
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log("Login failed: User not found");
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log("User found:", {
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      const isPasswordValid = await compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log("Login failed: Invalid password");
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAuthenticated = true;
      
      console.log("Login successful. Session data set:", {
        userId: req.session.userId,
        username: req.session.username,
        isAuthenticated: req.session.isAuthenticated
      });
      
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.id, 
          username: user.username,
          fullName: user.fullName,
          role: user.role
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });
  
  app.get('/api/auth/current-user', async (req, res) => {
    console.log("Current user check - Session data:", {
      isAuthenticated: req.session.isAuthenticated,
      userId: req.session.userId,
      username: req.session.username
    });
    
    if (req.session.isAuthenticated && req.session.userId !== undefined) {
      // Type assertion to help TypeScript understand userId is a number
      const userId = req.session.userId as number;
      
      console.log("Current user check - Retrieving user with ID:", userId);
      
      // Fetch full user data to include role and fullName
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log("Current user check - User not found in database, destroying session");
        req.session.destroy(() => {
          res.json({ isAuthenticated: false });
        });
        return;
      }
      
      console.log("Current user check - User retrieved from database:", {
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      res.json({ 
        isAuthenticated: true, 
        user: { 
          id: user.id, 
          username: user.username,
          fullName: user.fullName,
          role: user.role
        } 
      });
    } else {
      console.log("Current user check - Not authenticated");
      res.json({ isAuthenticated: false });
    }
  });
  
  // Worker-specific routes
  // Middleware to check if the user is a worker (staff)
  const isStaffMember = async (req: Request, res: Response, next: NextFunction) => {
    console.log("isStaffMember middleware - Checking session:", {
      isAuthenticated: req.session.isAuthenticated,
      userId: req.session.userId
    });
    
    if (!req.session.isAuthenticated || !req.session.userId) {
      console.log("isStaffMember middleware - Not authenticated or no user ID");
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      console.log("isStaffMember middleware - User not found in database");
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log("isStaffMember middleware - User found:", {
      id: user.id,
      username: user.username,
      role: user.role
    });
    
    // Allow both 'admin' and 'staff' roles to access staff routes
    if (user.role === 'staff' || user.role === 'admin') {
      console.log("isStaffMember middleware - Access granted");
      next();
    } else {
      console.log("isStaffMember middleware - Access denied, invalid role:", user.role);
      res.status(403).json({ message: 'Forbidden. Staff access only.' });
    }
  };
  
  // Get worker stats for dashboard
  app.get('/api/worker/stats', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const workerId = req.session.userId;
      
      // Get worker information
      const worker = await storage.getUser(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
      
      // Get recent bookings assigned to this worker
      const bookings = await storage.getBookingsByWorkerId(workerId);
      
      // Get today's bookings count
      const todayBookingsCount = await storage.getTodayBookingsCountByWorkerId(workerId);
      
      // Get completed bookings count
      const completedBookingsCount = await storage.getCompletedBookingsCountByWorkerId(workerId);
      
      // Get tours information to add tour names to the bookings
      const tours = await storage.getTours();
      
      // Map bookings to include tour name
      const recentBookings = bookings.map(booking => {
        const tour = tours.find(t => t.id === booking.tourId);
        return {
          ...booking,
          tourName: tour ? tour.title : 'Unknown Tour'
        };
      });
      
      res.json({
        workerName: worker.fullName,
        todayBookingsCount,
        completedBookingsCount,
        recentBookings: recentBookings.slice(0, 5) // Limit to 5 recent bookings
      });
    } catch (error) {
      console.error('Error fetching worker stats:', error);
      res.status(500).json({ message: 'Failed to fetch worker statistics' });
    }
  });
  
  // Get worker's assigned bookings
  app.get('/api/worker/bookings', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookings = await storage.getBookingsByWorkerId(req.session.userId);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching worker bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });
  
  // Get individual booking details for worker
  app.get('/api/worker/bookings/:id', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      // Get booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get user to check role/permissions
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if booking is assigned to this worker or the user is an admin
      if (booking.assignedToId !== req.session.userId && user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this booking' });
      }
      
      res.json(booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).json({ message: 'Failed to fetch booking details' });
    }
  });
  

  
  // Update booking status (complete a booking)
  app.post('/api/worker/bookings/:id/complete', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookingId = parseInt(req.params.id);
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      // Check if the booking exists and is assigned to this worker
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get the user to check role
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (booking.assignedToId !== req.session.userId && user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to complete this booking' });
      }
      
      const updatedBooking = await storage.completeBooking(bookingId);
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error completing booking:', error);
      res.status(500).json({ message: 'Failed to complete booking' });
    }
  });
  
  // Update booking status (any status) - PATCH version for frontend
  app.patch('/api/worker/bookings/:id/status', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      // Check if the booking exists and is assigned to this worker
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get the user to check role
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (booking.assignedToId !== req.session.userId && user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to update this booking' });
      }
      
      // If status is 'completed', use the completeBooking method which also sets completedAt
      let updatedBooking;
      if (status === 'completed') {
        updatedBooking = await storage.completeBooking(bookingId);
      } else {
        updatedBooking = await storage.updateBookingStatus(bookingId, status);
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  });
  
  // POST version for compatibility
  app.post('/api/worker/bookings/:id/status', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      // Check if the booking exists and is assigned to this worker
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get the user to check role
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (booking.assignedToId !== req.session.userId && user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to update this booking' });
      }
      
      // If status is 'completed', use the completeBooking method which also sets completedAt
      let updatedBooking;
      if (status === 'completed') {
        updatedBooking = await storage.completeBooking(bookingId);
      } else {
        updatedBooking = await storage.updateBookingStatus(bookingId, status);
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  });
  
  // Update booking notes
  app.patch('/api/worker/bookings/:id/notes', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookingId = parseInt(req.params.id);
      const { notes } = req.body;
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (notes === undefined) {
        return res.status(400).json({ message: 'Notes field is required' });
      }
      
      // Check if the booking exists and is assigned to this worker
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get the user to check role
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (booking.assignedToId !== req.session.userId && user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to update this booking' });
      }
      
      const updatedBooking = await storage.updateBookingNotes(bookingId, notes);
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking notes:', error);
      res.status(500).json({ message: 'Failed to update booking notes' });
    }
  });
  
  // Update booking deposit status
  app.patch('/api/worker/bookings/:id/deposit', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookingId = parseInt(req.params.id);
      const { depositPaid } = req.body;
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (depositPaid === undefined) {
        return res.status(400).json({ message: 'Deposit status field is required' });
      }
      
      // Check if the booking exists and is assigned to this worker
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get the user to check role
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (booking.assignedToId !== req.session.userId && user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to update this booking' });
      }
      
      // Only allow for cash payments
      if (booking.paymentMethod !== 'cash') {
        return res.status(400).json({ message: 'Deposit status is only applicable for cash payments' });
      }
      
      const updatedBooking = await storage.updateDepositStatus(bookingId, depositPaid);
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking deposit status:', error);
      res.status(500).json({ message: 'Failed to update deposit status' });
    }
  });
  
  // Update booking payment status
  app.patch('/api/worker/bookings/:id/payment-status', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const bookingId = parseInt(req.params.id);
      const { paymentStatus } = req.body;
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (!paymentStatus) {
        return res.status(400).json({ message: 'Payment status field is required' });
      }
      
      if (!['unpaid', 'partially_paid', 'paid'].includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status value' });
      }
      
      // Check if the booking exists and is assigned to this worker
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get the user to check role
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      if (booking.assignedToId !== req.session.userId && user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to update this booking' });
      }
      
      // When marking as paid, also mark deposit as paid for cash payments
      let depositStatus;
      if (paymentStatus === 'paid' && booking.paymentMethod === 'cash') {
        depositStatus = true;
      }
      
      const updatedBooking = await storage.updateBookingPaymentStatus(bookingId, paymentStatus, depositStatus);
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Failed to update payment status' });
    }
  });
  
  // Get worker profile
  app.get('/api/worker/profile', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send password to client
      const { password, ...workerProfile } = user;
      
      res.json(workerProfile);
    } catch (error) {
      console.error('Error fetching worker profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });
  
  // Update worker profile
  app.patch('/api/worker/profile', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { fullName, email, phone } = req.body;
      
      // Create user with updated fields
      const updatedUser = await storage.updateUser(req.session.userId, {
        fullName
      });
      
      // Don't send password to client
      const { password, ...userProfile } = updatedUser;
      
      res.json(userProfile);
    } catch (error) {
      console.error('Error updating worker profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });
  
  // Change password
  app.post('/api/worker/change-password', isStaffMember, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      
      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isPasswordValid = await compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(403).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await hash(newPassword, 10);
      
      // Update password
      await storage.updateUserPassword(req.session.userId, hashedPassword);
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });
  
  // Initialize admin user
  app.post('/api/auth/setup', async (req, res) => {
    try {
      const existingUsers = await db.select().from(users);
      
      // Only allow setup if no users exist
      if (existingUsers.length > 0) {
        return res.status(403).json({ message: 'Setup already completed' });
      }
      
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
      
      const hashedPassword = await hash(password, 10);
      const user = await storage.createUser({ 
        username, 
        password: hashedPassword,
        fullName: "Admin User",
        role: "admin" 
      });
      
      res.status(201).json({ message: 'Admin user created successfully', user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create admin user' });
    }
  });
  
  // Admin routes
  app.get('/api/inquiries', isAuthenticated, async (req, res) => {
    try {
      const inquiries = await storage.getContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch inquiries' });
    }
  });
  
  app.get('/api/inquiries/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid inquiry ID' });
      }
      
      const inquiry = await storage.getContactInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ message: 'Inquiry not found' });
      }
      
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch inquiry' });
    }
  });
  
  app.patch('/api/inquiries/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid inquiry ID' });
      }
      
      if (!status || !['pending', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedInquiry = await storage.updateContactInquiryStatus(id, status);
      res.json(updatedInquiry);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update inquiry status' });
    }
  });
  
  // Get all tours
  app.get('/api/tours', async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tours' });
    }
  });
  
  // Get a single tour by ID
  app.get('/api/tours/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid tour ID' });
      }
      
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tour' });
    }
  });
  
  // Get featured tours
  app.get('/api/featured-tours', async (req, res) => {
    try {
      const featuredTours = await storage.getFeaturedTours();
      res.json(featuredTours);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured tours' });
    }
  });
  
  // Get tours by category
  app.get('/api/tours/category/:category', async (req, res) => {
    try {
      const category = req.params.category;
      const tours = await storage.getToursByCategory(category);
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tours by category' });
    }
  });
  
  // Get all destinations
  app.get('/api/destinations', async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch destinations' });
    }
  });
  
  // Get a single destination by ID
  app.get('/api/destinations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
      
      res.json(destination);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch destination' });
    }
  });
  
  // Get featured destinations
  app.get('/api/featured-destinations', async (req, res) => {
    try {
      const featuredDestinations = await storage.getFeaturedDestinations();
      res.json(featuredDestinations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured destinations' });
    }
  });
  
  // Get all team members
  app.get('/api/team', async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch team members' });
    }
  });
  
  // Get all testimonials
  app.get('/api/testimonials', async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch testimonials' });
    }
  });
  
  // Get all gallery images
  app.get('/api/gallery', async (req, res) => {
    try {
      const galleryImages = await storage.getGalleryImages();
      res.json(galleryImages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch gallery images' });
    }
  });
  
  // Get gallery images by category
  app.get('/api/gallery/category/:category', async (req, res) => {
    try {
      const category = req.params.category;
      const galleryImages = await storage.getGalleryImagesByCategory(category);
      res.json(galleryImages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch gallery images by category' });
    }
  });
  
  // Create a contact inquiry
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactInquirySchema.parse(req.body);
      const inquiry = await storage.createContactInquiry(validatedData);
      res.status(201).json({ success: true, message: 'Your inquiry has been submitted successfully', data: inquiry });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid inquiry data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to submit inquiry' });
    }
  });
  
  // Reply to an inquiry
  app.post('/api/inquiries/:id/reply', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { response } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid inquiry ID' });
      }
      
      if (!response || typeof response !== 'string' || response.trim() === '') {
        return res.status(400).json({ message: 'Response is required' });
      }
      
      const updatedInquiry = await storage.updateContactInquiryResponse(id, response);
      
      res.json(updatedInquiry);
    } catch (error) {
      res.status(500).json({ message: 'Failed to reply to inquiry' });
    }
  });
  
  // Subscribe to newsletter
  app.post('/api/newsletter', async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.createNewsletterSubscription(validatedData);
      res.status(201).json({ success: true, message: 'You have been subscribed to our newsletter', data: subscription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid subscription data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to subscribe to newsletter' });
    }
  });

  // Tour Booking API endpoints
  app.post('/api/bookings', async (req, res) => {
    try {
      // Handle date format conversion
      const bookingData = { ...req.body };
      
      // If startDate is a string, convert it to a Date object
      if (typeof bookingData.startDate === 'string') {
        bookingData.startDate = new Date(bookingData.startDate);
      }
      
      const validatedData = insertBookingSchema.parse(bookingData);
      
      // Make sure the tour exists
      const tour = await storage.getTour(validatedData.tourId);
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid booking data', errors: error.errors });
      }
      console.error('Booking error:', error);
      res.status(500).json({ message: 'Failed to create booking' });
    }
  });
  
  // Admin booking endpoints (protected)
  app.get('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });
  
  app.get('/api/bookings/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch booking' });
    }
  });
  
  // Assign booking to worker (admin only)
  app.patch('/api/bookings/:id/assign', isAuthenticated, async (req, res) => {
    try {
      // Check if the current user is an admin
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      const { workerId } = req.body;
      
      // If workerId is null, that means unassign
      if (workerId !== null) {
        // Check if the worker exists and is a staff member
        const worker = await storage.getUser(workerId);
        if (!worker) {
          return res.status(404).json({ message: 'Worker not found' });
        }
        
        if (worker.role !== 'staff') {
          return res.status(400).json({ message: 'Selected user is not a staff member' });
        }
      }
      
      // Assign booking to worker
      const updatedBooking = await storage.assignBookingToWorker(bookingId, workerId);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error assigning booking to worker:', error);
      res.status(500).json({ message: 'Failed to assign booking to worker' });
    }
  });
  
  app.patch('/api/bookings/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  });
  
  app.patch('/api/bookings/:id/payment', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (!paymentStatus || !['unpaid', 'paid', 'refunded'].includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      
      const updatedBooking = await storage.updateBookingPaymentStatus(id, paymentStatus);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update payment status' });
    }
  });
  
  app.patch('/api/bookings/:id/notes', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }
      
      if (!notes || typeof notes !== 'string') {
        return res.status(400).json({ message: 'Notes are required' });
      }
      
      const updatedBooking = await storage.updateBookingNotes(id, notes);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update booking notes' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
