import React, { useEffect, useState } from 'react';
import {
    Typography,
    Container,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Link,
    Box
} from '@mui/material';
import axios from 'axios';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id;

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                let endpoint = '';

                if (role === 'student') {
                    endpoint = `http://localhost:3001/submissions/student/${userId}`;
                } else if (role === 'teacher') {
                    endpoint = `http://localhost:3001/submissions/teacher/${userId}`;
                } else if (role === 'admin') {
                    endpoint = `http://localhost:3001/submissions/admin`;
                }

                const res = await axios.get(endpoint);
                setSubmissions(res.data || []);
            } catch (err) {
                console.error('Failed to fetch submissions', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [role, userId]);

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Typography variant="h5">Loading Submissions...</Typography>
                <CircularProgress sx={{ mt: 2 }} />
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="xl" sx={{ mt: { xs: 10, md: 12 }, ml: { xs: 0, md: 18 }, pr: { xs: 2, md: 4 } }}>
                <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: 3, overflowX: 'auto' }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}
                    >
                        {role === 'student' && 'Your Submissions'}
                        {role === 'teacher' && 'Submissions for Your Courses'}
                        {role === 'admin' && 'All Submissions'}
                    </Typography>

                    {submissions.length === 0 ? (
                        <Typography variant="body1">No submissions found.</Typography>
                    ) : (
                        <TableContainer component={Paper} elevation={2}>
                            <Table sx={{ minWidth: 1100 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Assignment Title</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                                        {role !== 'student' && (
                                            <TableCell sx={{ fontWeight: 'bold' }}>Submitted By</TableCell>
                                        )}
                                        <TableCell sx={{ fontWeight: 'bold' }}>Submitted On</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>File</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {submissions.map((sub, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell>{sub.assignment?.title || 'Untitled'}</TableCell>
                                            <TableCell>{sub.course?.courseName || 'Unknown'}</TableCell>
                                            {role !== 'student' && (
                                                <TableCell>
                                                    {sub.student
                                                        ? `${sub.student.firstName || ''} ${sub.student.lastName || ''}`
                                                        : 'Unknown'}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {sub.submittedAt
                                                    ? new Date(sub.submittedAt).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <a
                                                    href={`http://localhost:3001/uploads/submissions/${sub.fileUrl?.split('/').pop()}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Submission
                                                </a>

                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Container>
            <Box className="joyride-submissions">
                {/* Submissions UI */}
            </Box>

        </>
    );
};

export default Submissions;
