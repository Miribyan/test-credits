import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import logger from '../utils/logger.js';

export async function register(req: Request, res: Response) {
    const { username, password, email } = req.body;
    try {
        // Check for existing username
        const existingUsernameUser = await User.findUserByUsername(username);
        if (existingUsernameUser) {
            res.status(409).json({ message: 'User with this username already exists' });
            return
        }

        // Check for existing email
        const existingEmailUser = await User.findUserByEmail(email);
        if (existingEmailUser) {
            res.status(409).json({ message: 'User with this email already exists' });
            return
        }

        // Create a new user if validations pass
        const newUser = await User.createUser(username, password, email);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
        
    } catch (error) {

        logger.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error });

    }
}

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
        const user = await User.findUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.json({ id_token: token });
    } catch (error) {
        logger.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login', error });
    }
}