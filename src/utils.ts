import type { Reservation, Stop } from './types';

// Validation Functions

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if it has 10 or 11 digits (US format)
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
};

export const validateStops = (stops: Stop[]): { valid: boolean; error?: string } => {
    const validStops = stops.filter(stop => stop.location.trim() !== '');
    
    if (validStops.length < 2) {
        return { 
            valid: false, 
            error: 'Please provide at least a pickup and drop-off location (minimum 2 stops).' 
        };
    }
    
    return { valid: true };
};

export const validateDateTime = (date: string, time: string): { valid: boolean; error?: string } => {
    const now = new Date();
    const pickupDateTime = new Date(`${date}T${time}`);
    
    if (isNaN(pickupDateTime.getTime())) {
        return { valid: false, error: 'Invalid date or time format.' };
    }
    
    // Check if date is in the past (with 1 hour buffer)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    if (pickupDateTime < oneHourFromNow) {
        return { 
            valid: false, 
            error: 'Pickup time must be at least 1 hour from now.' 
        };
    }
    
    // Check if date is too far in the future (2 years)
    const twoYearsFromNow = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
    if (pickupDateTime > twoYearsFromNow) {
        return { 
            valid: false, 
            error: 'Pickup date cannot be more than 2 years in the future.' 
        };
    }
    
    return { valid: true };
};

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export const validateReservationForm = (
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    pickupDate: string,
    pickupTime: string,
    stops: Stop[],
    vehicle: string
): ValidationResult => {
    const errors: string[] = [];
    
    // Customer validation
    if (!customerName.trim()) {
        errors.push('Customer name is required.');
    }
    
    if (!customerEmail.trim()) {
        errors.push('Customer email is required.');
    } else if (!validateEmail(customerEmail)) {
        errors.push('Please enter a valid email address.');
    }
    
    if (!customerPhone.trim()) {
        errors.push('Customer phone is required.');
    } else if (!validatePhone(customerPhone)) {
        errors.push('Please enter a valid phone number (10-11 digits).');
    }
    
    // Date/Time validation
    if (!pickupDate) {
        errors.push('Pickup date is required.');
    }
    
    if (!pickupTime) {
        errors.push('Pickup time is required.');
    }
    
    if (pickupDate && pickupTime) {
        const dateTimeValidation = validateDateTime(pickupDate, pickupTime);
        if (!dateTimeValidation.valid && dateTimeValidation.error) {
            errors.push(dateTimeValidation.error);
        }
    }
    
    // Stops validation
    const stopsValidation = validateStops(stops);
    if (!stopsValidation.valid && stopsValidation.error) {
        errors.push(stopsValidation.error);
    }
    
    // Vehicle validation
    if (!vehicle) {
        errors.push('Please select a vehicle.');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

// Confirmation Number Generation
export const generateUniqueConfirmationNumber = (existingReservations: Reservation[]): string => {
    const existingNumbers = new Set(existingReservations.map(r => r.confirmationNumber));
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        // Use timestamp + random for better uniqueness
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        const confirmationNumber = `RES-${timestamp.slice(-3)}${random}`;
        
        if (!existingNumbers.has(confirmationNumber)) {
            return confirmationNumber;
        }
        
        attempts++;
    }
    
    // Fallback: use full timestamp if collision persists
    return `RES-${Date.now().toString(36).toUpperCase()}`;
};

// Local Storage Helpers
export const STORAGE_KEYS = {
    RESERVATIONS: 'velocityVvip_reservations',
    DRAFT_RESERVATION: 'velocityVvip_draftReservation',
    TEMPLATE_SETTINGS: 'confirmationTemplateSettings'
};

export const saveReservationsToLocalStorage = (reservations: Reservation[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    } catch (error) {
        console.error('Failed to save reservations to localStorage:', error);
    }
};

export const loadReservationsFromLocalStorage = (): Reservation[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load reservations from localStorage:', error);
    }
    return [];
};

export const saveDraftToLocalStorage = (draft: any): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.DRAFT_RESERVATION, JSON.stringify({
            ...draft,
            savedAt: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Failed to save draft to localStorage:', error);
    }
};

export const loadDraftFromLocalStorage = (): any | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_RESERVATION);
        if (stored) {
            const draft = JSON.parse(stored);
            // Check if draft is less than 24 hours old
            const savedAt = new Date(draft.savedAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                return draft;
            }
        }
    } catch (error) {
        console.error('Failed to load draft from localStorage:', error);
    }
    return null;
};

export const clearDraftFromLocalStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.DRAFT_RESERVATION);
    } catch (error) {
        console.error('Failed to clear draft from localStorage:', error);
    }
};

// Format Helpers
export const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length === 10) {
        return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    } else if (digitsOnly.length === 11) {
        return `+${digitsOnly[0]} (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
    }
    
    return phone;
};

export const formatDateTime = (date: string, time: string): string => {
    try {
        const dateObj = new Date(`${date}T${time}`);
        return dateObj.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return `${date} at ${time}`;
    }
};

// Check if form has unsaved changes
export const hasUnsavedChanges = (currentData: any, initialData: any): boolean => {
    return JSON.stringify(currentData) !== JSON.stringify(initialData);
};
