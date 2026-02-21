import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDrivers = async (req: Request, res: Response): Promise<void> => {
    try {
        const drivers = await prisma.driver.findMany({ orderBy: { name: 'asc' } });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, licenseNumber, assignedVehicle } = req.body;
        const driver = await prisma.driver.create({
            data: { name, email, phone, licenseNumber, assignedVehicle }
        });
        res.status(201).json(driver);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'A driver with that email or license number already exists' });
            return;
        }
        res.status(500).json({ error: 'Failed to create driver' });
    }
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;
        const driver = await prisma.driver.update({
            where: { id: parseInt(String(id)) },
            data
        });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update driver' });
    }
};

export const deleteDriver = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.driver.delete({ where: { id: parseInt(String(id)) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete driver' });
    }
};
