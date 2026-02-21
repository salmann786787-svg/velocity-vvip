import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createReservation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId, customer, email, phone, company, pickupDate, pickupTime, stops, vehicle, passengers, hours, total, rateBreakdown, status, specialInstructions, policyType } = req.body;

        let finalCustomerId = customerId;

        if (!finalCustomerId && email) {
            let existingCustomer = await prisma.customer.findUnique({ where: { email: email } });
            if (!existingCustomer) {
                existingCustomer = await prisma.customer.create({
                    data: {
                        name: customer || 'Unknown',
                        email: email,
                        phone: phone || '0000000000',
                        company: company || null
                    }
                });
            }
            finalCustomerId = existingCustomer.id;
        }

        if (!finalCustomerId) {
            res.status(400).json({ error: 'Customer ID or full customer details (email) are required' });
            return;
        }

        // Generate confirmation number
        const confirmationNumber = `RES-${Date.now().toString(36).toUpperCase()}`;

        const reservation = await prisma.reservation.create({
            data: {
                confirmationNumber,
                customerId: finalCustomerId,
                pickupDate: new Date(pickupDate),
                pickupTime,
                stops,
                vehicle,
                passengers,
                hours,
                total,
                rateBreakdown,
                status: status ? status.toUpperCase() : 'PENDING',
                specialInstructions: specialInstructions || null,
                policyType: policyType ? policyType.toUpperCase() : 'CUSTOMER'
            },
            include: { customer: true }
        });

        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create reservation' });
    }
};

export const getReservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, startDate, endDate } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (startDate && endDate) {
            where.pickupDate = {
                gte: new Date(String(startDate)),
                lte: new Date(String(endDate))
            };
        }

        const reservations = await prisma.reservation.findMany({
            where,
            include: { customer: true },
            orderBy: { pickupDate: 'asc' }
        });

        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
};

export const updateReservation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;

        const reservation = await prisma.reservation.update({
            where: { id: parseInt(String(id)) },
            data,
            include: { customer: true }
        });

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update reservation' });
    }
};

export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.reservation.delete({
            where: { id: parseInt(String(id)) }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
};
