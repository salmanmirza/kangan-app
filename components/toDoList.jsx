// src/components/StudentQuestionTodo.jsx
import React from 'react';
import { 
  Box, Typography, List, ListItem, ListItemIcon, 
  ListItemText, Checkbox, Paper, CircularProgress 
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';

function StudentQuestionTodo({ 
  questions = [], 
  questionsLoading = false, 
  completedIds = new Set(),
  onQuestionCheck 
}) {
  return (
    <Paper elevation={2} sx={{ p: 2, width: '100%', mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <NotificationsIcon fontSize="small" sx={{ mr: 1 }} />
        Questions Todo List
      </Typography>

      {questionsLoading ? (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      ) : questions.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
          All questions completed! 🎉
        </Typography>
      ) : (
        <List>
          {questions.map(q => (
            <ListItem key={q.id} divider sx={{ py: 1 }}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  disabled={questionsLoading || completedIds.has(q.id)}
                  checked={completedIds.has(q.id)}
                  onChange={() => onQuestionCheck(q.id)}
                  sx={{ mr: 1 }}
                />
              </ListItemIcon>
              <ListItemIcon>
                <HelpOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={q.text} 
                primaryTypographyProps={{
                  style: {
                    textDecoration: completedIds.has(q.id) ? 'line-through' : 'none',
                    color: completedIds.has(q.id) ? 'text.secondary' : 'inherit'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default StudentQuestionTodo;