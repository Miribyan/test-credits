import express, { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as balanceController from '../controllers/balanceController.js';
import * as transactionController from '../controllers/transactionController.js';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../utils/auth.js';

const router: Router = express.Router();

// Route for registration and login
router.post('/users', authController.register);
router.post('/login', authController.login);

// Route for retrieving all users
router.get('/users', authenticateToken, userController.getUsers);

// Route for retrieving balance (authentication required)
router.get('/balance', authenticateToken, balanceController.getBalance);

// Routes for handling transactions (authentication required)
router.get('/transactions', authenticateToken, transactionController.getTransactions);
router.post('/transactions', authenticateToken, transactionController.createTransaction);


// EXTRA

// Route for filtering transactions (authentication required)
router.get('/transactions/filter', authenticateToken, transactionController.getFilteredTransactions);

// Route for copying a specific transaction by ID (authentication required)
router.post('/transactions/copy/:transactionId', authenticateToken, transactionController.copyTransaction);

export default router;