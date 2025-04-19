import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();


router.post('/addNewUserByAdmin', async (req, res) => {
    try {
        const { firstName, lastName, email, password, teachClass, teachSubject, role, studentRollNo, studentGuardian } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            teachClass,
            teachSubject,
            role,
            studentRollNo,
            studentGuardian,
        });

        const userToSave = await newUser.save();
        res.status(201).json(userToSave);
    } catch (err) {
        console.error('Error adding new user:', err);
        res.status(500).json({ error: 'Failed to add user' });
    }
});
