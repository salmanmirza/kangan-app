import React from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';

const StudentTodoSimpleCard = () => {
  const todos = [
    '📘 Submit Math Homework by Friday',
    '🧪 Science Lab Report due tomorrow',
    '🔔 New course material uploaded in History',
    '📊 Check grades for last quiz',
    '📅 Attend Zoom session at 3 PM',
  ];

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📝 Student To-Do & Notifications
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          {todos.map((item, index) => (
            <li key={index} style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default StudentTodoSimpleCard;