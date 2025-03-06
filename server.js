// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import morgan from 'morgan';
// import connectDB from './config/db.js';
// import userRoutes from './routes/userRoutes.js';
// import bookingRoutes from './routes/bookingRoutes';

// dotenv.config();

// connectDB();

// const app = express();

// // CORS configuration
// app.use(cors({
//   origin: [
//     process.env.CLIENT_URL,
//     'https://schedura-landing-page.vercel.app',
//     'http://localhost:5173'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// app.use(express.json());
// app.use(morgan('dev'));

// // API routes
// app.use('/api/users', userRoutes);
// app.use('/api/bookings', bookingRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - updated for Vercel deployment
const corsOptions = {
  origin: ['https://schedura-landing-page.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle OPTIONS requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

module.exports = app; // Export for Vercel serverless functions