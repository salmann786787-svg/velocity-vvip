import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../lib/prisma';

const signToken = (payload: object): string => {
    const secret = process.env.JWT_SECRET as string;
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, secret, options);
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, registrationSecret } = req.body;

        if (process.env.REGISTRATION_SECRET && registrationSecret !== process.env.REGISTRATION_SECRET) {
            res.status(403).json({ error: 'Invalid registration secret' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });

        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
