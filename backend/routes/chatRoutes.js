// routes/chatRoutes.js
import express from 'express';
import { processAuthenticatedMessage } from '../services/chatService.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'k4ng4n123'); // Use your actual secret
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Authenticated chat endpoint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.body.userId || req.user.id; // Get from body or token
    
    // Process with authenticated context
    const response = await processAuthenticatedMessage(message, userId);
    
    res.json({ message: response.message });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: "Sorry, I had trouble processing your request." });
  }
});

export default router;