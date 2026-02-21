import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const customers = await prisma.customer.findMany({
            include: { reservations: true },
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(String(id)) },
            include: { reservations: true }
        });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, company, isVIP } = req.body;
        const customer = await prisma.customer.create({
            data: { name, email, phone, company, isVIP: isVIP ?? false }
        });
        res.status(201).json(customer);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'A customer with that email already exists' });
            return;
        }
        res.status(500).json({ error: 'Failed to create customer' });
    }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;
        const customer = await prisma.customer.update({
            where: { id: parseInt(String(id)) },
            data
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.customer.delete({ where: { id: parseInt(String(id)) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};
