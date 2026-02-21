import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAffiliates = async (req: Request, res: Response): Promise<void> => {
    try {
        const affiliates = await prisma.affiliate.findMany({ orderBy: { companyName: 'asc' } });
        res.json(affiliates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch affiliates' });
    }
};

export const createAffiliate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, contactName, email, phone, city, commissionRate } = req.body;
        const affiliate = await prisma.affiliate.create({
            data: { companyName, contactName, email, phone, city, commissionRate }
        });
        res.status(201).json(affiliate);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'An affiliate with that email already exists' });
            return;
        }
        res.status(500).json({ error: 'Failed to create affiliate' });
    }
};

export const updateAffiliate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;
        const affiliate = await prisma.affiliate.update({
            where: { id: parseInt(String(id)) },
            data
        });
        res.json(affiliate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update affiliate' });
    }
};

export const deleteAffiliate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.affiliate.delete({ where: { id: parseInt(String(id)) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete affiliate' });
    }
};
