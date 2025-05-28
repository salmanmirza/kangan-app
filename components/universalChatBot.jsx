// src/components/UniversalChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Fab, Paper, TextField, Typography, IconButton,
  CircularProgress, Collapse, Avatar, Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

function UniversalChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!token && !!user);
  }, []);
  
  // Set initial welcome message
  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user'));
      setMessages([{
        text: `Hello ${user?.firstName || 'there'}! How can I help you today? You can ask me about your courses, assignments, or profile.`,
        sender: 'ai',
        timestamp: new Date()
      }]);
    } else {
      setMessages([{
        text: "👋 Welcome to Kangan! I can help you learn how to use our platform. Ask me about logging in, updating your profile, or accessing courses and assignments.",
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isAuthenticated]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      let response;
      
      if (isAuthenticated) {
        // Send to authenticated endpoint
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        response = await axios.post('http://localhost:3001/api/chat', { 
          message: input,
          userId: user._id
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Send to guest endpoint
        response = await axios.post('http://localhost:3001/api/guest/chat', { 
          message: input
        });
      }
      
      // Add AI response
      setMessages(prev => [...prev, { 
        text: response.data.message, 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message
      setMessages(prev => [...prev, { 
        text: "Sorry, I couldn't process that. Please try again.", 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Chat toggle button */}
      <Tooltip title={open ? "Close chat" : "Need help?"}>
        <Fab 
          color="primary" 
          onClick={() => setOpen(!open)}
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            right: 0,
            boxShadow: 3,
            bgcolor: open ? 'grey.700' : 'primary.main'
          }}
        >
          {open ? <CloseIcon /> : <SmartToyIcon />}
        </Fab>
      </Tooltip>
      
      {/* Chat window */}
      <Collapse in={open} timeout={300}>
        <Paper 
          elevation={4} 
          sx={{ 
            width: 350, 
            height: 450, 
            mb: 2, 
            mr: 2, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {/* Chat header */}
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Kangan Assistant</Typography>
            {!isAuthenticated && <Typography variant="caption" sx={{ ml: 1 }}>(Guest Mode)</Typography>}
          </Box>
          
          {/* Messages area */}
          <Box sx={{ 
            p: 2, 
            flexGrow: 1, 
            overflow: 'auto',
            bgcolor: 'grey.100'
          }}>
            {messages.map((msg, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  mb: 2,
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main',
                    mr: msg.sender === 'user' ? 0 : 1,
                    ml: msg.sender === 'user' ? 1 : 0
                  }}
                >
                  {msg.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper 
                  sx={{ 
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: msg.sender === 'user' ? 'primary.light' : 'white',
                    color: msg.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input area */}
          <Box sx={{ 
            p: 1.5, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex'
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask a question..."
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{ mr: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSend} 
              disabled={loading || input.trim() === ''}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
}

export default UniversalChatBot;