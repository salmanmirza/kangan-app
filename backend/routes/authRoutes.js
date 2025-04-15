// const express = require('express');
import express from 'express';
const router = express.Router();
// const {login , register} = require('../controllers/authController.js')
import { login, register } from '../controllers/authController.js';
// const authRoutes = require('../routes/authRoutes.js');


router.post('/login', login);
router.post('/register', register);


export default router;