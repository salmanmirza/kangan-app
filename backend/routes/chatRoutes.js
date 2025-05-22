// src/server/routes/chat.js
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const router = express.Router();

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Use the environment variable for the API key
});

router.post('/', async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Processing chat message:', message);
        console.log('From user:', userId);

        try {
            // Use the gpt-4o-mini model which may have different pricing
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Using the specified model
                messages: [
                    { role: "system", content: "You are an AI assistant for an educational platform. Help students with their courses, assignments, and any educational questions. Keep responses concise and helpful." },
                    { role: "user", content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            });

            console.log('Received response from OpenAI');
            const aiMessage = completion.choices[0].message.content.trim();

            return res.json({ message: aiMessage });
        } catch (openaiError) {
            console.error('OpenAI API Error:', openaiError);

            // Handle quota errors with a friendly message
            if (openaiError.error?.type === 'insufficient_quota' ||
                openaiError.code === 'insufficient_quota' ||
                openaiError.status === 429) {

                return res.json({
                    message: "I'm currently unavailable due to high demand. Please try again later or contact support if you need immediate assistance.",
                    isPlaceholder: true
                });
            }

            // For other OpenAI-specific errors, provide a user-friendly message
            return res.json({
                message: "I'm having trouble processing your request right now. Please try again in a moment.",
                isPlaceholder: true
            });
        }
    } catch (error) {
        console.error('General error processing request:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

export default router;