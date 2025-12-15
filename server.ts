import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';

// Config
import db, { initializeDatabase } from './src/config/mysql';

// Routes
import authRoutes from './src/routes/auth';
import companyRoutes from './src/routes/companies';
import vehicleOwnerRoutes from './src/routes/vehicleOwners';
import driverRoutes from './src/routes/drivers';
import managerRoutes from './src/routes/managers';
import managerDashboardRoutes from './src/routes/manager';
import vehicleOwnerDashboardRoutes from './src/routes/vehicleOwner';
import driverDashboardRoutes from './src/routes/driver';
import tripRoutes from './src/routes/trips';
import documentRoutes from './src/routes/documents';
import paymentRoutes from './src/routes/payments';
import reportRoutes from './src/routes/reports';
import profileRoutes from './src/routes/profile';
import settingsRoutes from './src/routes/settings';
import companyDashboardRoutes from './src/routes/company';
import blogRoutes from './src/routes/blogRoutes';
import quoteRoutes from './src/routes/quoteRoutes';
import fileUploadRoutes from './src/routes/fileUpload';

// Middleware & Controllers
import { authenticateToken, requireRole } from './src/middleware/auth';
import { BlogController } from './src/controllers/BlogController';

console.log('🚀 Starting Prathmesh Roadlines Backend...');

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

console.log(`📍 Server configured to run on port: ${PORT}`);

// Socket.IO setup for real-time notifications
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
      process.env.COMPANY_URL || 'http://localhost:3002',
      process.env.DRIVER_URL || 'http://localhost:3003',
      process.env.VEHICLE_OWNER_URL || 'http://localhost:3004',
      'http://localhost:3005' // Additional port for other panels
    ],
    credentials: true
  }
});

// Store connected users and their socket IDs
const connectedUsers: { [userId: string]: string } = {};

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  // User joins their room based on user ID
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user_${userId}`);
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} joined their room`);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (const [userId, socketId] of Object.entries(connectedUsers)) {
      if (socketId === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

// Make io accessible to routes
declare global {
  var io: Server;
}
global.io = io;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    process.env.COMPANY_URL || 'http://localhost:3002',
    process.env.DRIVER_URL || 'http://localhost:3003',
    process.env.VEHICLE_OWNER_URL || 'http://localhost:3004',
    'http://localhost:3005' // Additional port for other panels
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
console.log('🔧 Initializing database connection...');
initializeDatabase();

// Routes
console.log('🔗 Setting up API routes...');

// File serving route - MUST be before other routes to avoid conflicts
app.get('/api/files/*', BlogController.serveFile);

app.use('/api/auth', authRoutes);

// Protected routes - require authentication
app.use('/api/companies', authenticateToken, companyRoutes);
app.use('/api/vehicle-owners', authenticateToken, vehicleOwnerRoutes);
app.use('/api/drivers', authenticateToken, driverRoutes);
app.use('/api/managers', authenticateToken, managerRoutes);
app.use('/api/profile',authenticateToken,profileRoutes)

// Company dashboard routes
app.use('/api/company', authenticateToken, companyDashboardRoutes);

// Manager dashboard routes
app.use('/api/manager', authenticateToken, requireRole(['manager']), managerDashboardRoutes);

// Vehicle owner dashboard routes
app.use('/api/vehicle-owner', authenticateToken, requireRole(['vehicle_owner']), vehicleOwnerDashboardRoutes);

// Driver dashboard routes
app.use('/api/driver', authenticateToken, requireRole(['driver']), driverDashboardRoutes);

// Manager-only routes (limited permissions)
app.use('/api/trips', authenticateToken, (req: any, res: any, next: any) => {
  // Managers can access trips
  if (req.user?.role === 'manager' || req.user?.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Managers and admins only.'
    });
  }
}, tripRoutes);

// Admin-only routes (full access)
app.use('/api/documents', authenticateToken, requireRole(['admin']), documentRoutes);
app.use('/api/payments', authenticateToken, requireRole(['admin']), paymentRoutes);
app.use('/api/reports', authenticateToken, requireRole(['admin']), reportRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

// File upload endpoints (for uploading new files)
app.use('/api/upload', fileUploadRoutes);

// Public routes - no authentication required
app.use('/api/blogs', blogRoutes);
app.use('/api/quotes', quoteRoutes);

// Admin-only blog management
app.use('/api/admin/blogs', authenticateToken, requireRole(['admin']), blogRoutes);

// Admin-only quote management
app.use('/api/admin/quotes', authenticateToken, requireRole(['admin']), quoteRoutes);

// Socket.IO endpoint for real-time notifications
app.post('/api/notifications/broadcast', authenticateToken, (req: Request, res: Response) => {
  const { userId, title, message, type = 'info' } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, message'
    });
  }

  // Send notification to specific user if userId is provided
  if (userId && connectedUsers[userId]) {
    io.to(`user_${userId}`).emit('notification', {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast to all connected users if no specific user
  if (!userId) {
    io.emit('notification', {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Notification sent successfully'
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Prathmesh Roadlines Backend is running',
    timestamp: new Date().toISOString(),
    database: 'MySQL',
    websockets: 'Socket.IO enabled',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
console.log('🌐 Starting HTTP server...');
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server startup error:', err);
  }
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await gracefulShutdown();
});

async function gracefulShutdown() {
  try {
    if (global.io) {
      console.log('📡 Closing Socket.IO server...');
      global.io.close();
    }

    // MySQL2 pool will close automatically when process exits
    console.log('🗄️ Database connections will close automatically...');

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}