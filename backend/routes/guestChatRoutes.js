// routes/guestChatRoutes.js
import express from 'express';
import { processGuestMessage } from '../services/chatService.js';

const router = express.Router();

// Guest chat endpoint - no authentication required
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Process message with guest context
    const response = await processGuestMessage(message);
    
    res.json(response);
  } catch (error) {
    console.error('Guest chat error:', error);
    res.status(500).json({ 
      message: "Sorry, I'm having trouble processing your request right now." 
    });
  }
});

export default router;